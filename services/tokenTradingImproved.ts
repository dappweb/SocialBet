/**
 * Enhanced SOUL Token Trading Service
 * Handles buying and selling SOUL tokens with real ETH transactions
 * Supports both token sale contracts and direct ETH swaps
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

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

// Enhanced SOUL Token Configuration
export const SOUL_TOKEN_CONFIG = {
  symbol: 'SOUL',
  name: 'SoulCast Token',
  decimals: 18,
  priceUSD: 0.05, // $0.05 per SOUL token
  priceETH: 0.000025, // ETH per SOUL (assuming ETH = $2000)
  platformFeePercent: 2.5, // 2.5% platform fee for operations
  minTradeAmount: 10, // Minimum $10 USD or equivalent
  maxTradeAmount: 100000, // Maximum $100,000 USD or equivalent
  treasuryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Default treasury
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
 * Get current ETH price in USD (mock - in production use price oracle)
 */
export async function getETHPriceUSD(): Promise<number> {
  // In production, fetch from price oracle like Chainlink or CoinGecko
  // For now, return a mock price
  return 2000; // $2000 per ETH
}

/**
 * Enhanced Buy SOUL tokens with ETH
 */
export async function buySoulWithETH(
  ethAmount: number,
  provider: IProvider
): Promise<TradeResult> {
  try {
    // Get current ETH price
    const ethPriceUSD = await getETHPriceUSD();
    const usdEquivalent = ethAmount * ethPriceUSD;
    
    // Validate amount
    if (usdEquivalent < SOUL_TOKEN_CONFIG.minTradeAmount) {
      throw new Error(`Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount} USD (${(SOUL_TOKEN_CONFIG.minTradeAmount / ethPriceUSD).toFixed(6)} ETH)`);
    }
    if (usdEquivalent > SOUL_TOKEN_CONFIG.maxTradeAmount) {
      throw new Error(`Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount} USD (${(SOUL_TOKEN_CONFIG.maxTradeAmount / ethPriceUSD).toFixed(6)} ETH)`);
    }

    if (!provider) {
      throw new Error('Wallet provider not available. Please connect your wallet.');
    }

    // Get ethers provider and signer
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // Check user's ETH balance
    const balance = await ethersProvider.getBalance(userAddress);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    
    if (balanceETH < ethAmount) {
      throw new Error(`Insufficient ETH balance. You have ${balanceETH.toFixed(6)} ETH, but trying to spend ${ethAmount.toFixed(6)} ETH`);
    }

    // Check if we have enough ETH for gas fees (estimate 0.001 ETH for gas)
    const gasReserve = 0.001;
    if (balanceETH < ethAmount + gasReserve) {
      throw new Error(`Insufficient ETH for transaction and gas fees. You need at least ${(ethAmount + gasReserve).toFixed(6)} ETH`);
    }

    // Try to use token sale contract if available
    const tokenSaleAddress = import.meta.env.VITE_TOKEN_SALE_SEPOLIA || 
                            import.meta.env.VITE_TOKEN_SALE_MAINNET ||
                            import.meta.env.VITE_TOKEN_SALE_LOCAL;
    
    if (tokenSaleAddress && tokenSaleAddress !== '') {
      console.log('Using token sale contract:', tokenSaleAddress);
      
      // Use token sale contract
      const { purchaseTokens } = await import('./tokenSaleService');
      const result = await purchaseTokens(provider, tokenSaleAddress, ethAmount);
      
      if (!result.success) {
        throw new Error(result.error || 'Token sale contract purchase failed');
      }

      return {
        success: true,
        tokensReceived: result.tokensReceived || calculateSoulTokensFromETH(ethAmount),
        transactionHash: result.transactionHash,
      };
    } else {
      console.log('No token sale contract configured, using direct purchase method');
      
      // Direct purchase method - send ETH to treasury and mint SOUL tokens
      const soulTokenAddress = import.meta.env.VITE_SOUL_TOKEN_SEPOLIA || 
                              import.meta.env.VITE_SOUL_TOKEN_MAINNET ||
                              import.meta.env.VITE_SOUL_TOKEN_LOCAL;
      
      if (soulTokenAddress && soulTokenAddress !== '') {
        // Calculate SOUL tokens to receive
        const soulTokens = calculateSoulTokensFromETH(ethAmount);
        const platformFee = calculatePlatformFee(usdEquivalent);
        const tokensAfterFee = soulTokens * (1 - SOUL_TOKEN_CONFIG.platformFeePercent / 100);
        
        console.log(`Purchasing ${soulTokens.toFixed(2)} SOUL tokens for ${ethAmount} ETH`);
        console.log(`Platform fee: ${SOUL_TOKEN_CONFIG.platformFeePercent}%, tokens after fee: ${tokensAfterFee.toFixed(2)}`);
        
        // Get treasury address from env or use default
        const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS || SOUL_TOKEN_CONFIG.treasuryAddress;
        
        // Send ETH to treasury
        const tx = await signer.sendTransaction({
          to: treasuryAddress,
          value: ethers.parseEther(ethAmount.toString()),
          gasLimit: 21000, // Standard ETH transfer gas limit
        });
        
        console.log('Transaction sent:', tx.hash);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        if (!receipt) {
          throw new Error('Transaction failed - no receipt received');
        }
        
        if (receipt.status !== 1) {
          throw new Error('Transaction failed - transaction reverted');
        }
        
        console.log('Transaction confirmed:', receipt.hash);
        
        // Update user's SOUL balance via API (if backend is available)
        try {
          const response = await fetch('/api/users/update-soul-balance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userAddress,
              soulAmount: tokensAfterFee,
              transactionHash: receipt.hash,
              ethAmount,
              ethPriceUSD,
              type: 'purchase',
              timestamp: Date.now(),
            }),
          });
          
          if (!response.ok) {
            console.warn('Failed to update balance via API, but transaction succeeded');
          } else {
            console.log('Balance updated via API successfully');
          }
        } catch (apiError) {
          console.warn('API update failed, but transaction succeeded:', apiError);
          // Transaction still succeeded, so we don't throw an error
        }
        
        return {
          success: true,
          tokensReceived: tokensAfterFee,
          transactionHash: receipt.hash,
        };
      } else {
        throw new Error('SOUL token contract address not configured. Please set VITE_SOUL_TOKEN_SEPOLIA, VITE_SOUL_TOKEN_MAINNET, or VITE_SOUL_TOKEN_LOCAL in your .env file.');
      }
    }
  } catch (error: any) {
    console.error('Error buying SOUL with ETH:', error);
    
    // Provide more user-friendly error messages
    let userMessage = error.message;
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      userMessage = 'Insufficient ETH balance for this transaction.';
    } else if (error.code === 'USER_REJECTED') {
      userMessage = 'Transaction was rejected by user.';
    } else if (error.message?.includes('gas')) {
      userMessage = 'Transaction failed due to gas issues. Please try again with a higher gas limit.';
    } else if (error.message?.includes('network')) {
      userMessage = 'Network error. Please check your connection and try again.';
    }
    
    return {
      success: false,
      error: userMessage || 'Failed to buy SOUL tokens with ETH',
    };
  }
}

/**
 * Get user's ETH balance
 */
export async function getETHBalance(
  provider: IProvider,
  address?: string
): Promise<{ balance: number; formatted: string }> {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    
    let userAddress = address;
    if (!userAddress) {
      const signer = await ethersProvider.getSigner();
      userAddress = await signer.getAddress();
    }
    
    const balance = await ethersProvider.getBalance(userAddress);
    const formatted = ethers.formatEther(balance);
    
    return {
      balance: parseFloat(formatted),
      formatted: parseFloat(formatted).toFixed(6),
    };
  } catch (error: any) {
    console.error('Error getting ETH balance:', error);
    throw new Error(`Failed to get ETH balance: ${error.message}`);
  }
}

/**
 * Estimate gas for ETH purchase
 */
export async function estimateGasForPurchase(
  provider: IProvider,
  ethAmount: number
): Promise<{ gasLimit: number; gasPrice: string; estimatedCost: string }> {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    
    const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS || SOUL_TOKEN_CONFIG.treasuryAddress;
    
    // Estimate gas for the transaction
    const gasLimit = await ethersProvider.estimateGas({
      to: treasuryAddress,
      value: ethers.parseEther(ethAmount.toString()),
    });
    
    // Get current gas price
    const feeData = await ethersProvider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    // Calculate estimated cost
    const estimatedCost = ethers.formatEther(gasLimit * gasPrice);
    
    return {
      gasLimit: Number(gasLimit),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      estimatedCost,
    };
  } catch (error: any) {
    console.error('Error estimating gas:', error);
    // Return default values if estimation fails
    return {
      gasLimit: 21000,
      gasPrice: '20',
      estimatedCost: '0.00042', // 21000 * 20 gwei
    };
  }
}

/**
 * Validate trade amount with current ETH price
 */
export async function validateTradeAmount(amount: number, currency: 'fiat' | 'crypto'): Promise<{
  valid: boolean;
  error?: string;
  ethAmount?: number;
  usdAmount?: number;
}> {
  try {
    const ethPriceUSD = await getETHPriceUSD();
    
    let usdAmount = amount;
    let ethAmount = amount;
    
    if (currency === 'fiat') {
      ethAmount = amount / ethPriceUSD;
    } else {
      usdAmount = amount * ethPriceUSD;
    }

    if (usdAmount < SOUL_TOKEN_CONFIG.minTradeAmount) {
      return {
        valid: false,
        error: `Minimum trade amount is $${SOUL_TOKEN_CONFIG.minTradeAmount} USD (${(SOUL_TOKEN_CONFIG.minTradeAmount / ethPriceUSD).toFixed(6)} ETH)`,
        ethAmount,
        usdAmount,
      };
    }

    if (usdAmount > SOUL_TOKEN_CONFIG.maxTradeAmount) {
      return {
        valid: false,
        error: `Maximum trade amount is $${SOUL_TOKEN_CONFIG.maxTradeAmount} USD (${(SOUL_TOKEN_CONFIG.maxTradeAmount / ethPriceUSD).toFixed(6)} ETH)`,
        ethAmount,
        usdAmount,
      };
    }

    return { 
      valid: true, 
      ethAmount, 
      usdAmount 
    };
  } catch (error: any) {
    return {
      valid: false,
      error: 'Failed to validate amount. Please try again.',
    };
  }
}

/**
 * Get current SOUL token price with live ETH price
 */
export async function getSoulPrice(): Promise<{ usd: number; eth: number; ethPriceUSD: number }> {
  const ethPriceUSD = await getETHPriceUSD();
  return {
    usd: SOUL_TOKEN_CONFIG.priceUSD,
    eth: SOUL_TOKEN_CONFIG.priceUSD / ethPriceUSD,
    ethPriceUSD,
  };
}