/**
 * Enhanced Prediction Market Service with CPMM Algorithm
 * Implements Constant Product Market Maker (x * y = k) with slippage protection
 */

export interface MarketState {
  yesPool: number;
  noPool: number;
  k: number; // constant product
  totalLiquidity: number;
  feeRate: number; // e.g., 0.02 = 2%
}

export interface TradeQuote {
  inputAmount: number;
  outputAmount: number;
  priceImpact: number; // percentage
  effectivePrice: number;
  fee: number;
  newYesPrice: number;
  newNoPrice: number;
  slippageWarning: 'low' | 'medium' | 'high' | 'extreme';
}

export interface PriceInfo {
  yesPrice: number; // 0-1
  noPrice: number;  // 0-1
  yesPriceBps: number; // 0-10000
  noPriceBps: number;
}

/**
 * CPMM: Constant Product Market Maker
 * Based on Uniswap's x * y = k formula adapted for prediction markets
 */
export class CPMMEngine {
  private yesPool: number;
  private noPool: number;
  private k: number;
  private feeRate: number;

  constructor(initialLiquidity: number, feeRate: number = 0.02) {
    // Initialize with equal pools (50/50)
    this.yesPool = initialLiquidity / 2;
    this.noPool = initialLiquidity / 2;
    this.k = this.yesPool * this.noPool;
    this.feeRate = feeRate;
  }

  /**
   * Get current market prices
   */
  getPrices(): PriceInfo {
    const total = this.yesPool + this.noPool;
    const yesPrice = this.noPool / total; // Price of YES = proportion of NO pool
    const noPrice = this.yesPool / total;  // Price of NO = proportion of YES pool
    
    return {
      yesPrice,
      noPrice,
      yesPriceBps: Math.round(yesPrice * 10000),
      noPriceBps: Math.round(noPrice * 10000),
    };
  }

  /**
   * Get current market state
   */
  getState(): MarketState {
    return {
      yesPool: this.yesPool,
      noPool: this.noPool,
      k: this.k,
      totalLiquidity: this.yesPool + this.noPool,
      feeRate: this.feeRate,
    };
  }

  /**
   * Calculate trade quote for buying YES tokens
   * Uses CPMM formula: (yesPool - dy) * (noPool + dx) = k
   */
  quoteYesBuy(inputAmount: number): TradeQuote {
    const fee = inputAmount * this.feeRate;
    const amountAfterFee = inputAmount - fee;
    
    // Current price before trade
    const currentYesPrice = this.noPool / (this.yesPool + this.noPool);
    
    // Calculate output using CPMM
    // New noPool = noPool + amountAfterFee
    // New yesPool = k / newNoPool
    const newNoPool = this.noPool + amountAfterFee;
    const newYesPool = this.k / newNoPool;
    const outputAmount = this.yesPool - newYesPool;
    
    // Calculate effective price and price impact
    const effectivePrice = inputAmount / outputAmount;
    const priceImpact = ((effectivePrice / currentYesPrice) - 1) * 100;
    
    // New prices after trade
    const newTotal = newYesPool + newNoPool;
    const newYesPrice = newNoPool / newTotal;
    const newNoPrice = newYesPool / newTotal;
    
    return {
      inputAmount,
      outputAmount,
      priceImpact: Math.abs(priceImpact),
      effectivePrice,
      fee,
      newYesPrice,
      newNoPrice,
      slippageWarning: this.getSlippageWarning(Math.abs(priceImpact)),
    };
  }

  /**
   * Calculate trade quote for buying NO tokens
   */
  quoteNoBuy(inputAmount: number): TradeQuote {
    const fee = inputAmount * this.feeRate;
    const amountAfterFee = inputAmount - fee;
    
    // Current price before trade
    const currentNoPrice = this.yesPool / (this.yesPool + this.noPool);
    
    // Calculate output using CPMM
    const newYesPool = this.yesPool + amountAfterFee;
    const newNoPool = this.k / newYesPool;
    const outputAmount = this.noPool - newNoPool;
    
    // Calculate effective price and price impact
    const effectivePrice = inputAmount / outputAmount;
    const priceImpact = ((effectivePrice / currentNoPrice) - 1) * 100;
    
    // New prices after trade
    const newTotal = newYesPool + newNoPool;
    const newYesPrice = newNoPool / newTotal;
    const newNoPrice = newYesPool / newTotal;
    
    return {
      inputAmount,
      outputAmount,
      priceImpact: Math.abs(priceImpact),
      effectivePrice,
      fee,
      newYesPrice,
      newNoPrice,
      slippageWarning: this.getSlippageWarning(Math.abs(priceImpact)),
    };
  }

  /**
   * Execute YES buy with slippage protection
   */
  executeYesBuy(inputAmount: number, maxSlippage: number = 5): TradeQuote | { error: string } {
    const quote = this.quoteYesBuy(inputAmount);
    
    if (quote.priceImpact > maxSlippage) {
      return {
        error: `Price impact (${quote.priceImpact.toFixed(2)}%) exceeds max slippage (${maxSlippage}%)`,
      };
    }
    
    // Execute trade
    const fee = inputAmount * this.feeRate;
    const amountAfterFee = inputAmount - fee;
    this.noPool += amountAfterFee;
    this.yesPool = this.k / this.noPool;
    
    return quote;
  }

  /**
   * Execute NO buy with slippage protection
   */
  executeNoBuy(inputAmount: number, maxSlippage: number = 5): TradeQuote | { error: string } {
    const quote = this.quoteNoBuy(inputAmount);
    
    if (quote.priceImpact > maxSlippage) {
      return {
        error: `Price impact (${quote.priceImpact.toFixed(2)}%) exceeds max slippage (${maxSlippage}%)`,
      };
    }
    
    // Execute trade
    const fee = inputAmount * this.feeRate;
    const amountAfterFee = inputAmount - fee;
    this.yesPool += amountAfterFee;
    this.noPool = this.k / this.yesPool;
    
    return quote;
  }

  /**
   * Get slippage warning level
   */
  private getSlippageWarning(priceImpact: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (priceImpact < 1) return 'low';
    if (priceImpact < 3) return 'medium';
    if (priceImpact < 10) return 'high';
    return 'extreme';
  }

  /**
   * Add liquidity to the pool
   */
  addLiquidity(amount: number): { yesAdded: number; noAdded: number } {
    const ratio = this.yesPool / (this.yesPool + this.noPool);
    const yesAdded = amount * ratio;
    const noAdded = amount * (1 - ratio);
    
    this.yesPool += yesAdded;
    this.noPool += noAdded;
    this.k = this.yesPool * this.noPool;
    
    return { yesAdded, noAdded };
  }

  /**
   * Calculate potential winnings
   */
  calculatePotentialWinnings(side: 'YES' | 'NO', betAmount: number): number {
    const quote = side === 'YES' 
      ? this.quoteYesBuy(betAmount) 
      : this.quoteNoBuy(betAmount);
    
    // If you win, you get 1 token per share
    // Your profit = shares - betAmount
    return quote.outputAmount;
  }

  /**
   * Simulate price after a hypothetical trade (without executing)
   */
  simulatePriceAfterTrade(side: 'YES' | 'NO', amount: number): PriceInfo {
    const quote = side === 'YES' 
      ? this.quoteYesBuy(amount) 
      : this.quoteNoBuy(amount);
    
    return {
      yesPrice: quote.newYesPrice,
      noPrice: quote.newNoPrice,
      yesPriceBps: Math.round(quote.newYesPrice * 10000),
      noPriceBps: Math.round(quote.newNoPrice * 10000),
    };
  }
}

/**
 * Helper function to format price impact for display
 */
export function formatPriceImpact(impact: number): string {
  if (impact < 0.01) return '<0.01%';
  if (impact < 1) return `${impact.toFixed(2)}%`;
  return `${impact.toFixed(1)}%`;
}

/**
 * Helper function to get slippage color
 */
export function getSlippageColor(warning: 'low' | 'medium' | 'high' | 'extreme'): string {
  switch (warning) {
    case 'low': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'high': return 'text-orange-500';
    case 'extreme': return 'text-red-500';
  }
}

/**
 * Create a new CPMM market
 */
export function createCPMMMarket(initialLiquidity: number, feeRate: number = 0.02): CPMMEngine {
  return new CPMMEngine(initialLiquidity, feeRate);
}

export default CPMMEngine;
