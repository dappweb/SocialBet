// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SoulLiquidityManager
 * @notice Manages liquidity pool creation, locking, and LP token staking
 * @dev Supports Uniswap V2/V3, PancakeSwap, and other DEX protocols
 */
contract SoulLiquidityManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct LiquidityPool {
        address poolAddress;            // DEX pool address
        address token0;                 // First token (usually SOUL)
        address token1;                 // Second token (usually ETH/USDC)
        uint256 token0Amount;          // Amount of token0 added
        uint256 token1Amount;          // Amount of token1 added
        uint256 lpTokens;              // LP tokens received
        uint256 lockUntil;              // Lock expiration timestamp
        bool locked;                   // Whether pool is locked
        string dexName;                // DEX name (Uniswap, PancakeSwap, etc.)
    }
    
    struct LPStake {
        address staker;                 // Staker address
        uint256 lpTokenAmount;          // Amount of LP tokens staked
        uint256 stakedAt;               // Staking timestamp
        uint256 rewardsEarned;          // Total rewards earned
        uint256 lastRewardClaim;        // Last reward claim timestamp
    }

    // ============ State Variables ============
    
    /// @notice SOUL token
    IERC20 public immutable soulToken;
    
    /// @notice LP token interface (Uniswap V2 style)
    IERC20 public lpToken;
    
    /// @notice Total liquidity pools created
    uint256 public poolCount;
    
    /// @notice Mapping of pool ID to liquidity pool
    mapping(uint256 => LiquidityPool) public liquidityPools;
    
    /// @notice Mapping of staker to LP stake info
    mapping(address => LPStake) public lpStakes;
    
    /// @notice Total LP tokens staked
    uint256 public totalLPStaked;
    
    /// @notice Staking rewards pool
    uint256 public stakingRewardsPool;
    
    /// @notice Annual staking reward rate (basis points)
    uint256 public stakingRewardRateBps;
    
    /// @notice Minimum lock duration (in seconds)
    uint256 public minLockDuration;
    
    // ============ Events ============
    
    event LiquidityPoolCreated(
        uint256 indexed poolId,
        address indexed poolAddress,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1,
        uint256 lpTokens,
        string dexName
    );
    
    event LiquidityLocked(
        uint256 indexed poolId,
        uint256 lockUntil
    );
    
    event LiquidityUnlocked(
        uint256 indexed poolId
    );
    
    event LPStaked(
        address indexed staker,
        uint256 amount
    );
    
    event LPUnstaked(
        address indexed staker,
        uint256 amount
    );
    
    event RewardsClaimed(
        address indexed staker,
        uint256 amount
    );
    
    event RewardsPoolFunded(
        uint256 amount
    );
    
    // ============ Constructor ============
    
    constructor(address _soulToken, address _owner) Ownable(_owner) {
        require(_soulToken != address(0), "Invalid token address");
        soulToken = IERC20(_soulToken);
        stakingRewardRateBps = 1000; // 10% default APY
        minLockDuration = 30 days;
    }
    
    // ============ Public Functions ============
    
    /**
     * @notice Stake LP tokens to earn rewards
     * @param _lpTokenAmount Amount of LP tokens to stake
     */
    function stakeLP(uint256 _lpTokenAmount) external nonReentrant {
        require(_lpTokenAmount > 0, "Invalid amount");
        require(lpToken.balanceOf(msg.sender) >= _lpTokenAmount, "Insufficient LP tokens");
        
        // Claim existing rewards first
        if (lpStakes[msg.sender].lpTokenAmount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer LP tokens
        lpToken.safeTransferFrom(msg.sender, address(this), _lpTokenAmount);
        
        // Update stake info
        LPStake storage stake = lpStakes[msg.sender];
        stake.staker = msg.sender;
        stake.lpTokenAmount += _lpTokenAmount;
        stake.stakedAt = block.timestamp;
        stake.lastRewardClaim = block.timestamp;
        
        totalLPStaked += _lpTokenAmount;
        
        emit LPStaked(msg.sender, _lpTokenAmount);
    }
    
    /**
     * @notice Unstake LP tokens
     * @param _lpTokenAmount Amount to unstake
     */
    function unstakeLP(uint256 _lpTokenAmount) external nonReentrant {
        LPStake storage stake = lpStakes[msg.sender];
        require(stake.lpTokenAmount >= _lpTokenAmount, "Insufficient staked");
        
        // Claim rewards
        _claimRewards(msg.sender);
        
        // Update stake
        stake.lpTokenAmount -= _lpTokenAmount;
        totalLPStaked -= _lpTokenAmount;
        
        // Transfer LP tokens back
        lpToken.safeTransfer(msg.sender, _lpTokenAmount);
        
        emit LPUnstaked(msg.sender, _lpTokenAmount);
    }
    
    /**
     * @notice Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Record liquidity pool creation (called after DEX interaction)
     * @param _poolAddress DEX pool address
     * @param _token0 First token address
     * @param _token1 Second token address
     * @param _amount0 Amount of token0
     * @param _amount1 Amount of token1
     * @param _lpTokens LP tokens received
     * @param _dexName DEX name
     */
    function recordLiquidityPool(
        address _poolAddress,
        address _token0,
        address _token1,
        uint256 _amount0,
        uint256 _amount1,
        uint256 _lpTokens,
        string memory _dexName
    ) external onlyOwner returns (uint256) {
        uint256 poolId = poolCount;
        liquidityPools[poolId] = LiquidityPool({
            poolAddress: _poolAddress,
            token0: _token0,
            token1: _token1,
            token0Amount: _amount0,
            token1Amount: _amount1,
            lpTokens: _lpTokens,
            lockUntil: 0,
            locked: false,
            dexName: _dexName
        });
        
        poolCount++;
        
        emit LiquidityPoolCreated(
            poolId,
            _poolAddress,
            _token0,
            _token1,
            _amount0,
            _amount1,
            _lpTokens,
            _dexName
        );
        
        return poolId;
    }
    
    /**
     * @notice Lock liquidity pool
     * @param _poolId Pool ID
     * @param _lockDuration Lock duration in seconds
     */
    function lockLiquidity(uint256 _poolId, uint256 _lockDuration) external onlyOwner {
        require(_poolId < poolCount, "Invalid pool ID");
        require(_lockDuration >= minLockDuration, "Lock duration too short");
        
        LiquidityPool storage pool = liquidityPools[_poolId];
        require(!pool.locked, "Already locked");
        
        pool.locked = true;
        pool.lockUntil = block.timestamp + _lockDuration;
        
        emit LiquidityLocked(_poolId, pool.lockUntil);
    }
    
    /**
     * @notice Unlock liquidity pool (after lock expires)
     * @param _poolId Pool ID
     */
    function unlockLiquidity(uint256 _poolId) external onlyOwner {
        require(_poolId < poolCount, "Invalid pool ID");
        
        LiquidityPool storage pool = liquidityPools[_poolId];
        require(pool.locked, "Not locked");
        require(block.timestamp >= pool.lockUntil, "Lock not expired");
        
        pool.locked = false;
        
        emit LiquidityUnlocked(_poolId);
    }
    
    /**
     * @notice Set LP token address
     */
    function setLPToken(address _lpToken) external onlyOwner {
        require(_lpToken != address(0), "Invalid address");
        lpToken = IERC20(_lpToken);
    }
    
    /**
     * @notice Fund staking rewards pool
     * @param _amount Amount of SOUL tokens to add
     */
    function fundRewardsPool(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Invalid amount");
        require(soulToken.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        soulToken.safeTransferFrom(msg.sender, address(this), _amount);
        stakingRewardsPool += _amount;
        
        emit RewardsPoolFunded(_amount);
    }
    
    /**
     * @notice Set staking reward rate
     * @param _rateBps New rate in basis points
     */
    function setStakingRewardRate(uint256 _rateBps) external onlyOwner {
        require(_rateBps <= 5000, "Rate too high"); // Max 50%
        stakingRewardRateBps = _rateBps;
    }
    
    /**
     * @notice Set minimum lock duration
     */
    function setMinLockDuration(uint256 _duration) external onlyOwner {
        minLockDuration = _duration;
    }
    
    // ============ Internal Functions ============
    
    function _claimRewards(address _staker) internal {
        LPStake storage stake = lpStakes[_staker];
        if (stake.lpTokenAmount == 0) return;
        
        uint256 rewards = calculateRewards(_staker);
        if (rewards > 0 && rewards <= stakingRewardsPool) {
            stakingRewardsPool -= rewards;
            stake.rewardsEarned += rewards;
            stake.lastRewardClaim = block.timestamp;
            
            soulToken.safeTransfer(_staker, rewards);
            
            emit RewardsClaimed(_staker, rewards);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate pending rewards for staker
     */
    function calculateRewards(address _staker) public view returns (uint256) {
        LPStake storage stake = lpStakes[_staker];
        if (stake.lpTokenAmount == 0 || totalLPStaked == 0) return 0;
        
        uint256 duration = block.timestamp - stake.lastRewardClaim;
        uint256 annualReward = (stake.lpTokenAmount * stakingRewardRateBps) / 10000;
        return (annualReward * duration) / (365 days);
    }
    
    /**
     * @notice Get staker info
     */
    function getStakerInfo(address _staker) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 totalEarned,
        uint256 stakedAt
    ) {
        LPStake storage stake = lpStakes[_staker];
        return (
            stake.lpTokenAmount,
            calculateRewards(_staker),
            stake.rewardsEarned,
            stake.stakedAt
        );
    }
    
    /**
     * @notice Check if pool is locked
     */
    function isPoolLocked(uint256 _poolId) external view returns (bool) {
        if (_poolId >= poolCount) return false;
        LiquidityPool storage pool = liquidityPools[_poolId];
        return pool.locked && block.timestamp < pool.lockUntil;
    }
}

