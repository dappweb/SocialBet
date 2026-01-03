// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title SoulCast Token (SOUL)
 * @notice The native utility token of the SoulCast KOL Intent Prediction Market platform
 * @dev ERC-20 token with:
 *      - Total supply: 2.1 billion tokens
 *      - Issuance fee burn mechanism
 *      - Staking functionality
 *      - Role-based access control for governance
 *      - EIP-2612 permit for gasless approvals
 *      - UUPS Upgradeable pattern
 */
contract SoulCastToken is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable, 
    ERC20PermitUpgradeable, 
    ERC20VotesUpgradeable,
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    
    // ============ Constants ============
    
    /// @notice Total supply: 2.1 billion tokens (with 18 decimals)
    uint256 public constant TOTAL_SUPPLY = 2_100_000_000 * 10**18;
    
    /// @notice Issuance fee percentage (in basis points, 100 = 1%)
    uint256 public issuanceFeeBps;
    
    /// @notice Maximum issuance fee (5%)
    uint256 public constant MAX_ISSUANCE_FEE_BPS = 500;
    
    // ============ Roles ============
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant STAKING_ROLE = keccak256("STAKING_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // ============ Token Distribution Allocations ============
    
    struct Allocation {
        string name;
        uint256 amount;
        uint256 released;
        address beneficiary;
        uint256 vestingStart;
        uint256 vestingDuration;
    }
    
    /// @notice Distribution allocations based on white paper
    mapping(uint256 => Allocation) public allocations;
    uint256 public allocationCount;
    
    // ============ Staking ============
    
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaim;
    }
    
    /// @notice User staking information
    mapping(address => StakeInfo) public stakes;
    
    /// @notice Total staked tokens
    uint256 public totalStaked;
    
    /// @notice Annual staking reward rate in basis points (500 = 5%)
    uint256 public stakingRewardRateBps;
    
    /// @notice Staking rewards pool
    uint256 public stakingRewardsPool;
    
    // ============ Burn Tracking ============
    
    /// @notice Total tokens burned through issuance fees
    uint256 public totalIssuanceFeeBurned;
    
    /// @notice Total tokens burned overall
    uint256 public totalBurned;
    
    // ============ Events ============
    
    event TokensStaked(address indexed user, uint256 amount, uint256 timestamp);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards, uint256 timestamp);
    event StakingRewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event IssuanceFeeBurned(address indexed from, uint256 feeAmount, uint256 netAmount);
    event IssuanceFeeUpdated(uint256 oldFee, uint256 newFee);
    event AllocationCreated(uint256 indexed id, string name, uint256 amount, address beneficiary);
    event AllocationReleased(uint256 indexed id, uint256 amount);
    event StakingRewardRateUpdated(uint256 oldRate, uint256 newRate);
    event StakingRewardsPoolFunded(uint256 amount);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initialize the SOUL token
     * @param _admin Address to receive initial admin role and tokens for distribution
     */
    function initialize(address _admin) public initializer {
        require(_admin != address(0), "Invalid admin");
        
        __ERC20_init("SoulCast Token", "SOUL");
        __ERC20Burnable_init();
        __ERC20Permit_init("SoulCast Token");
        __ERC20Votes_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        // Initialize state variables
        issuanceFeeBps = 100; // 1% default
        stakingRewardRateBps = 500; // 5% default
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);
        _grantRole(FEE_MANAGER_ROLE, _admin);
        _grantRole(STAKING_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        
        // Mint total supply to admin for distribution
        _mint(_admin, TOTAL_SUPPLY);
        
        // Initialize allocations based on white paper
        _initializeAllocations(_admin);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    // ============ Allocation Functions ============
    
    /**
     * @dev Initialize token distribution allocations based on white paper
     */
    function _initializeAllocations(address _admin) internal {
        // Community Rewards & Airdrops: 30% = 630M
        _createAllocation("Community Rewards & Airdrops", 630_000_000 * 10**18, _admin, 0, 0);
        
        // Intent Prediction Rewards: 25% = 525M
        _createAllocation("Intent Prediction Rewards", 525_000_000 * 10**18, _admin, 0, 0);
        
        // KOL & Creator Incentives: 15% = 315M
        _createAllocation("KOL & Creator Incentives", 315_000_000 * 10**18, _admin, 0, 0);
        
        // AI Avatar Development Fund: 10% = 210M
        _createAllocation("AI Avatar Development Fund", 210_000_000 * 10**18, _admin, 0, 0);
        
        // Liquidity Provision Rewards: 8% = 168M
        _createAllocation("Liquidity Provision Rewards", 168_000_000 * 10**18, _admin, 0, 0);
        
        // Platform Operations Reserve: 7% = 147M
        _createAllocation("Platform Operations Reserve", 147_000_000 * 10**18, _admin, 0, 0);
        
        // Team & Advisors (Vested 4 years): 4% = 84M
        _createAllocation("Team & Advisors", 84_000_000 * 10**18, _admin, block.timestamp, 4 * 365 days);
        
        // Marketing & Partnerships: 1% = 21M
        _createAllocation("Marketing & Partnerships", 21_000_000 * 10**18, _admin, 0, 0);
    }
    
    /**
     * @dev Create a new allocation
     */
    function _createAllocation(
        string memory _name,
        uint256 _amount,
        address _beneficiary,
        uint256 _vestingStart,
        uint256 _vestingDuration
    ) internal {
        allocations[allocationCount] = Allocation({
            name: _name,
            amount: _amount,
            released: 0,
            beneficiary: _beneficiary,
            vestingStart: _vestingStart,
            vestingDuration: _vestingDuration
        });
        
        emit AllocationCreated(allocationCount, _name, _amount, _beneficiary);
        allocationCount++;
    }
    
    /**
     * @notice Get releasable amount for a vested allocation
     * @param _allocationId The allocation ID
     */
    function getReleasableAmount(uint256 _allocationId) public view returns (uint256) {
        Allocation storage allocation = allocations[_allocationId];
        
        if (allocation.vestingDuration == 0) {
            // No vesting, all available
            return allocation.amount - allocation.released;
        }
        
        if (block.timestamp < allocation.vestingStart) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - allocation.vestingStart;
        uint256 vested;
        
        if (elapsed >= allocation.vestingDuration) {
            vested = allocation.amount;
        } else {
            vested = (allocation.amount * elapsed) / allocation.vestingDuration;
        }
        
        return vested - allocation.released;
    }
    
    // ============ Issuance Fee (Burn on Transfer) ============
    
    /**
     * @notice Transfer tokens with issuance fee burn
     * @dev Issued tokens are redeemed and destroyed by SoulCast as issuance fees
     * @param to Recipient address
     * @param amount Amount to transfer (before fee)
     */
    function transferWithIssuanceFee(address to, uint256 amount) external nonReentrant returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Amount must be positive");
        
        uint256 fee = (amount * issuanceFeeBps) / 10000;
        uint256 netAmount = amount - fee;
        
        // Burn the fee
        if (fee > 0) {
            _burn(msg.sender, fee);
            totalIssuanceFeeBurned += fee;
            totalBurned += fee;
        }
        
        // Transfer net amount
        _transfer(msg.sender, to, netAmount);
        
        emit IssuanceFeeBurned(msg.sender, fee, netAmount);
        
        return true;
    }
    
    /**
     * @notice Update issuance fee
     * @param newFeeBps New fee in basis points
     */
    function setIssuanceFee(uint256 newFeeBps) external onlyRole(FEE_MANAGER_ROLE) {
        require(newFeeBps <= MAX_ISSUANCE_FEE_BPS, "Fee exceeds maximum");
        
        uint256 oldFee = issuanceFeeBps;
        issuanceFeeBps = newFeeBps;
        
        emit IssuanceFeeUpdated(oldFee, newFeeBps);
    }
    
    // ============ Staking Functions ============
    
    /**
     * @notice Stake tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Claim any pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        stakes[msg.sender].lastRewardClaim = block.timestamp;
        
        totalStaked += amount;
        
        emit TokensStaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        // Calculate and claim rewards
        uint256 rewards = _claimRewards(msg.sender);
        
        // Update stake info
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount, rewards, block.timestamp);
    }
    
    /**
     * @notice Claim staking rewards without unstaking
     */
    function claimRewards() external nonReentrant returns (uint256) {
        require(stakes[msg.sender].amount > 0, "No stake found");
        return _claimRewards(msg.sender);
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user) internal returns (uint256) {
        uint256 rewards = calculateRewards(user);
        
        if (rewards > 0 && rewards <= stakingRewardsPool) {
            stakingRewardsPool -= rewards;
            _transfer(address(this), user, rewards);
            
            emit StakingRewardsClaimed(user, rewards, block.timestamp);
        }
        
        stakes[user].lastRewardClaim = block.timestamp;
        return rewards;
    }
    
    /**
     * @notice Calculate pending rewards for a user
     * @param user Address to check
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user];
        
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        uint256 duration = block.timestamp - stakeInfo.lastRewardClaim;
        
        // Annual reward = staked * rate / 10000
        // Per second reward = annual / (365 * 24 * 3600)
        uint256 annualReward = (stakeInfo.amount * stakingRewardRateBps) / 10000;
        uint256 rewards = (annualReward * duration) / (365 days);
        
        return rewards;
    }
    
    /**
     * @notice Fund the staking rewards pool
     * @param amount Amount to add to rewards pool
     */
    function fundStakingRewards(uint256 amount) external onlyRole(STAKING_ROLE) {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakingRewardsPool += amount;
        
        emit StakingRewardsPoolFunded(amount);
    }
    
    /**
     * @notice Update staking reward rate
     * @param newRateBps New rate in basis points
     */
    function setStakingRewardRate(uint256 newRateBps) external onlyRole(STAKING_ROLE) {
        require(newRateBps <= 2000, "Rate too high"); // Max 20%
        
        uint256 oldRate = stakingRewardRateBps;
        stakingRewardRateBps = newRateBps;
        
        emit StakingRewardRateUpdated(oldRate, newRateBps);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Burn tokens (for authorized burners)
     * @param amount Amount to burn
     */
    function adminBurn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
        totalBurned += amount;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get staking info for a user
     * @param user Address to query
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakedAt,
        uint256 pendingRewards,
        uint256 lastClaim
    ) {
        StakeInfo storage info = stakes[user];
        return (
            info.amount,
            info.stakedAt,
            calculateRewards(user),
            info.lastRewardClaim
        );
    }
    
    /**
     * @notice Get token statistics
     */
    function getTokenStats() external view returns (
        uint256 _totalSupply,
        uint256 _circulatingSupply,
        uint256 _totalStaked,
        uint256 _totalBurned,
        uint256 _issuanceFeeBurned,
        uint256 _stakingRewardsPool
    ) {
        return (
            TOTAL_SUPPLY,
            totalSupply(),
            totalStaked,
            totalBurned,
            totalIssuanceFeeBurned,
            stakingRewardsPool
        );
    }
    
    /**
     * @notice Get allocation info
     * @param _id Allocation ID
     */
    function getAllocation(uint256 _id) external view returns (
        string memory name,
        uint256 amount,
        uint256 released,
        address beneficiary,
        uint256 releasable
    ) {
        Allocation storage a = allocations[_id];
        return (
            a.name,
            a.amount,
            a.released,
            a.beneficiary,
            getReleasableAmount(_id)
        );
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
