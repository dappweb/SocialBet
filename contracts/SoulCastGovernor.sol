// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title SoulCast DAO Governor
 * @notice Governance contract for the SoulCast platform
 * @dev Based on OpenZeppelin Governor with SOUL token voting
 * 
 * Governance Rules from White Paper:
 * - Proposal Creation: Minimum 1M SOUL tokens
 * - Voting Period: 7 days
 * - Quorum: 1M SOUL tokens
 * - Token-weighted voting
 */
contract SoulCastGovernor is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction,
    GovernorTimelockControl 
{
    /// @notice Minimum tokens required for proposal (1M SOUL)
    uint256 public constant PROPOSAL_THRESHOLD_TOKENS = 1_000_000 * 10**18;
    
    /**
     * @notice Initialize the governor
     * @param _token SOUL token with voting capability
     * @param _timelock Timelock controller for execution delay
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("SoulCast DAO")
        GovernorSettings(
            1 days,        // voting delay (1 day)
            7 days,        // voting period (7 days as per whitepaper)
            PROPOSAL_THRESHOLD_TOKENS  // proposal threshold (1M SOUL)
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(1) // 1% quorum (can be adjusted via governance)
        GovernorTimelockControl(_timelock)
    {}

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
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
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
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
