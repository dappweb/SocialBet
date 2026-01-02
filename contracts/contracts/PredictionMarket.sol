// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PredictionMarket
 * @notice A decentralized prediction market for KOL intent predictions
 * @dev Supports YES/NO binary markets with automatic market maker (AMM) pricing
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    /// @notice Platform fee percentage (in basis points, 250 = 2.5%)
    uint256 public constant PLATFORM_FEE_BPS = 250;
    
    /// @notice Minimum bet amount (in payment token, with decimals)
    uint256 public constant MIN_BET_AMOUNT = 1e18; // 1 token (assuming 18 decimals)
    
    /// @notice Maximum bet amount (in payment token, with decimals)
    uint256 public constant MAX_BET_AMOUNT = 1000000e18; // 1M tokens

    // ============ Enums ============
    
    enum MarketStatus {
        Open,
        Closed,
        Resolved,
        Cancelled
    }
    
    enum Outcome {
        Yes,
        No,
        Invalid
    }

    // ============ Structs ============
    
    struct Market {
        uint256 id;
        address creator;
        string question;
        string category;
        uint256 endDate;
        uint256 yesPool;      // Total YES bets
        uint256 noPool;       // Total NO bets
        uint256 totalVolume;
        MarketStatus status;
        Outcome outcome;
        bool isResolved;
        uint256 resolutionTime;
    }
    
    struct Bet {
        address bettor;
        uint256 amount;
        bool side; // true = YES, false = NO
        uint256 priceAtBet; // Price at time of bet (0-10000, representing 0-100%)
        uint256 timestamp;
        bool claimed;
    }

    // ============ State Variables ============
    
    /// @notice Payment token (USDC or native ETH)
    IERC20 public paymentToken;
    
    /// @notice Use native ETH if paymentToken is address(0)
    bool public useNativeToken;
    
    /// @notice Platform fee recipient
    address public platformFeeRecipient;
    
    /// @notice Market counter
    uint256 public marketCounter;
    
    /// @notice Markets mapping
    mapping(uint256 => Market) public markets;
    
    /// @notice User bets: marketId => bettor => bet[]
    mapping(uint256 => mapping(address => Bet[])) public userBets;
    
    /// @notice Market bet count
    mapping(uint256 => uint256) public marketBetCount;
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        string category,
        uint256 endDate
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        bool side,
        uint256 amount,
        uint256 priceAtBet,
        uint256 yesPool,
        uint256 noPool
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        Outcome outcome,
        uint256 resolutionTime
    );
    
    event BetClaimed(
        uint256 indexed marketId,
        address indexed bettor,
        uint256 amount,
        uint256 payout
    );
    
    event MarketClosed(uint256 indexed marketId);

    // ============ Constructor ============
    
    constructor(
        address _paymentToken,
        address _platformFeeRecipient,
        address _owner
    ) Ownable(_owner) {
        require(_platformFeeRecipient != address(0), "Invalid fee recipient");
        paymentToken = IERC20(_paymentToken);
        useNativeToken = (_paymentToken == address(0));
        platformFeeRecipient = _platformFeeRecipient;
    }

    // ============ Modifiers ============
    
    modifier onlyOpenMarket(uint256 _marketId) {
        require(markets[_marketId].status == MarketStatus.Open, "Market not open");
        require(block.timestamp < markets[_marketId].endDate, "Market expired");
        _;
    }
    
    modifier onlyResolvedMarket(uint256 _marketId) {
        require(markets[_marketId].isResolved, "Market not resolved");
        _;
    }

    // ============ Public Functions ============
    
    /**
     * @notice Create a new prediction market
     * @param _question The prediction question
     * @param _category Market category
     * @param _endDate Market end date (timestamp)
     * @param _initialLiquidity Initial liquidity for YES side
     */
    function createMarket(
        string memory _question,
        string memory _category,
        uint256 _endDate,
        uint256 _initialLiquidity
    ) external payable nonReentrant returns (uint256) {
        require(bytes(_question).length > 0, "Empty question");
        require(_endDate > block.timestamp, "Invalid end date");
        require(_initialLiquidity >= MIN_BET_AMOUNT, "Insufficient liquidity");
        
        uint256 marketId = ++marketCounter;
        
        // Transfer initial liquidity
        if (useNativeToken) {
            require(msg.value >= _initialLiquidity, "Insufficient ETH");
            markets[marketId].yesPool = msg.value;
        } else {
            paymentToken.safeTransferFrom(msg.sender, address(this), _initialLiquidity);
            markets[marketId].yesPool = _initialLiquidity;
        }
        
        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            question: _question,
            category: _category,
            endDate: _endDate,
            yesPool: _initialLiquidity,
            noPool: 0,
            totalVolume: _initialLiquidity,
            status: MarketStatus.Open,
            outcome: Outcome.Invalid,
            isResolved: false,
            resolutionTime: 0
        });
        
        emit MarketCreated(marketId, msg.sender, _question, _category, _endDate);
        
        return marketId;
    }
    
    /**
     * @notice Place a bet on a market
     * @param _marketId Market ID
     * @param _side true for YES, false for NO
     * @param _amount Bet amount
     */
    function placeBet(
        uint256 _marketId,
        bool _side,
        uint256 _amount
    ) external payable nonReentrant onlyOpenMarket(_marketId) {
        require(_amount >= MIN_BET_AMOUNT, "Amount too small");
        require(_amount <= MAX_BET_AMOUNT, "Amount too large");
        
        Market storage market = markets[_marketId];
        
        // Transfer payment
        uint256 paymentAmount = useNativeToken ? msg.value : _amount;
        require(paymentAmount == _amount || (useNativeToken && msg.value == _amount), "Amount mismatch");
        
        if (!useNativeToken) {
            paymentToken.safeTransferFrom(msg.sender, address(this), _amount);
        }
        
        // Calculate price using AMM formula: price = pool / (pool + otherPool)
        uint256 priceBps;
        if (_side) {
            // Betting YES
            priceBps = (market.yesPool * 10000) / (market.yesPool + market.noPool + 1);
            market.yesPool += _amount;
        } else {
            // Betting NO
            priceBps = (market.noPool * 10000) / (market.yesPool + market.noPool + 1);
            market.noPool += _amount;
        }
        
        // Calculate platform fee
        uint256 fee = (_amount * PLATFORM_FEE_BPS) / 10000;
        uint256 netAmount = _amount - fee;
        
        // Add net amount to pool (fee goes to platform)
        if (_side) {
            market.yesPool = market.yesPool - fee;
        } else {
            market.noPool = market.noPool - fee;
        }
        
        // Transfer fee to platform
        if (useNativeToken) {
            (bool success, ) = platformFeeRecipient.call{value: fee}("");
            require(success, "Fee transfer failed");
        } else {
            paymentToken.safeTransfer(platformFeeRecipient, fee);
        }
        
        // Record bet
        Bet memory newBet = Bet({
            bettor: msg.sender,
            amount: netAmount,
            side: _side,
            priceAtBet: priceBps,
            timestamp: block.timestamp,
            claimed: false
        });
        
        userBets[_marketId][msg.sender].push(newBet);
        marketBetCount[_marketId]++;
        market.totalVolume += _amount;
        
        emit BetPlaced(_marketId, msg.sender, _side, _amount, priceBps, market.yesPool, market.noPool);
    }
    
    /**
     * @notice Resolve a market (only owner or creator)
     * @param _marketId Market ID
     * @param _outcome Market outcome (Yes, No, or Invalid)
     */
    function resolveMarket(
        uint256 _marketId,
        Outcome _outcome
    ) external onlyOpenMarket(_marketId) {
        Market storage market = markets[_marketId];
        
        require(
            msg.sender == owner() || msg.sender == market.creator,
            "Not authorized"
        );
        require(block.timestamp >= market.endDate, "Market not expired");
        require(_outcome != Outcome.Invalid || market.status == MarketStatus.Cancelled, "Invalid outcome");
        
        market.status = MarketStatus.Resolved;
        market.outcome = _outcome;
        market.isResolved = true;
        market.resolutionTime = block.timestamp;
        
        emit MarketResolved(_marketId, _outcome, block.timestamp);
    }
    
    /**
     * @notice Claim winnings from resolved market
     * @param _marketId Market ID
     */
    function claimWinnings(uint256 _marketId) external nonReentrant onlyResolvedMarket(_marketId) {
        Market storage market = markets[_marketId];
        require(market.outcome != Outcome.Invalid, "Market invalid");
        
        Bet[] storage bets = userBets[_marketId][msg.sender];
        require(bets.length > 0, "No bets found");
        
        uint256 totalPayout = 0;
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].claimed) continue;
            
            bool won = (market.outcome == Outcome.Yes && bets[i].side) ||
                      (market.outcome == Outcome.No && !bets[i].side);
            
            if (won) {
                // Calculate payout using AMM: payout = (totalPool * betAmount) / losingPool
                uint256 winningPool = market.outcome == Outcome.Yes ? market.yesPool : market.noPool;
                uint256 losingPool = market.outcome == Outcome.Yes ? market.noPool : market.yesPool;
                
                if (losingPool > 0) {
                    uint256 payout = (winningPool * bets[i].amount) / losingPool;
                    totalPayout += payout;
                } else {
                    // If no losing bets, return original bet
                    totalPayout += bets[i].amount;
                }
                
                bets[i].claimed = true;
            }
        }
        
        require(totalPayout > 0, "No winnings to claim");
        
        // Transfer payout
        if (useNativeToken) {
            (bool success, ) = msg.sender.call{value: totalPayout}("");
            require(success, "Transfer failed");
        } else {
            paymentToken.safeTransfer(msg.sender, totalPayout);
        }
        
        emit BetClaimed(_marketId, msg.sender, totalPayout, totalPayout);
    }
    
    /**
     * @notice Close a market (emergency function, owner only)
     * @param _marketId Market ID
     */
    function closeMarket(uint256 _marketId) external onlyOwner {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        
        market.status = MarketStatus.Closed;
        emit MarketClosed(_marketId);
    }
    
    /**
     * @notice Cancel a market (owner only, before end date)
     * @param _marketId Market ID
     */
    function cancelMarket(uint256 _marketId) external onlyOwner {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        require(block.timestamp < market.endDate, "Market expired");
        
        market.status = MarketStatus.Cancelled;
        market.outcome = Outcome.Invalid;
        market.isResolved = true;
        market.resolutionTime = block.timestamp;
        
        emit MarketResolved(_marketId, Outcome.Invalid, block.timestamp);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get market details
     */
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
    
    /**
     * @notice Get user bets for a market
     */
    function getUserBets(uint256 _marketId, address _user) external view returns (Bet[] memory) {
        return userBets[_marketId][_user];
    }
    
    /**
     * @notice Get current market prices (in basis points, 0-10000)
     */
    function getMarketPrices(uint256 _marketId) external view returns (uint256 yesPriceBps, uint256 noPriceBps) {
        Market memory market = markets[_marketId];
        uint256 totalPool = market.yesPool + market.noPool;
        
        if (totalPool == 0) {
            return (5000, 5000); // 50/50 if no liquidity
        }
        
        yesPriceBps = (market.yesPool * 10000) / totalPool;
        noPriceBps = (market.noPool * 10000) / totalPool;
    }
    
    /**
     * @notice Get total number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return marketCounter;
    }
    
    /**
     * @notice Calculate potential payout for a bet
     * @param _marketId Market ID
     * @param _side Bet side (true = YES, false = NO)
     * @param _amount Bet amount
     */
    function calculatePayout(
        uint256 _marketId,
        bool _side,
        uint256 _amount
    ) external view returns (uint256) {
        Market memory market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        
        uint256 netAmount = _amount - (_amount * PLATFORM_FEE_BPS / 10000);
        uint256 winningPool = _side ? market.yesPool + netAmount : market.noPool + netAmount;
        uint256 losingPool = _side ? market.noPool : market.yesPool;
        
        if (losingPool == 0) {
            return netAmount; // No losing bets, return original
        }
        
        return (winningPool * netAmount) / losingPool;
    }
    
    /**
     * @notice Get user's claimable amount for a resolved market
     * @param _marketId Market ID
     * @param _user User address
     */
    function getClaimableAmount(uint256 _marketId, address _user) external view returns (uint256) {
        Market memory market = markets[_marketId];
        require(market.isResolved, "Market not resolved");
        require(market.outcome != Outcome.Invalid, "Market invalid");
        
        Bet[] memory bets = userBets[_marketId][_user];
        uint256 totalPayout = 0;
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].claimed) continue;
            
            bool won = (market.outcome == Outcome.Yes && bets[i].side) ||
                      (market.outcome == Outcome.No && !bets[i].side);
            
            if (won) {
                uint256 winningPool = market.outcome == Outcome.Yes ? market.yesPool : market.noPool;
                uint256 losingPool = market.outcome == Outcome.Yes ? market.noPool : market.yesPool;
                
                if (losingPool > 0) {
                    uint256 payout = (winningPool * bets[i].amount) / losingPool;
                    totalPayout += payout;
                } else {
                    totalPayout += bets[i].amount;
                }
            }
        }
        
        return totalPayout;
    }
}

