/**
 * SoulCast Governor Service
 * Provides typed interface to interact with SoulCastGovernor smart contract
 */

import { Contract, BrowserProvider, Interface, parseEther, formatEther } from 'ethers';
import { IProvider } from '@web3auth/base';
import { DAOProposal } from '../types';

// Contract Configuration
export const GOVERNOR_CONFIG = {
  address: import.meta.env.VITE_SOUL_GOVERNOR_LOCAL || '',
  tokenAddress: import.meta.env.VITE_SOUL_TOKEN_LOCAL || '',
};

// Proposal State Enum from Governor contract
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

let SoulCastGovernorABI: any = null;

/**
 * Load contract ABI
 */
async function loadABI() {
  if (!SoulCastGovernorABI) {
    try {
      const abiModule = await import('../contracts/artifacts/contracts/SoulCastGovernor.sol/SoulCastGovernor.json');
      SoulCastGovernorABI = abiModule.default || abiModule;
    } catch (error) {
      console.error('Failed to load Governor ABI:', error);
      throw new Error('Contract ABI not found. Please compile contracts first.');
    }
  }
  return SoulCastGovernorABI;
}

/**
 * Get contract instance
 */
async function getContract(provider: BrowserProvider | any): Promise<Contract> {
  const abi = await loadABI();
  const address = GOVERNOR_CONFIG.address;
  if (!address) throw new Error('Governor contract address not set');
  return new Contract(address, abi.abi || abi, provider);
}

/**
 * Fetch all proposals from the contract
 */
export async function getAllProposals(provider: BrowserProvider): Promise<DAOProposal[]> {
  try {
    const contract = await getContract(provider);
    
    // Get past ProposalCreated events
    // Note: In production, use a subgraph or indexer. For dev, query events.
    // We scan from block 0 (or a recent deployment block) to latest.
    // To optimize, we could store the deployment block.
    const filter = contract.filters.ProposalCreated();
    const events = await contract.queryFilter(filter);

    const proposals: DAOProposal[] = [];

    for (const event of events) {
      if ('args' in event) {
        const args = event.args;
        const proposalId = args[0]; // uint256 proposalId
        const proposer = args[1]; // address proposer
        const targets = args[2]; // address[] targets
        const values = args[3]; // uint256[] values
        const signatures = args[4]; // string[] signatures
        const calldatas = args[5]; // bytes[] calldatas
        const voteStart = args[6]; // uint256 voteStart
        const voteEnd = args[7]; // uint256 voteEnd
        const description = args[8]; // string description

        // Fetch current state
        const state = await contract.state(proposalId);
        
        // Fetch current votes
        const votes = await contract.proposalVotes(proposalId);
        // votes returns (againstVotes, forVotes, abstainVotes)
        
        // Parse description
        // Format assumption: "Title#Description" or just "Description"
        // Also looking for "Type: token_allocation" etc if we want structured data
        let title = "Proposal";
        let descText = description;
        const parts = description.split('#');
        if (parts.length > 1) {
          title = parts[0];
          descText = parts.slice(1).join('#');
        } else if (description.length > 50) {
            title = description.substring(0, 47) + "...";
        } else {
            title = description;
        }

        // Determine type and amounts from description or calldata
        // This is a simplification. Real apps parse calldata.
        let proposalType: DAOProposal['proposalType'] = 'platform_change';
        let tokenAmount = 0;
        let allocationTarget = '';

        // Simple heuristic for type
        if (descText.toLowerCase().includes('allocate') || descText.toLowerCase().includes('transfer')) {
            proposalType = 'token_allocation';
        }

        // Map state to frontend status
        let status: DAOProposal['status'] = 'active';
        switch (Number(state)) {
            case ProposalState.Pending: status = 'active'; break; // Treat pending as active for now or add 'pending' to type
            case ProposalState.Active: status = 'active'; break;
            case ProposalState.Canceled: status = 'rejected'; break;
            case ProposalState.Defeated: status = 'rejected'; break;
            case ProposalState.Succeeded: status = 'passed'; break;
            case ProposalState.Queued: status = 'passed'; break;
            case ProposalState.Expired: status = 'rejected'; break;
            case ProposalState.Executed: status = 'executed'; break;
        }

        // Convert blocks to dates (approximate)
        // Current block
        const currentBlock = await provider.getBlockNumber();
        const block = await provider.getBlock(currentBlock);
        const now = block ? block.timestamp : Math.floor(Date.now() / 1000);
        
        // Calculate time diff
        // Assuming 12s block time for ETH, but local hardhat is variable.
        // For accurate times, we should check block timestamps of start/end blocks if they exist,
        // or project future blocks.
        // For simplicity, let's just show raw block numbers or estimate.
        // Let's estimate: (targetBlock - currentBlock) * 12 + now
        const secondsPerBlock = 12; // Standard ETH
        
        // This is rough.
        const startTime = new Date((Number(voteStart) - currentBlock) * secondsPerBlock * 1000 + now * 1000).toISOString();
        const endTime = new Date((Number(voteEnd) - currentBlock) * secondsPerBlock * 1000 + now * 1000).toISOString();

        proposals.push({
          id: proposalId.toString(),
          creatorId: proposer,
          proposalType,
          title,
          description: descText,
          tokenAmount,
          allocationTarget,
          votingStart: startTime,
          votingEnd: endTime,
          quorum: 0, // TODO: fetch quorum if needed
          status,
          yesVotes: parseFloat(formatEther(votes[1])),
          noVotes: parseFloat(formatEther(votes[0])),
          abstainVotes: parseFloat(formatEther(votes[2])),
          executionTxHash: undefined
        });
      }
    }

    return proposals.reverse(); // Newest first
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }
}

/**
 * Create a new proposal
 */
export async function createProposal(
  title: string,
  description: string,
  targets: string[] = [],
  values: string[] = [],
  calldatas: string[] = [],
  provider: IProvider
): Promise<string> {
  try {
    const web3Provider = new BrowserProvider(provider);
    const signer = await web3Provider.getSigner();
    const contract = await getContract(signer);

    // Combine title and description
    const fullDescription = `${title}#${description}`;

    // If no targets provided, default to a self-call or empty (though usually required)
    // For a simple text proposal, we might not have actions.
    // Governor requires at least one action usually? Or maybe not.
    // If targets is empty, we pass empty arrays.
    
    const tx = await contract.propose(
      targets,
      values,
      calldatas,
      fullDescription
    );
    
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    throw new Error(error.reason || error.message);
  }
}

/**
 * Cast a vote
 */
export async function castVote(
  proposalId: string,
  support: number, // 0=Against, 1=For, 2=Abstain
  provider: IProvider
): Promise<string> {
  try {
    const web3Provider = new BrowserProvider(provider);
    const signer = await web3Provider.getSigner();
    const contract = await getContract(signer);

    const tx = await contract.castVote(proposalId, support);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('Error casting vote:', error);
    throw new Error(error.reason || error.message);
  }
}

/**
 * Get DAO Treasury Balance (Timelock contract balance)
 */
export async function getTreasuryBalance(provider: IProvider): Promise<{ balance: number; formatted: string }> {
  try {
    const web3Provider = new BrowserProvider(provider);
    const governorContract = await getContract(web3Provider);
    
    // Get Timelock address from Governor
    // SoulCastGovernor inherits GovernorTimelockControl which has public timelock()
    const timelockAddress = await governorContract.timelock();
    
    if (!timelockAddress || timelockAddress === '0x0000000000000000000000000000000000000000') {
        return { balance: 0, formatted: '0.00' };
    }

    // Get SOUL balance of Timelock
    // We use getBalance from soulContractService which handles token contract logic
    const balanceInfo = await getBalance(timelockAddress, provider);
    
    return {
        balance: balanceInfo.balance,
        formatted: balanceInfo.formatted
    };
  } catch (error: any) {
    console.error('Error fetching treasury balance:', error);
    // Return 0 instead of throwing to prevent UI crash
    return { balance: 0, formatted: '0.00' };
  }
}

/**
 * Execute a proposal
 */
export async function executeProposal(
  targets: string[],
  values: string[],
  calldatas: string[],
  descriptionHash: string,
  provider: IProvider
): Promise<string> {
  try {
    const web3Provider = new BrowserProvider(provider);
    const signer = await web3Provider.getSigner();
    const contract = await getContract(signer);

    const tx = await contract.execute(targets, values, calldatas, descriptionHash);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('Error executing proposal:', error);
    throw new Error(error.reason || error.message);
  }
}
