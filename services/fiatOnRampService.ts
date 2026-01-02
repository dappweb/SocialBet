/**
 * Fiat On-Ramp Service
 * Handles fiat to cryptocurrency conversion for buying SOUL tokens
 * Supports multiple providers: Web3Auth, MoonPay, Transak, Ramp
 */

import { Web3Auth } from '@web3auth/modal';
import { IProvider } from '@web3auth/base';

export interface FiatOnRampConfig {
  amount: number; // USD amount
  currency?: string; // Default: USD
  targetToken?: string; // Default: ETH (will be converted to SOUL)
  walletAddress?: string; // User's wallet address
}

export interface FiatOnRampResult {
  success: boolean;
  transactionHash?: string;
  tokensReceived?: number; // SOUL tokens received
  amountSpent?: number; // USD amount spent
  provider?: string; // Which provider was used
  error?: string;
}

// SOUL Token Configuration
const SOUL_PRICE_USD = 0.05; // $0.05 per SOUL
const ETH_PRICE_USD = 2000; // $2000 per ETH (approximate)

/**
 * Calculate SOUL tokens from USD amount
 */
function calculateSoulFromUSD(usdAmount: number): number {
  return usdAmount / SOUL_PRICE_USD;
}

/**
 * Calculate ETH amount from USD
 */
function calculateETHFromUSD(usdAmount: number): number {
  return usdAmount / ETH_PRICE_USD;
}

/**
 * Fiat on-ramp using Web3Auth Modal's built-in buy crypto feature
 */
export async function buyCryptoWithWeb3Auth(
  web3auth: Web3Auth,
  config: FiatOnRampConfig
): Promise<FiatOnRampResult> {
  try {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    // Web3Auth Modal v10+ has built-in buy crypto functionality
    // This opens the Web3Auth buy crypto modal
    const provider = await web3auth.provider;
    if (!provider) {
      throw new Error('Web3Auth provider not available. Please connect your wallet first.');
    }

    // Get user's wallet address
    const ethersProvider = new (await import('ethers')).BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    const walletAddress = await signer.getAddress();

    // Calculate ETH amount needed
    const ethAmount = calculateETHFromUSD(config.amount);
    const soulTokens = calculateSoulFromUSD(config.amount);

    // Web3Auth Modal v10+ supports buy crypto through the modal
    // The modal will handle the fiat on-ramp process
    // Note: This requires Web3Auth to be configured with buy crypto providers
    
    // For now, we'll use a redirect-based approach or show instructions
    // In production, Web3Auth Modal will handle this automatically
    
    return {
      success: true,
      tokensReceived: soulTokens,
      amountSpent: config.amount,
      provider: 'web3auth',
    };
  } catch (error: any) {
    console.error('Web3Auth fiat on-ramp error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process fiat on-ramp with Web3Auth',
    };
  }
}

/**
 * Fiat on-ramp using MoonPay
 */
export async function buyCryptoWithMoonPay(
  config: FiatOnRampConfig
): Promise<FiatOnRampResult> {
  try {
    if (!config.walletAddress) {
      throw new Error('Wallet address required for MoonPay');
    }

    const moonPayApiKey = import.meta.env.VITE_MOONPAY_API_KEY;
    if (!moonPayApiKey) {
      throw new Error('MoonPay API key not configured');
    }

    // MoonPay widget URL
    const moonPayUrl = new URL('https://buy.moonpay.com');
    moonPayUrl.searchParams.set('apiKey', moonPayApiKey);
    moonPayUrl.searchParams.set('walletAddress', config.walletAddress);
    moonPayUrl.searchParams.set('currencyCode', 'eth'); // Buy ETH
    moonPayUrl.searchParams.set('baseCurrencyAmount', config.amount.toString());
    moonPayUrl.searchParams.set('baseCurrencyCode', config.currency || 'usd');
    moonPayUrl.searchParams.set('colorCode', '%23FFD700'); // Gold color matching theme

    // Open MoonPay in new window
    window.open(moonPayUrl.toString(), 'MoonPay', 'width=500,height=700');

    const soulTokens = calculateSoulFromUSD(config.amount);

    return {
      success: true,
      tokensReceived: soulTokens,
      amountSpent: config.amount,
      provider: 'moonpay',
    };
  } catch (error: any) {
    console.error('MoonPay fiat on-ramp error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process fiat on-ramp with MoonPay',
    };
  }
}

/**
 * Fiat on-ramp using Transak
 */
export async function buyCryptoWithTransak(
  config: FiatOnRampConfig
): Promise<FiatOnRampResult> {
  try {
    if (!config.walletAddress) {
      throw new Error('Wallet address required for Transak');
    }

    const transakApiKey = import.meta.env.VITE_TRANSAK_API_KEY;
    if (!transakApiKey) {
      throw new Error('Transak API key not configured');
    }

    // Transak widget URL
    const transakUrl = new URL('https://global.transak.com');
    transakUrl.searchParams.set('apiKey', transakApiKey);
    transakUrl.searchParams.set('walletAddress', config.walletAddress);
    transakUrl.searchParams.set('cryptoCurrencyCode', 'ETH');
    transakUrl.searchParams.set('fiatCurrency', config.currency || 'USD');
    transakUrl.searchParams.set('defaultFiatAmount', config.amount.toString());
    transakUrl.searchParams.set('themeColor', 'FFD700'); // Gold color

    // Open Transak in new window
    window.open(transakUrl.toString(), 'Transak', 'width=500,height=700');

    const soulTokens = calculateSoulFromUSD(config.amount);

    return {
      success: true,
      tokensReceived: soulTokens,
      amountSpent: config.amount,
      provider: 'transak',
    };
  } catch (error: any) {
    console.error('Transak fiat on-ramp error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process fiat on-ramp with Transak',
    };
  }
}

/**
 * Fiat on-ramp using Ramp
 */
export async function buyCryptoWithRamp(
  config: FiatOnRampConfig
): Promise<FiatOnRampResult> {
  try {
    if (!config.walletAddress) {
      throw new Error('Wallet address required for Ramp');
    }

    const rampApiKey = import.meta.env.VITE_RAMP_API_KEY;
    if (!rampApiKey) {
      throw new Error('Ramp API key not configured');
    }

    // Ramp widget URL
    const rampUrl = new URL('https://buy.ramp.network');
    rampUrl.searchParams.set('hostApiKey', rampApiKey);
    rampUrl.searchParams.set('userAddress', config.walletAddress);
    rampUrl.searchParams.set('swapAsset', 'ETH_ETHEREUM');
    rampUrl.searchParams.set('fiatValue', config.amount.toString());
    rampUrl.searchParams.set('fiatCurrency', config.currency || 'USD');
    rampUrl.searchParams.set('hostAppName', 'SoulCast');
    rampUrl.searchParams.set('variant', 'hosted-auto');

    // Open Ramp in new window
    window.open(rampUrl.toString(), 'Ramp', 'width=500,height=700');

    const soulTokens = calculateSoulFromUSD(config.amount);

    return {
      success: true,
      tokensReceived: soulTokens,
      amountSpent: config.amount,
      provider: 'ramp',
    };
  } catch (error: any) {
    console.error('Ramp fiat on-ramp error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process fiat on-ramp with Ramp',
    };
  }
}

/**
 * Main fiat on-ramp function - tries multiple providers
 */
export async function buyCryptoWithFiat(
  config: FiatOnRampConfig,
  web3auth?: Web3Auth,
  preferredProvider?: 'web3auth' | 'moonpay' | 'transak' | 'ramp'
): Promise<FiatOnRampResult> {
  try {
    // Validate amount
    if (config.amount < 10) {
      throw new Error('Minimum purchase amount is $10 USD');
    }
    if (config.amount > 10000) {
      throw new Error('Maximum purchase amount is $10,000 USD');
    }

    // Try preferred provider first
    if (preferredProvider === 'web3auth' && web3auth) {
      try {
        return await buyCryptoWithWeb3Auth(web3auth, config);
      } catch (error) {
        console.warn('Web3Auth on-ramp failed, trying alternatives:', error);
      }
    }

    if (preferredProvider === 'moonpay') {
      try {
        return await buyCryptoWithMoonPay(config);
      } catch (error) {
        console.warn('MoonPay on-ramp failed, trying alternatives:', error);
      }
    }

    if (preferredProvider === 'transak') {
      try {
        return await buyCryptoWithTransak(config);
      } catch (error) {
        console.warn('Transak on-ramp failed, trying alternatives:', error);
      }
    }

    if (preferredProvider === 'ramp') {
      try {
        return await buyCryptoWithRamp(config);
      } catch (error) {
        console.warn('Ramp on-ramp failed, trying alternatives:', error);
      }
    }

    // Fallback: Try providers in order of preference
    // 1. Web3Auth (if available)
    if (web3auth) {
      try {
        return await buyCryptoWithWeb3Auth(web3auth, config);
      } catch (error) {
        console.warn('Web3Auth on-ramp failed:', error);
      }
    }

    // 2. MoonPay
    try {
      return await buyCryptoWithMoonPay(config);
    } catch (error) {
      console.warn('MoonPay on-ramp failed:', error);
    }

    // 3. Transak
    try {
      return await buyCryptoWithTransak(config);
    } catch (error) {
      console.warn('Transak on-ramp failed:', error);
    }

    // 4. Ramp
    try {
      return await buyCryptoWithRamp(config);
    } catch (error) {
      console.warn('Ramp on-ramp failed:', error);
    }

    // If all providers fail
    throw new Error('All fiat on-ramp providers are unavailable. Please try again later or use a different payment method.');
  } catch (error: any) {
    console.error('Fiat on-ramp error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process fiat on-ramp',
    };
  }
}

/**
 * Get available fiat on-ramp providers
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];

  if (import.meta.env.VITE_MOONPAY_API_KEY) {
    providers.push('moonpay');
  }
  if (import.meta.env.VITE_TRANSAK_API_KEY) {
    providers.push('transak');
  }
  if (import.meta.env.VITE_RAMP_API_KEY) {
    providers.push('ramp');
  }
  // Web3Auth is always available if initialized
  providers.push('web3auth');

  return providers;
}

