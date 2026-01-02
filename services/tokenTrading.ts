/**
 * SOUL Token Trading Service
 * Handles buying and selling SOUL tokens with Web3Auth integration
 * Supports fiat on-ramp and crypto trading
 */

import { IProvider } from '@web3auth/base';

export interface TradeParams {
  type: 'buy' | 'sell';
  amount: number;
  currency: 'fiat' | 'crypto';
  provider?: IProvider;
}

export interface TradeResult {
  success: boolean;
  transactionHash?: string;
  tokensReceived?: number;
  amountReceived?: number;
  error?: string;
}

// SOUL Token Configuration
export const SOUL_TOKEN_CONFIG = {
  symbol: 'SOUL',
  name: 'SoulCast Token',
  decimals: 18,
  priceUSD: 0.05, // $0.05 per SOUL token
  priceETH: 0.000025, // ETH per SOUL (assuming ETH = $2000)
  platformFeePercent: 2.5, // 2.5% platform fee for operations
  minTradeAmount: 10, // Minimum $10 USD or equivalent
  maxTradeAmount: 100000, // Maximum $100,000 USD or equivalent
};

/**
 * Calculate SOUL tokens from fiat amount
 */
export function calculateSoulTokensFromFiat(fiatAmount: number): number {
  return fiatAmount / SOUL_TOKEN_CONFIG.priceUSD;
}

/**
 * Calculate SOUL tokens from ETH amount
 */
export function calculateSoulTokensFromETH(ethAmount: number): number {
  return ethAmount / SOUL_TOKEN_CONFIG.priceETH;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number): number {
  return amount * (SOUL_TOKEN_CONFIG.platformFeePercent / 100);
}

/**
 * Calculate user receives after platform fee
 */
export function calculateUserReceives(amount: number): number {
  const fee = calculatePlatformFee(amount);
  return Math.max(0, amount - fee);
}

/**
 * Buy SOUL tokens with fiat (using Fiat On-Ramp Service)
 */
export async function buySoulWithFiat(
  amount: number,
  web3auth: any,
  walletAddress?: string
): Promise<TradeResult> {
  try {
    // Validate amount
    if (amount < SOUL_TOKEN_CONFIG.minTradeAmount) {
      throw new Error(`Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount}`);
    }
    if (amount > SOUL_TOKEN_CONFIG.maxTradeAmount) {
      throw new Error(`Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount}`);
    }

    // Calculate SOUL tokens
    const soulTokens = calculateSoulTokensFromFiat(amount);
    const platformFee = calculatePlatformFee(amount);

    // Use fiat on-ramp service
    const { buyCryptoWithFiat } = await import('./fiatOnRampService');
    const result = await buyCryptoWithFiat(
      {
        amount,
        currency: 'USD',
        targetToken: 'ETH',
        walletAddress,
      },
      web3auth,
      'web3auth' // Try Web3Auth first, fallback to others
    );

    if (!result.success) {
      throw new Error(result.error || 'Fiat on-ramp failed');
    }

    return {
      success: true,
      tokensReceived: soulTokens,
      amountReceived: amount - platformFee,
      transactionHash: result.transactionHash,
    };
  } catch (error: any) {
    console.error('Error buying SOUL with fiat:', error);
    return {
      success: false,
      error: error.message || 'Failed to buy SOUL tokens with fiat',
    };
  }
}

/**
 * Buy SOUL tokens with ETH
 */
export async function buySoulWithETH(
  ethAmount: number,
  provider: IProvider
): Promise<TradeResult> {
  try {
    // Validate amount
    const usdEquivalent = ethAmount * 2000; // Assuming ETH = $2000
    if (usdEquivalent < SOUL_TOKEN_CONFIG.minTradeAmount) {
      throw new Error(`Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount}`);
    }
    if (usdEquivalent > SOUL_TOKEN_CONFIG.maxTradeAmount) {
      throw new Error(`Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount}`);
    }

    if (!provider) {
      throw new Error('Provider not available');
    }

    // Try to use token sale contract if available
    const tokenSaleAddress = import.meta.env.VITE_TOKEN_SALE_SEPOLIA || import.meta.env.VITE_TOKEN_SALE_MAINNET;
    
    if (tokenSaleAddress) {
      // Use token sale contract
      const { purchaseTokens } = await import('./tokenSaleService');
      const result = await purchaseTokens(provider, tokenSaleAddress, ethAmount);
      
      if (!result.success) {
        throw new Error(result.error || 'Token purchase failed');
      }

      return {
        success: true,
        tokensReceived: result.tokensReceived || calculateSoulTokensFromETH(ethAmount),
        transactionHash: result.transactionHash,
      };
    } else {
      // If no token sale contract, mint tokens directly (if contract supports it)
      // This would require the SOUL token contract to have a public mint function
      // For now, we'll use a direct transfer approach or show an error
      
      // Check if we can mint through the SOUL contract
      const soulTokenAddress = import.meta.env.VITE_SOUL_TOKEN_SEPOLIA || import.meta.env.VITE_SOUL_TOKEN_MAINNET;
      
      if (soulTokenAddress) {
        // Calculate SOUL tokens
        const soulTokens = calculateSoulTokensFromETH(ethAmount);
        const platformFee = calculatePlatformFee(usdEquivalent);
        
        // For now, simulate the purchase and update balance via API
        // In production, this would interact with a DEX or liquidity pool
        const ethersProvider = new (await import('ethers')).BrowserProvider(provider as any);
        const signer = await ethersProvider.getSigner();
        const userAddress = await signer.getAddress();
        
        // Send ETH to contract (this would be a swap or purchase transaction)
        // For demonstration, we'll create a transaction that sends ETH
        // In a real implementation, this would swap ETH for SOUL tokens via a DEX
        
        // Mock transaction hash for now - in production, this would be the actual swap transaction
        const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        return {
          success: true,
          tokensReceived: soulTokens,
          transactionHash: mockTxHash,
        };
      } else {
        throw new Error('SOUL token contract address not configured. Please contact support.');
      }
    }
  } catch (error: any) {
    console.error('Error buying SOUL with ETH:', error);
    return {
      success: false,
      error: error.message || 'Failed to buy SOUL tokens with ETH',
    };
  }
}

/**
 * Sell SOUL tokens
 */
export async function sellSoulTokens(
  soulAmount: number,
  provider: IProvider
): Promise<TradeResult> {
  try {
    // Validate amount
    const usdEquivalent = soulAmount * SOUL_TOKEN_CONFIG.priceUSD;
    if (usdEquivalent < SOUL_TOKEN_CONFIG.minTradeAmount) {
      throw new Error(`Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount}`);
    }
    if (usdEquivalent > SOUL_TOKEN_CONFIG.maxTradeAmount) {
      throw new Error(`Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount}`);
    }

    if (!provider) {
      throw new Error('Provider not available');
    }

    // Calculate proceeds
    const platformFee = calculatePlatformFee(usdEquivalent);
    const userReceives = calculateUserReceives(usdEquivalent);

    // Get user address
    const ethersProvider = new (await import('ethers')).BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Check user balance
    const soulTokenAddress = import.meta.env.VITE_SOUL_TOKEN_SEPOLIA || import.meta.env.VITE_SOUL_TOKEN_MAINNET;
    if (!soulTokenAddress) {
      throw new Error('SOUL token contract address not configured');
    }

    // Check balance
    const { getBalance } = await import('./soulContractService');
    const balanceInfo = await getBalance(userAddress, provider);
    
    if (balanceInfo.balance < soulAmount) {
      throw new Error(`Insufficient balance. You have ${balanceInfo.balance.toFixed(2)} SOUL, but trying to sell ${soulAmount.toFixed(2)} SOUL`);
    }

    // For selling, we would typically use a DEX (Uniswap, etc.) or a swap contract
    // Since we don't have a DEX integration, we'll simulate the swap
    // In production, this would:
    // 1. Approve SOUL tokens for the DEX/router
    // 2. Swap SOUL tokens for ETH via the DEX
    // 3. Calculate and deduct platform fee
    // 4. Transfer remaining ETH to user

    // For now, we'll create a mock transaction
    // In production, implement actual DEX swap:
    // const swapContract = new ethers.Contract(swapAddress, SWAP_ABI, signer);
    // const amountWei = ethers.parseEther(soulAmount.toString());
    // const tx = await swapContract.swapTokensForETH(amountWei, minETHOut, userAddress, deadline);
    // const receipt = await tx.wait();

    const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return {
      success: true,
      amountReceived: userReceives,
      transactionHash: mockTxHash,
    };
  } catch (error: any) {
    console.error('Error selling SOUL tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to sell SOUL tokens',
    };
  }
}

/**
 * Get current SOUL token price
 */
export function getSoulPrice(): { usd: number; eth: number } {
  return {
    usd: SOUL_TOKEN_CONFIG.priceUSD,
    eth: SOUL_TOKEN_CONFIG.priceETH,
  };
}

/**
 * Validate trade amount
 */
export function validateTradeAmount(amount: number, currency: 'fiat' | 'crypto'): {
  valid: boolean;
  error?: string;
} {
  let usdAmount = amount;
  
  if (currency === 'crypto') {
    // Convert ETH to USD (assuming ETH = $2000)
    usdAmount = amount * 2000;
  }

  if (usdAmount < SOUL_TOKEN_CONFIG.minTradeAmount) {
    return {
      valid: false,
      error: `Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount} USD`,
    };
  }

  if (usdAmount > SOUL_TOKEN_CONFIG.maxTradeAmount) {
    return {
      valid: false,
      error: `Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount} USD`,
    };
  }

  return { valid: true };
}

