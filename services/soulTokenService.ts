/**
 * SOUL Token Service - Multi-Chain Support
 * Handles SOUL token operations on both Solana and Ethereum/Sepolia
 */

import { IProvider } from '@web3auth/base';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

// Token Configuration
export const SOUL_TOKEN_CONFIG = {
  symbol: 'SOUL',
  name: 'SoulCast Token',
  decimals: {
    ethereum: 18,
    solana: 9,
  },
  totalSupply: 2_100_000_000,
  // Contract addresses (will be set after deployment)
  addresses: {
    sepolia: process.env.VITE_SOUL_TOKEN_SEPOLIA || '',
    solana: process.env.VITE_SOUL_TOKEN_SOLANA || '',
  },
};

// Chain Types
export type ChainType = 'ethereum' | 'solana';
export type NetworkType = 'sepolia' | 'solana-devnet' | 'solana-mainnet';

export interface TokenBalance {
  chain: ChainType;
  network: NetworkType;
  balance: number;
  formatted: string;
  address: string;
}

export interface StakeInfo {
  stakedAmount: number;
  pendingRewards: number;
  stakedAt: number;
  lastClaim: number;
}

/**
 * Get SOUL token balance on Ethereum/Sepolia
 */
export async function getEthereumBalance(
  address: string,
  provider: IProvider,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<TokenBalance> {
  try {
    // ERC-20 balanceOf call
    const contractAddress = SOUL_TOKEN_CONFIG.addresses.sepolia;
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    // Call balanceOf(address) on ERC-20 contract
    const result = await provider.request({
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: `0x70a08231${address.slice(2).padStart(64, '0')}`, // balanceOf(address)
        },
        'latest',
      ],
    });

    const balance = BigInt(result as string);
    const formatted = (Number(balance) / 10 ** SOUL_TOKEN_CONFIG.decimals.ethereum).toFixed(4);

    return {
      chain: 'ethereum',
      network: network,
      balance: Number(balance) / 10 ** SOUL_TOKEN_CONFIG.decimals.ethereum,
      formatted,
      address: contractAddress,
    };
  } catch (error: any) {
    console.error('Error getting Ethereum balance:', error);
    return {
      chain: 'ethereum',
      network: network,
      balance: 0,
      formatted: '0.0000',
      address: SOUL_TOKEN_CONFIG.addresses.sepolia || '',
    };
  }
}

/**
 * Get SOUL token balance on Solana
 */
export async function getSolanaBalance(
  address: string,
  connection: Connection,
  mintAddress?: string
): Promise<TokenBalance> {
  try {
    const mintPubkey = mintAddress 
      ? new PublicKey(mintAddress)
      : new PublicKey(SOUL_TOKEN_CONFIG.addresses.solana || 'SoulCastTokenProgramID111111111111111111111111');
    
    const userPubkey = new PublicKey(address);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, userPubkey);

    try {
      const accountInfo = await getAccount(connection, tokenAccount);
      const balance = Number(accountInfo.amount);
      const formatted = (balance / 10 ** SOUL_TOKEN_CONFIG.decimals.solana).toFixed(4);

      return {
        chain: 'solana',
        network: 'solana-devnet',
        balance: balance / 10 ** SOUL_TOKEN_CONFIG.decimals.solana,
        formatted,
        address: mintPubkey.toString(),
      };
    } catch (e) {
      // Token account doesn't exist
      return {
        chain: 'solana',
        network: 'solana-devnet',
        balance: 0,
        formatted: '0.0000',
        address: mintPubkey.toString(),
      };
    }
  } catch (error: any) {
    console.error('Error getting Solana balance:', error);
    return {
      chain: 'solana',
      network: 'solana-devnet',
      balance: 0,
      formatted: '0.0000',
      address: SOUL_TOKEN_CONFIG.addresses.solana || '',
    };
  }
}

/**
 * Get total SOUL balance across all chains
 */
export async function getTotalBalance(
  ethereumAddress: string | null,
  solanaAddress: string | null,
  ethereumProvider: IProvider | null,
  solanaConnection: Connection | null
): Promise<{ total: number; balances: TokenBalance[] }> {
  const balances: TokenBalance[] = [];

  // Get Ethereum balance
  if (ethereumAddress && ethereumProvider) {
    try {
      const ethBalance = await getEthereumBalance(ethereumAddress, ethereumProvider, 'sepolia');
      balances.push(ethBalance);
    } catch (error) {
      console.error('Failed to get Ethereum balance:', error);
    }
  }

  // Get Solana balance
  if (solanaAddress && solanaConnection) {
    try {
      const solBalance = await getSolanaBalance(solanaAddress, solanaConnection);
      balances.push(solBalance);
    } catch (error) {
      console.error('Failed to get Solana balance:', error);
    }
  }

  const total = balances.reduce((sum, b) => sum + b.balance, 0);

  return {
    total,
    balances,
  };
}

/**
 * Transfer SOUL tokens on Ethereum/Sepolia
 */
export async function transferEthereum(
  to: string,
  amount: number,
  provider: IProvider
): Promise<string> {
  try {
    const contractAddress = SOUL_TOKEN_CONFIG.addresses.sepolia;
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    // Get user address
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error('No account connected');
    }

    const from = accounts[0];
    const amountWei = BigInt(Math.floor(amount * 10 ** SOUL_TOKEN_CONFIG.decimals.ethereum));

    // Encode transfer(address to, uint256 amount)
    // transfer(address,uint256) = 0xa9059cbb
    const toPadded = to.slice(2).padStart(64, '0');
    const amountPadded = amountWei.toString(16).padStart(64, '0');
    const data = `0xa9059cbb${toPadded}${amountPadded}`;

    // Send transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to: contractAddress,
          data,
          gas: '0x186a0', // 100000 gas
        },
      ],
    }) as string;

    return txHash;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

/**
 * Transfer SOUL tokens on Solana
 */
export async function transferSolana(
  to: string,
  amount: number,
  fromKeypair: Keypair,
  connection: Connection,
  mintAddress?: string
): Promise<string> {
  try {
    const mintPubkey = mintAddress 
      ? new PublicKey(mintAddress)
      : new PublicKey(SOUL_TOKEN_CONFIG.addresses.solana || 'SoulCastTokenProgramID111111111111111111111111');
    
    const toPubkey = new PublicKey(to);
    const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromKeypair.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);

    // Check if recipient token account exists
    let createATAInstruction;
    try {
      await getAccount(connection, toTokenAccount);
    } catch {
      // Create associated token account if it doesn't exist
      createATAInstruction = createAssociatedTokenAccountInstruction(
        fromKeypair.publicKey,
        toTokenAccount,
        toPubkey,
        mintPubkey
      );
    }

    // Create transfer instruction
    const { createTransferInstruction } = await import('@solana/spl-token');
    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromKeypair.publicKey,
      BigInt(Math.floor(amount * 10 ** SOUL_TOKEN_CONFIG.decimals.solana))
    );

    // Build and send transaction
    const { Transaction } = await import('@solana/web3.js');
    const transaction = new Transaction();
    
    if (createATAInstruction) {
      transaction.add(createATAInstruction);
    }
    transaction.add(transferInstruction);

    const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    await connection.confirmTransaction(signature);

    return signature;
  } catch (error: any) {
    throw new Error(`Solana transfer failed: ${error.message}`);
  }
}

/**
 * Stake SOUL tokens on Ethereum
 */
export async function stakeEthereum(
  amount: number,
  provider: IProvider
): Promise<string> {
  try {
    const contractAddress = SOUL_TOKEN_CONFIG.addresses.sepolia;
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error('No account connected');
    }

    const amountWei = BigInt(Math.floor(amount * 10 ** SOUL_TOKEN_CONFIG.decimals.ethereum));

    // Encode stake(uint256 amount)
    // stake(uint256) = 0x... (function selector)
    const amountPadded = amountWei.toString(16).padStart(64, '0');
    const data = `0x...${amountPadded}`; // TODO: Get actual function selector

    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: contractAddress,
          data,
        },
      ],
    }) as string;

    return txHash;
  } catch (error: any) {
    throw new Error(`Staking failed: ${error.message}`);
  }
}

/**
 * Get staking info on Ethereum
 */
export async function getEthereumStakeInfo(
  address: string,
  provider: IProvider
): Promise<StakeInfo> {
  try {
    const contractAddress = SOUL_TOKEN_CONFIG.addresses.sepolia;
    if (!contractAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    // Call getStakeInfo(address) on contract
    const result = await provider.request({
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: `0x...${address.slice(2).padStart(64, '0')}`, // TODO: Get actual function selector
        },
        'latest',
      ],
    });

    // Decode result (stakedAmount, stakedAt, pendingRewards, lastClaim)
    // For now, return mock data
    return {
      stakedAmount: 0,
      pendingRewards: 0,
      stakedAt: 0,
      lastClaim: 0,
    };
  } catch (error: any) {
    console.error('Error getting stake info:', error);
    return {
      stakedAmount: 0,
      pendingRewards: 0,
      stakedAt: 0,
      lastClaim: 0,
    };
  }
}

/**
 * Get staking info on Solana
 */
export async function getSolanaStakeInfo(
  address: string,
  connection: Connection,
  programId?: string
): Promise<StakeInfo> {
  try {
    // TODO: Query Solana program for stake info
    // This would use Anchor to query the UserStake account
    return {
      stakedAmount: 0,
      pendingRewards: 0,
      stakedAt: 0,
      lastClaim: 0,
    };
  } catch (error: any) {
    console.error('Error getting Solana stake info:', error);
    return {
      stakedAmount: 0,
      pendingRewards: 0,
      stakedAt: 0,
      lastClaim: 0,
    };
  }
}

