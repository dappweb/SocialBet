/**
 * SoulCast Token Contract Service
 * Provides typed interface to interact with SoulCastToken smart contract
 * Aligns all on-chain functions with web page functionality
 */

import { ethers, Contract, BrowserProvider, ContractTransactionReceipt, formatEther, parseEther } from 'ethers';
import { IProvider } from '@web3auth/base';
// Import ABI - will use dynamic import if needed
let SoulCastTokenABI: any = null;

// Contract Configuration
export const SOUL_CONTRACT_CONFIG = {
  // Contract addresses (set after deployment)
  addresses: {
    sepolia: process.env.VITE_SOUL_TOKEN_SEPOLIA || '',
    mainnet: process.env.VITE_SOUL_TOKEN_MAINNET || '',
    localhost: process.env.VITE_SOUL_TOKEN_LOCAL || '',
  },
  decimals: 18,
  symbol: 'SOUL',
  name: 'SoulCast Token',
};

// Types matching contract structs
export interface StakeInfo {
  stakedAmount: string;
  stakedAt: string;
  pendingRewards: string;
  lastClaim: string;
}

export interface TokenStats {
  totalSupply: string;
  circulatingSupply: string;
  totalStaked: string;
  totalBurned: string;
  issuanceFeeBurned: string;
  stakingRewardsPool: string;
}

export interface AllocationInfo {
  name: string;
  amount: string;
  released: string;
  beneficiary: string;
  releasable: string;
}

/**
 * Load contract ABI
 */
async function loadABI() {
  if (!SoulCastTokenABI) {
    try {
      const abiModule = await import('../contracts/artifacts/contracts/SoulCastToken.sol/SoulCastToken.json');
      SoulCastTokenABI = abiModule.default || abiModule;
    } catch (error) {
      console.error('Failed to load contract ABI:', error);
      throw new Error('Contract ABI not found. Please compile contracts first.');
    }
  }
  return SoulCastTokenABI;
}

/**
 * Get contract instance
 */
async function getContract(provider: BrowserProvider | any, address: string): Promise<Contract> {
  const abi = await loadABI();
  return new Contract(address, abi.abi || abi, provider);
}

/**
 * Get contract address for current network
 */
function getContractAddress(chainId?: number): string {
  // Default to sepolia for now
  if (!chainId) return SOUL_CONTRACT_CONFIG.addresses.sepolia;
  
  // Mainnet
  if (chainId === 1) return SOUL_CONTRACT_CONFIG.addresses.mainnet;
  
  // Sepolia
  if (chainId === 11155111) return SOUL_CONTRACT_CONFIG.addresses.sepolia;
  
  // Localhost
  if (chainId === 31337 || chainId === 1337) return SOUL_CONTRACT_CONFIG.addresses.localhost;
  
  return SOUL_CONTRACT_CONFIG.addresses.sepolia;
}

/**
 * Convert provider to ethers provider
 */
async function getEthersProvider(provider: IProvider): Promise<BrowserProvider> {
  return new BrowserProvider(provider);
}

/**
 * Get user's SOUL token balance
 */
export async function getBalance(
  address: string,
  provider: IProvider,
  chainId?: number
): Promise<{ balance: number; formatted: string; raw: string }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const balance = await contract.balanceOf(address);
    const formatted = formatEther(balance);
    
    return {
      balance: parseFloat(formatted),
      formatted: parseFloat(formatted).toFixed(4),
      raw: balance.toString(),
    };
  } catch (error: any) {
    console.error('Error getting balance:', error);
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}

/**
 * Stake SOUL tokens
 */
export async function stake(
  amount: number,
  provider: IProvider,
  chainId?: number
): Promise<{ txHash: string; receipt: ethers.ContractTransactionReceipt }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = await getContract(signer, contractAddress);
    
    const amountWei = parseEther(amount.toString());
    const tx = await contract.stake(amountWei);
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      receipt: receipt as ContractTransactionReceipt,
    };
  } catch (error: any) {
    console.error('Error staking:', error);
    throw new Error(`Staking failed: ${error.message}`);
  }
}

/**
 * Unstake SOUL tokens
 */
export async function unstake(
  amount: number,
  provider: IProvider,
  chainId?: number
): Promise<{ txHash: string; receipt: ethers.ContractTransactionReceipt }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = await getContract(signer, contractAddress);
    
    const amountWei = parseEther(amount.toString());
    const tx = await contract.unstake(amountWei);
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      receipt: receipt as ContractTransactionReceipt,
    };
  } catch (error: any) {
    console.error('Error unstaking:', error);
    throw new Error(`Unstaking failed: ${error.message}`);
  }
}

/**
 * Claim staking rewards
 */
export async function claimRewards(
  provider: IProvider,
  chainId?: number
): Promise<{ txHash: string; receipt: ethers.ContractTransactionReceipt; rewards: string }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = await getContract(signer, contractAddress);
    
    // Get pending rewards first
    const userAddress = await signer.getAddress();
    const pendingRewards = await contract.calculateRewards(userAddress);
    
    const tx = await contract.claimRewards();
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      receipt: receipt as ethers.ContractTransactionReceipt,
      rewards: formatEther(pendingRewards),
    };
  } catch (error: any) {
    console.error('Error claiming rewards:', error);
    throw new Error(`Claim rewards failed: ${error.message}`);
  }
}

/**
 * Get staking information for a user
 */
export async function getStakeInfo(
  address: string,
  provider: IProvider,
  chainId?: number
): Promise<StakeInfo> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const [stakedAmount, stakedAt, pendingRewards, lastClaim] = await contract.getStakeInfo(address);
    
    return {
      stakedAmount: formatEther(stakedAmount),
      stakedAt: stakedAt.toString(),
      pendingRewards: formatEther(pendingRewards),
      lastClaim: lastClaim.toString(),
    };
  } catch (error: any) {
    console.error('Error getting stake info:', error);
    throw new Error(`Failed to get stake info: ${error.message}`);
  }
}

/**
 * Calculate pending rewards for a user
 */
export async function calculateRewards(
  address: string,
  provider: IProvider,
  chainId?: number
): Promise<{ rewards: number; formatted: string }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const rewards = await contract.calculateRewards(address);
    const formatted = formatEther(rewards);
    
    return {
      rewards: parseFloat(formatted),
      formatted: parseFloat(formatted).toFixed(4),
    };
  } catch (error: any) {
    console.error('Error calculating rewards:', error);
    throw new Error(`Failed to calculate rewards: ${error.message}`);
  }
}

/**
 * Transfer tokens with issuance fee (burn on transfer)
 */
export async function transferWithIssuanceFee(
  to: string,
  amount: number,
  provider: IProvider,
  chainId?: number
): Promise<{ txHash: string; receipt: ethers.ContractTransactionReceipt }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = await getContract(signer, contractAddress);
    
    const amountWei = parseEther(amount.toString());
    const tx = await contract.transferWithIssuanceFee(to, amountWei);
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      receipt: receipt as ContractTransactionReceipt,
    };
  } catch (error: any) {
    console.error('Error transferring with fee:', error);
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

/**
 * Standard ERC-20 transfer
 */
export async function transfer(
  to: string,
  amount: number,
  provider: IProvider,
  chainId?: number
): Promise<{ txHash: string; receipt: ethers.ContractTransactionReceipt }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = await getContract(signer, contractAddress);
    
    const amountWei = parseEther(amount.toString());
    const tx = await contract.transfer(to, amountWei);
    const receipt = await tx.wait();
    
    return {
      txHash: tx.hash,
      receipt: receipt as ContractTransactionReceipt,
    };
  } catch (error: any) {
    console.error('Error transferring:', error);
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

/**
 * Get token statistics
 */
export async function getTokenStats(
  provider: IProvider,
  chainId?: number
): Promise<TokenStats> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const [
      totalSupply,
      circulatingSupply,
      totalStaked,
      totalBurned,
      issuanceFeeBurned,
      stakingRewardsPool,
    ] = await contract.getTokenStats();
    
    return {
      totalSupply: formatEther(totalSupply),
      circulatingSupply: formatEther(circulatingSupply),
      totalStaked: formatEther(totalStaked),
      totalBurned: formatEther(totalBurned),
      issuanceFeeBurned: formatEther(issuanceFeeBurned),
      stakingRewardsPool: formatEther(stakingRewardsPool),
    };
  } catch (error: any) {
    console.error('Error getting token stats:', error);
    throw new Error(`Failed to get token stats: ${error.message}`);
  }
}

/**
 * Get allocation information
 */
export async function getAllocation(
  allocationId: number,
  provider: IProvider,
  chainId?: number
): Promise<AllocationInfo> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const [name, amount, released, beneficiary, releasable] = await contract.getAllocation(allocationId);
    
    return {
      name,
      amount: formatEther(amount),
      released: formatEther(released),
      beneficiary,
      releasable: formatEther(releasable),
    };
  } catch (error: any) {
    console.error('Error getting allocation:', error);
    throw new Error(`Failed to get allocation: ${error.message}`);
  }
}

/**
 * Get issuance fee percentage
 */
export async function getIssuanceFee(
  provider: IProvider,
  chainId?: number
): Promise<{ feeBps: number; feePercent: number }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const feeBps = await contract.issuanceFeeBps();
    
    return {
      feeBps: Number(feeBps),
      feePercent: Number(feeBps) / 100,
    };
  } catch (error: any) {
    console.error('Error getting issuance fee:', error);
    throw new Error(`Failed to get issuance fee: ${error.message}`);
  }
}

/**
 * Get staking reward rate
 */
export async function getStakingRewardRate(
  provider: IProvider,
  chainId?: number
): Promise<{ rateBps: number; ratePercent: number; apy: number }> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const ethersProvider = await getEthersProvider(provider);
    const contract = await getContract(ethersProvider, contractAddress);
    
    const rateBps = await contract.stakingRewardRateBps();
    const ratePercent = Number(rateBps) / 100;
    
    return {
      rateBps: Number(rateBps),
      ratePercent,
      apy: ratePercent,
    };
  } catch (error: any) {
    console.error('Error getting staking reward rate:', error);
    throw new Error(`Failed to get staking reward rate: ${error.message}`);
  }
}

