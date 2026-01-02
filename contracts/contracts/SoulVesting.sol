// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SoulVesting
 * @notice Flexible vesting contract for SOUL token investors and team
 * @dev Supports multiple vesting schedules, cliff periods, and early unlock penalties
 */
contract SoulVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct VestingSchedule {
        address beneficiary;           // Address that will receive tokens
        uint256 totalAmount;            // Total amount to be vested
        uint256 released;               // Amount already released
        uint256 startTime;               // Vesting start time (cliff)
        uint256 duration;               // Vesting duration in seconds
        uint256 cliffDuration;           // Cliff duration in seconds
        bool revocable;                 // Whether vesting can be revoked
        bool revoked;                   // Whether vesting has been revoked
        uint256 earlyUnlockPenalty;     // Penalty percentage for early unlock (basis points)
    }

    // ============ State Variables ============
    
    /// @notice SOUL token being vested
    IERC20 public immutable soulToken;
    
    /// @notice Total vesting schedules
    uint256 public vestingScheduleCount;
    
    /// @notice Mapping of schedule ID to vesting schedule
    mapping(uint256 => VestingSchedule) public vestingSchedules;
    
    /// @notice Mapping of beneficiary to schedule IDs
    mapping(address => uint256[]) public beneficiarySchedules;
    
    /// @notice Total amount in vesting
    uint256 public totalVestingAmount;
    
    /// @notice Total amount released
    uint256 public totalReleased;
    
    // ============ Events ============
    
    event VestingScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        uint256 cliffDuration
    );
    
    event TokensReleased(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );
    
    event VestingRevoked(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 revokedAmount
    );
    
    event EarlyUnlock(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount,
        uint256 penalty
    );
    
    // ============ Modifiers ============
    
    modifier onlyValidSchedule(uint256 _scheduleId) {
        require(_scheduleId < vestingScheduleCount, "Invalid schedule ID");
        require(!vestingSchedules[_scheduleId].revoked, "Schedule revoked");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _soulToken, address _owner) Ownable(_owner) {
        require(_soulToken != address(0), "Invalid token address");
        soulToken = IERC20(_soulToken);
    }
    
    // ============ Public Functions ============
    
    /**
     * @notice Release vested tokens for a schedule
     * @param _scheduleId Vesting schedule ID
     */
    function release(uint256 _scheduleId) external nonReentrant onlyValidSchedule(_scheduleId) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        require(schedule.beneficiary == msg.sender || msg.sender == owner(), "Not authorized");
        
        uint256 releasable = getReleasableAmount(_scheduleId);
        require(releasable > 0, "No tokens to release");
        
        schedule.released += releasable;
        totalReleased += releasable;
        
        soulToken.safeTransfer(schedule.beneficiary, releasable);
        
        emit TokensReleased(_scheduleId, schedule.beneficiary, releasable);
    }
    
    /**
     * @notice Early unlock with penalty
     * @param _scheduleId Vesting schedule ID
     * @param _amount Amount to unlock early
     */
    function earlyUnlock(uint256 _scheduleId, uint256 _amount) external nonReentrant onlyValidSchedule(_scheduleId) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        require(schedule.beneficiary == msg.sender, "Not beneficiary");
        require(_amount > 0, "Invalid amount");
        
        uint256 vested = getVestedAmount(_scheduleId);
        uint256 available = vested - schedule.released;
        require(_amount <= available, "Amount exceeds available");
        
        // Calculate penalty
        uint256 penalty = (_amount * schedule.earlyUnlockPenalty) / 10000;
        uint256 netAmount = _amount - penalty;
        
        schedule.released += _amount;
        totalReleased += _amount;
        
        // Transfer net amount to beneficiary
        soulToken.safeTransfer(schedule.beneficiary, netAmount);
        
        // Burn or send penalty to treasury (owner)
        if (penalty > 0) {
            soulToken.safeTransfer(owner(), penalty);
        }
        
        emit EarlyUnlock(_scheduleId, schedule.beneficiary, netAmount, penalty);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Create a new vesting schedule
     * @param _beneficiary Address that will receive tokens
     * @param _totalAmount Total amount to vest
     * @param _startTime Vesting start time (0 = now)
     * @param _duration Vesting duration in seconds
     * @param _cliffDuration Cliff duration in seconds
     * @param _revocable Whether vesting can be revoked
     * @param _earlyUnlockPenalty Penalty for early unlock (basis points)
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _totalAmount,
        uint256 _startTime,
        uint256 _duration,
        uint256 _cliffDuration,
        bool _revocable,
        uint256 _earlyUnlockPenalty
    ) external onlyOwner returns (uint256) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_totalAmount > 0, "Invalid amount");
        require(_duration > 0, "Invalid duration");
        require(_cliffDuration <= _duration, "Cliff exceeds duration");
        require(_earlyUnlockPenalty <= 5000, "Penalty too high"); // Max 50%
        
        uint256 startTime = _startTime == 0 ? block.timestamp : _startTime;
        
        // Check contract has enough tokens
        require(
            soulToken.balanceOf(address(this)) >= totalVestingAmount + _totalAmount,
            "Insufficient tokens in contract"
        );
        
        uint256 scheduleId = vestingScheduleCount;
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: _beneficiary,
            totalAmount: _totalAmount,
            released: 0,
            startTime: startTime,
            duration: _duration,
            cliffDuration: _cliffDuration,
            revocable: _revocable,
            revoked: false,
            earlyUnlockPenalty: _earlyUnlockPenalty
        });
        
        beneficiarySchedules[_beneficiary].push(scheduleId);
        vestingScheduleCount++;
        totalVestingAmount += _totalAmount;
        
        emit VestingScheduleCreated(
            scheduleId,
            _beneficiary,
            _totalAmount,
            startTime,
            _duration,
            _cliffDuration
        );
        
        return scheduleId;
    }
    
    /**
     * @notice Revoke a vesting schedule (if revocable)
     * @param _scheduleId Vesting schedule ID
     */
    function revoke(uint256 _scheduleId) external onlyOwner onlyValidSchedule(_scheduleId) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        require(schedule.revocable, "Not revocable");
        
        uint256 vested = getVestedAmount(_scheduleId);
        uint256 revokedAmount = schedule.totalAmount - vested;
        
        schedule.revoked = true;
        totalVestingAmount -= revokedAmount;
        
        // Transfer revoked tokens back to owner
        if (revokedAmount > 0) {
            soulToken.safeTransfer(owner(), revokedAmount);
        }
        
        emit VestingRevoked(_scheduleId, schedule.beneficiary, revokedAmount);
    }
    
    /**
     * @notice Batch create vesting schedules
     */
    function batchCreateVestingSchedules(
        address[] calldata _beneficiaries,
        uint256[] calldata _totalAmounts,
        uint256 _startTime,
        uint256 _duration,
        uint256 _cliffDuration,
        bool _revocable,
        uint256 _earlyUnlockPenalty
    ) external onlyOwner {
        require(_beneficiaries.length == _totalAmounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            this.createVestingSchedule(
                _beneficiaries[i],
                _totalAmounts[i],
                _startTime,
                _duration,
                _cliffDuration,
                _revocable,
                _earlyUnlockPenalty
            );
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get vested amount for a schedule
     * @param _scheduleId Vesting schedule ID
     */
    function getVestedAmount(uint256 _scheduleId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0; // Still in cliff period
        }
        
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount; // Fully vested
        }
        
        // Linear vesting
        uint256 elapsed = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * elapsed) / schedule.duration;
    }
    
    /**
     * @notice Get releasable amount for a schedule
     * @param _scheduleId Vesting schedule ID
     */
    function getReleasableAmount(uint256 _scheduleId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[_scheduleId];
        uint256 vested = getVestedAmount(_scheduleId);
        return vested - schedule.released;
    }
    
    /**
     * @notice Get all schedules for a beneficiary
     * @param _beneficiary Beneficiary address
     */
    function getBeneficiarySchedules(address _beneficiary) external view returns (uint256[] memory) {
        return beneficiarySchedules[_beneficiary];
    }
    
    /**
     * @notice Get schedule details
     * @param _scheduleId Vesting schedule ID
     */
    function getSchedule(uint256 _scheduleId) external view returns (VestingSchedule memory) {
        return vestingSchedules[_scheduleId];
    }
    
    /**
     * @notice Get total vested and releasable for beneficiary
     * @param _beneficiary Beneficiary address
     */
    function getBeneficiaryInfo(address _beneficiary) external view returns (
        uint256 totalVested,
        uint256 totalReleasable,
        uint256 beneficiaryTotalReleased
    ) {
        uint256[] memory schedules = beneficiarySchedules[_beneficiary];
        
        for (uint256 i = 0; i < schedules.length; i++) {
            if (!vestingSchedules[schedules[i]].revoked) {
                totalVested += getVestedAmount(schedules[i]);
                totalReleasable += getReleasableAmount(schedules[i]);
                beneficiaryTotalReleased += vestingSchedules[schedules[i]].released;
            }
        }
    }
}

