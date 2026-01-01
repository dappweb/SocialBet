// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title SoulTokenSale
 * @notice Public token sale contract for SOUL token fundraising
 * @dev Supports multiple sale phases, whitelist, and automatic refunds
 */
contract SoulTokenSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // ============ Constants ============
    
    /// @notice Sale phases
    enum SalePhase {
        NotStarted,
        PrivateSale,
        PublicSale,
        Ended,
        Refunded
    }

    // ============ State Variables ============
    
    /// @notice SOUL token being sold
    IERC20 public immutable soulToken;
    
    /// @notice Payment token (ETH or stablecoin)
    address public paymentToken; // address(0) for ETH
    
    /// @notice Current sale phase
    SalePhase public currentPhase;
    
    /// @notice Sale start time
    uint256 public saleStartTime;
    
    /// @notice Sale end time
    uint256 public saleEndTime;
    
    /// @notice Soft cap (minimum to raise)
    uint256 public softCap;
    
    /// @notice Hard cap (maximum to raise)
    uint256 public hardCap;
    
    /// @notice Total raised
    uint256 public totalRaised;
    
    /// @notice Total tokens sold
    uint256 public totalTokensSold;
    
    /// @notice Price per token (in payment token, with decimals)
    uint256 public tokenPrice;
    
    /// @notice Minimum purchase amount
    uint256 public minPurchase;
    
    /// @notice Maximum purchase amount per wallet
    uint256 public maxPurchase;
    
    /// @notice Whitelist enabled
    bool public whitelistEnabled;
    
    /// @notice Refund enabled (if soft cap not met)
    bool public refundEnabled;
    
    // ============ Mappings ============
    
    /// @notice Amount contributed by each address
    mapping(address => uint256) public contributions;
    
    /// @notice Tokens purchased by each address
    mapping(address => uint256) public tokensPurchased;
    
    /// @notice Whitelist status
    mapping(address => bool) public whitelist;
    
    /// @notice Refund claimed status
    mapping(address => bool) public refundClaimed;
    
    // ============ Events ============
    
    event SalePhaseChanged(SalePhase oldPhase, SalePhase newPhase);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 tokens);
    event WhitelistUpdated(address indexed user, bool status);
    event RefundClaimed(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event SaleEnded(uint256 totalRaised, uint256 totalTokensSold);
    
    // ============ Modifiers ============
    
    modifier onlyActiveSale() {
        require(
            currentPhase == SalePhase.PrivateSale || currentPhase == SalePhase.PublicSale,
            "Sale not active"
        );
        require(block.timestamp >= saleStartTime && block.timestamp <= saleEndTime, "Sale not in progress");
        _;
    }
    
    modifier onlyWhitelisted() {
        if (whitelistEnabled) {
            require(whitelist[msg.sender], "Not whitelisted");
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _soulToken,
        address _paymentToken,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _tokenPrice,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) {
        require(_soulToken != address(0), "Invalid token address");
        require(_softCap > 0 && _hardCap > _softCap, "Invalid caps");
        require(_tokenPrice > 0, "Invalid price");
        
        soulToken = IERC20(_soulToken);
        paymentToken = _paymentToken;
        softCap = _softCap;
        hardCap = _hardCap;
        tokenPrice = _tokenPrice;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        currentPhase = SalePhase.NotStarted;
    }
    
    // ============ Public Functions ============
    
    /**
     * @notice Purchase SOUL tokens
     * @param _amount Amount of payment token to spend
     */
    function buyTokens(uint256 _amount) external payable nonReentrant onlyActiveSale onlyWhitelisted {
        require(_amount >= minPurchase, "Amount below minimum");
        require(totalRaised + _amount <= hardCap, "Hard cap reached");
        
        uint256 paymentAmount = paymentToken == address(0) ? msg.value : _amount;
        require(paymentAmount > 0, "Invalid amount");
        
        uint256 userContribution = contributions[msg.sender] + paymentAmount;
        require(userContribution <= maxPurchase, "Exceeds max purchase");
        
        // Calculate tokens to receive
        uint256 tokensToReceive = (paymentAmount * 10**18) / tokenPrice;
        require(tokensToReceive > 0, "Insufficient amount for tokens");
        
        // Check contract has enough tokens
        require(soulToken.balanceOf(address(this)) >= totalTokensSold + tokensToReceive, "Insufficient tokens");
        
        // Transfer payment
        if (paymentToken == address(0)) {
            require(msg.value == paymentAmount, "ETH amount mismatch");
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), paymentAmount);
        }
        
        // Update state
        contributions[msg.sender] += paymentAmount;
        tokensPurchased[msg.sender] += tokensToReceive;
        totalRaised += paymentAmount;
        totalTokensSold += tokensToReceive;
        
        // Transfer tokens to buyer
        soulToken.safeTransfer(msg.sender, tokensToReceive);
        
        emit TokensPurchased(msg.sender, paymentAmount, tokensToReceive);
        
        // Check if hard cap reached
        if (totalRaised >= hardCap) {
            _endSale();
        }
    }
    
    /**
     * @notice Claim refund if soft cap not met
     */
    function claimRefund() external nonReentrant {
        require(refundEnabled, "Refunds not enabled");
        require(contributions[msg.sender] > 0, "No contribution");
        require(!refundClaimed[msg.sender], "Refund already claimed");
        
        uint256 refundAmount = contributions[msg.sender];
        refundClaimed[msg.sender] = true;
        
        if (paymentToken == address(0)) {
            payable(msg.sender).sendValue(refundAmount);
        } else {
            IERC20(paymentToken).safeTransfer(msg.sender, refundAmount);
        }
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Start the sale
     * @param _phase Sale phase to start
     * @param _duration Sale duration in seconds
     */
    function startSale(SalePhase _phase, uint256 _duration) external onlyOwner {
        require(currentPhase == SalePhase.NotStarted, "Sale already started");
        require(_phase == SalePhase.PrivateSale || _phase == SalePhase.PublicSale, "Invalid phase");
        
        saleStartTime = block.timestamp;
        saleEndTime = block.timestamp + _duration;
        currentPhase = _phase;
        
        emit SalePhaseChanged(SalePhase.NotStarted, _phase);
    }
    
    /**
     * @notice Change sale phase
     */
    function changePhase(SalePhase _newPhase) external onlyOwner {
        SalePhase oldPhase = currentPhase;
        currentPhase = _newPhase;
        emit SalePhaseChanged(oldPhase, _newPhase);
    }
    
    /**
     * @notice End the sale
     */
    function endSale() external onlyOwner {
        _endSale();
    }
    
    /**
     * @notice Enable refunds (if soft cap not met)
     */
    function enableRefunds() external onlyOwner {
        require(currentPhase == SalePhase.Ended, "Sale not ended");
        require(totalRaised < softCap, "Soft cap met");
        refundEnabled = true;
    }
    
    /**
     * @notice Withdraw raised funds (only if soft cap met)
     */
    function withdrawFunds() external onlyOwner {
        require(currentPhase == SalePhase.Ended, "Sale not ended");
        require(totalRaised >= softCap, "Soft cap not met");
        require(!refundEnabled, "Refunds enabled");
        
        uint256 amount = paymentToken == address(0) 
            ? address(this).balance 
            : IERC20(paymentToken).balanceOf(address(this));
        
        if (paymentToken == address(0)) {
            payable(owner()).sendValue(amount);
        } else {
            IERC20(paymentToken).safeTransfer(owner(), amount);
        }
        
        emit FundsWithdrawn(owner(), amount);
    }
    
    /**
     * @notice Add/remove whitelist addresses
     */
    function updateWhitelist(address[] calldata _addresses, bool _status) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = _status;
            emit WhitelistUpdated(_addresses[i], _status);
        }
    }
    
    /**
     * @notice Toggle whitelist requirement
     */
    function setWhitelistEnabled(bool _enabled) external onlyOwner {
        whitelistEnabled = _enabled;
    }
    
    /**
     * @notice Withdraw unsold tokens
     */
    function withdrawUnsoldTokens() external onlyOwner {
        require(currentPhase == SalePhase.Ended, "Sale not ended");
        uint256 unsold = soulToken.balanceOf(address(this));
        soulToken.safeTransfer(owner(), unsold);
    }
    
    // ============ Internal Functions ============
    
    function _endSale() internal {
        currentPhase = SalePhase.Ended;
        emit SaleEnded(totalRaised, totalTokensSold);
        
        if (totalRaised < softCap) {
            refundEnabled = true;
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get sale progress percentage
     */
    function getSaleProgress() external view returns (uint256) {
        if (hardCap == 0) return 0;
        return (totalRaised * 100) / hardCap;
    }
    
    /**
     * @notice Check if address can purchase
     */
    function canPurchase(address _user) external view returns (bool) {
        if (whitelistEnabled && !whitelist[_user]) return false;
        if (currentPhase != SalePhase.PrivateSale && currentPhase != SalePhase.PublicSale) return false;
        if (block.timestamp < saleStartTime || block.timestamp > saleEndTime) return false;
        if (totalRaised >= hardCap) return false;
        return true;
    }
    
    /**
     * @notice Get tokens for amount
     */
    function getTokensForAmount(uint256 _amount) external view returns (uint256) {
        return (_amount * 10**18) / tokenPrice;
    }
}

