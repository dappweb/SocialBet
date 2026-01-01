// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title SoulCast DAO Governor
 * @notice Governance contract for the SoulCast platform (UUPS Upgradeable)
 * @dev Based on OpenZeppelin Governor with SOUL token voting
 * 
 * Governance Rules from White Paper:
 * - Proposal Creation: Minimum 1M SOUL tokens
 * - Voting Period: 7 days
 * - Quorum: 1M SOUL tokens
 * - Token-weighted voting
 */
contract SoulCastGovernor is 
    Initializable,
    GovernorUpgradeable, 
    GovernorSettingsUpgradeable, 
    GovernorCountingSimpleUpgradeable, 
    GovernorVotesUpgradeable, 
    GovernorVotesQuorumFractionUpgradeable,
    GovernorTimelockControlUpgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    /// @notice Minimum tokens required for proposal (1M SOUL)
    uint256 public constant PROPOSAL_THRESHOLD_TOKENS = 1_000_000 * 10**18;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initialize the governor
     * @param _token SOUL token with voting capability
     * @param _timelock Timelock controller for execution delay
     */
    function initialize(
        IVotesUpgradeable _token,
        TimelockControllerUpgradeable _timelock
    )
        public
        initializer
    {
        __Governor_init("SoulCast DAO");
        __GovernorSettings_init(
            1 days,        // voting delay (1 day)
            7 days,        // voting period (7 days as per whitepaper)
            PROPOSAL_THRESHOLD_TOKENS  // proposal threshold (1M SOUL)
        );
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(1); // 1% quorum (can be adjusted via governance)
        __GovernorTimelockControl_init(_timelock);
        __UUPSUpgradeable_init();
        __Ownable_init(msg.sender);
    }
    
    /**
     * @dev Authorize upgrade. only owner (usually timelock) can upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============ Proposal Types ============
    
    /// @notice Proposal types as per whitepaper
    enum ProposalType {
        TokenAllocation,      // Add SOUL to platform
        PlatformChange,       // Platform parameter changes
        FeatureDevFunding,    // Feature development funding
        CommunityReward,      // Community reward distribution
        TreasuryManagement    // Treasury management
    }
    
    /// @notice Mapping of proposal ID to proposal type
    mapping(uint256 => ProposalType) public proposalTypes;
    
    // ============ Events ============
    
    event ProposalCreatedWithType(
        uint256 indexed proposalId,
        ProposalType proposalType,
        string description
    );

    // ============ Override Functions ============
    
    function votingDelay()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(GovernorUpgradeable, GovernorVotesQuorumFractionUpgradeable)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
        returns (address)
    {
        return super._executor();
    }
}
