/**
 * Staking Service
 * Provides high-level interface for Soul token staking operations
 * Uses soulContractService for on-chain interactions
 */

import { IProvider } from '@web3auth/base';
import {
  stake,
  unstake,
  claimRewards,
  getStakeInfo,
  calculateRewards,
  getStakingRewardRate,
  type StakeInfo,
} from './soulContractService';
import { useToast } from '../contexts/ToastContext';

export interface StakingOperationResult {
  success: boolean;
  txHash?: string;
  rewards?: string;
  error?: string;
}

/**
 * Stake Soul tokens
 */
export async function stakeTokens(
  amount: number,
  provider: IProvider,
  chainId?: number,
  onSuccess?: (txHash: string) => void,
  onError?: (error: string) => void
): Promise<StakingOperationResult> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const result = await stake(amount, provider, chainId);
    
    if (onSuccess) {
      onSuccess(result.txHash);
    }
    
    return {
      success: true,
      txHash: result.txHash,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Staking failed';
    if (onError) {
      onError(errorMessage);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Unstake Soul tokens
 */
export async function unstakeTokens(
  amount: number,
  provider: IProvider,
  chainId?: number,
  onSuccess?: (txHash: string) => void,
  onError?: (error: string) => void
): Promise<StakingOperationResult> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const result = await unstake(amount, provider, chainId);
    
    if (onSuccess) {
      onSuccess(result.txHash);
    }
    
    return {
      success: true,
      txHash: result.txHash,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unstaking failed';
    if (onError) {
      onError(errorMessage);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Claim staking rewards
 */
export async function claimStakingRewards(
  provider: IProvider,
  chainId?: number,
  onSuccess?: (txHash: string, rewards: string) => void,
  onError?: (error: string) => void
): Promise<StakingOperationResult> {
  try {
    const result = await claimRewards(provider, chainId);
    
    if (onSuccess) {
      onSuccess(result.txHash, result.rewards);
    }
    
    return {
      success: true,
      txHash: result.txHash,
      rewards: result.rewards,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Claim rewards failed';
    if (onError) {
      onError(errorMessage);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get user's staking information
 */
export async function getUserStakeInfo(
  address: string,
  provider: IProvider,
  chainId?: number
): Promise<StakeInfo | null> {
  try {
    return await getStakeInfo(address, provider, chainId);
  } catch (error: any) {
    console.error('Error getting stake info:', error);
    return null;
  }
}

/**
 * Get pending rewards for a user
 */
export async function getPendingRewards(
  address: string,
  provider: IProvider,
  chainId?: number
): Promise<{ rewards: number; formatted: string } | null> {
  try {
    return await calculateRewards(address, provider, chainId);
  } catch (error: any) {
    console.error('Error calculating rewards:', error);
    return null;
  }
}

/**
 * Get staking APY
 */
export async function getStakingAPY(
  provider: IProvider,
  chainId?: number
): Promise<number | null> {
  try {
    const rate = await getStakingRewardRate(provider, chainId);
    return rate.apy;
  } catch (error: any) {
    console.error('Error getting staking APY:', error);
    return null;
  }
}

