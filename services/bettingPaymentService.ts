/**
 * Betting Payment Service
 * Integrates Soul token payments with prediction market betting
 * Provides unified betting functionality using Soul tokens
 */

import { IProvider } from '@web3auth/base';
import { soulPaymentService, SoulPaymentRequest, PAYMENT_CONFIG } from './soulPaymentService';
import { soulWalletService } from './soulWalletService';
import { 
  placeBet as placeBetOnChain, 
  getMarketPrices as getOnChainMarketPrices,
  calculatePayout as calculateOnChainPayout,
  getMarket as getOnChainMarket
} from './predictionMarketService';
import { betsApi } from './api';

// Environment variable types
declare global {
  interface ImportMeta {
    env: {
      VITE_PREDICTION_MARKET_SEPOLIA?: string;
      VITE_PREDICTION_MARKET_MAINNET?: string;
      VITE_PREDICTION_MARKET_LOCAL?: string;
    };
  }
}

// Betting interfaces
export interface SoulBetRequest {
  userId: string;
  marketId: string;
  betType: 'YES' | 'NO';
  soulAmount: number;
  maxSlippage?: number;
  useOnChain?: boolean; // Whether to place bet on-chain or just record in API
}

export interface BetResult {
  success: boolean;
  betId?: string;
  transactionHash?: string;
  actualAmount?: number;
  priceAtBet?: number;
  potentialPayout?: number;
  newBalance?: number;
  error?: string;
}

export interface BetCostCalculation {
  soulAmount: number;
  platformFee: number;
  totalCost: number;
  priceAtBet: number;
  potentialPayout: number;
  maxPayout: number;
  slippage: number;
}

export interface BettingStatistics {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  averageBet: number;
  largestWin: number;
  currentStreak: number;
  favoriteCategory: string;
  profitLoss: number;
}

/**
 * Betting Payment Service Class
 * Handles Soul token payments for prediction market betting
 */
export class BettingPaymentService {
  private static instance: BettingPaymentService;
  private betHistory: Map<string, any[]> = new Map();
  private onChainContractAddress: string | null = null;

  private constructor() {
    // Initialize with contract address from environment
    this.onChainContractAddress = import.meta.env.VITE_PREDICTION_MARKET_SEPOLIA || 
                                  import.meta.env.VITE_PREDICTION_MARKET_MAINNET ||
                                  import.meta.env.VITE_PREDICTION_MARKET_LOCAL ||
                                  null;
  }

  public static getInstance(): BettingPaymentService {
    if (!BettingPaymentService.instance) {
      BettingPaymentService.instance = new BettingPaymentService();
    }
    return BettingPaymentService.instance;
  }

  /**
   * Place bet using Soul tokens
   */
  async placeBetWithSoul(request: SoulBetRequest, provider?: IProvider): Promise<BetResult> {
    try {
      console.log(`Placing Soul bet: ${request.soulAmount} SOUL on ${request.betType} for market ${request.marketId}`);

      // Validate betting request
      const validation = await this.validateBetRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Calculate bet cost including fees
      const costCalculation = await this.calculateBetCost(request.soulAmount, request.marketId);
      
      // Check if user has sufficient balance
      const hasSufficientBalance = soulWalletService.hasSufficientBalance(request.userId, costCalculation.totalCost);
      if (!hasSufficientBalance) {
        return {
          success: false,
          error: `Insufficient Soul balance. Required: ${costCalculation.totalCost} SOUL`,
        };
      }

      // Lock Soul tokens for the bet
      const lockSuccess = soulWalletService.lockSoulTokens(request.userId, costCalculation.totalCost);
      if (!lockSuccess) {
        return {
          success: false,
          error: 'Failed to lock Soul tokens for bet',
        };
      }

      try {
        // Process Soul payment for the bet
        const paymentRequest: SoulPaymentRequest = {
          userId: request.userId,
          amount: costCalculation.totalCost,
          purpose: 'betting',
          marketId: request.marketId,
          metadata: {
            betType: request.betType,
            soulAmount: request.soulAmount,
            priceAtBet: costCalculation.priceAtBet,
            potentialPayout: costCalculation.potentialPayout,
            platformFee: costCalculation.platformFee,
          },
        };

        const paymentResult = await soulPaymentService.paySoulTokens(paymentRequest);
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }

        // Place bet on-chain if requested and provider available
        let onChainTxHash: string | undefined;
        if (request.useOnChain && provider && this.onChainContractAddress) {
          try {
            const onChainResult = await placeBetOnChain(
              provider,
              this.onChainContractAddress,
              parseInt(request.marketId),
              request.betType,
              request.soulAmount
            );
            
            if (onChainResult.success) {
              onChainTxHash = onChainResult.txHash;
            } else {
              console.warn('On-chain bet failed, continuing with off-chain bet:', onChainResult.error);
            }
          } catch (onChainError) {
            console.warn('On-chain bet error, continuing with off-chain bet:', onChainError);
          }
        }

        // Record bet in API/database
        const betRecord = await betsApi.place({
          marketId: request.marketId,
          betType: request.betType,
          amount: request.soulAmount,
          priceAtBet: costCalculation.priceAtBet,
          blockchain: onChainTxHash ? 'ethereum' : undefined,
          userId: request.userId,
        });

        // Store bet in local history
        this.addBetToHistory(request.userId, {
          ...betRecord,
          soulAmount: request.soulAmount,
          totalCost: costCalculation.totalCost,
          platformFee: costCalculation.platformFee,
          potentialPayout: costCalculation.potentialPayout,
          onChainTxHash,
          paymentTransactionId: paymentResult.transactionId,
        });

        // Unlock the locked tokens (they've been spent)
        soulWalletService.unlockSoulTokens(request.userId, costCalculation.totalCost);

        console.log(`Soul bet placed successfully: ${betRecord.id}`);

        return {
          success: true,
          betId: betRecord.id,
          transactionHash: onChainTxHash,
          actualAmount: request.soulAmount,
          priceAtBet: costCalculation.priceAtBet,
          potentialPayout: costCalculation.potentialPayout,
          newBalance: paymentResult.newBalance,
        };

      } catch (error: any) {
        // Unlock tokens on error
        soulWalletService.unlockSoulTokens(request.userId, costCalculation.totalCost);
        throw error;
      }

    } catch (error: any) {
      console.error('Soul betting error:', error);
      return {
        success: false,
        error: error.message || 'Failed to place bet with Soul tokens',
      };
    }
  }

  /**
   * Calculate bet cost including platform fees
   */
  async calculateBetCost(amount: number, marketId: string): Promise<BetCostCalculation> {
    try {
      // Get current market prices (mock for now, would fetch from API/contract)
      const marketPrices = await this.getMarketPrices(marketId);
      
      // Calculate platform fee
      const platformFee = amount * (PAYMENT_CONFIG.fees.platformFeePercent / 100);
      const totalCost = amount + platformFee;
      
      // Calculate potential payout (simplified calculation)
      const priceAtBet = marketPrices.yesPrice; // Assuming YES bet for simplicity
      const potentialPayout = amount * (1 / priceAtBet);
      const maxPayout = potentialPayout * 1.1; // 10% buffer for slippage
      
      return {
        soulAmount: amount,
        platformFee,
        totalCost,
        priceAtBet,
        potentialPayout,
        maxPayout,
        slippage: 0.05, // 5% default slippage
      };

    } catch (error: any) {
      console.error('Error calculating bet cost:', error);
      // Return default calculation on error
      return {
        soulAmount: amount,
        platformFee: amount * 0.025, // 2.5% default fee
        totalCost: amount * 1.025,
        priceAtBet: 0.5, // 50% default price
        potentialPayout: amount * 2,
        maxPayout: amount * 2.2,
        slippage: 0.05,
      };
    }
  }

  /**
   * Process winnings for resolved bets
   */
  async processWinnings(betId: string, winAmount: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Processing winnings: ${winAmount} SOUL for bet ${betId}`);

      // Find the bet record
      const bet = await this.findBetById(betId);
      if (!bet) {
        return {
          success: false,
          error: 'Bet not found',
        };
      }

      // Add winnings to user's Soul balance
      const currentBalance = await soulWalletService.getSoulBalance(bet.userId);
      const newBalance = currentBalance + winAmount;

      // Update balance with winnings
      soulWalletService.updateBalanceAfterTransaction(
        bet.userId,
        newBalance,
        winAmount,
        'betting_winnings'
      );

      // Update bet record
      bet.status = 'won';
      bet.winAmount = winAmount;
      bet.claimedAt = new Date();

      console.log(`Winnings processed successfully: ${winAmount} SOUL`);

      return { success: true };

    } catch (error: any) {
      console.error('Error processing winnings:', error);
      return {
        success: false,
        error: error.message || 'Failed to process winnings',
      };
    }
  }

  /**
   * Get betting statistics for user
   */
  async getBettingStatistics(userId: string): Promise<BettingStatistics> {
    try {
      const userBets = this.betHistory.get(userId) || [];
      
      if (userBets.length === 0) {
        return {
          totalBets: 0,
          totalWagered: 0,
          totalWon: 0,
          winRate: 0,
          averageBet: 0,
          largestWin: 0,
          currentStreak: 0,
          favoriteCategory: '',
          profitLoss: 0,
        };
      }

      const totalBets = userBets.length;
      const totalWagered = userBets.reduce((sum, bet) => sum + bet.soulAmount, 0);
      const wonBets = userBets.filter(bet => bet.status === 'won');
      const totalWon = wonBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);
      const winRate = wonBets.length / totalBets;
      const averageBet = totalWagered / totalBets;
      const largestWin = Math.max(...wonBets.map(bet => bet.winAmount || 0), 0);
      
      // Calculate current streak
      let currentStreak = 0;
      for (let i = userBets.length - 1; i >= 0; i--) {
        if (userBets[i].status === 'won') {
          currentStreak++;
        } else if (userBets[i].status === 'lost') {
          break;
        }
      }

      // Find favorite category (most bet on)
      const categoryCount: Record<string, number> = {};
      userBets.forEach(bet => {
        categoryCount[bet.category || 'Unknown'] = (categoryCount[bet.category || 'Unknown'] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, ''
      );

      const profitLoss = totalWon - totalWagered;

      return {
        totalBets,
        totalWagered,
        totalWon,
        winRate,
        averageBet,
        largestWin,
        currentStreak,
        favoriteCategory,
        profitLoss,
      };

    } catch (error: any) {
      console.error('Error getting betting statistics:', error);
      return {
        totalBets: 0,
        totalWagered: 0,
        totalWon: 0,
        winRate: 0,
        averageBet: 0,
        largestWin: 0,
        currentStreak: 0,
        favoriteCategory: '',
        profitLoss: 0,
      };
    }
  }

  /**
   * Get user's betting history
   */
  async getBettingHistory(userId: string, filters?: {
    status?: string;
    marketId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let history = this.betHistory.get(userId) || [];

      // Apply filters
      if (filters) {
        if (filters.status) {
          history = history.filter(bet => bet.status === filters.status);
        }
        if (filters.marketId) {
          history = history.filter(bet => bet.marketId === filters.marketId);
        }
      }

      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      if (filters?.offset) {
        history = history.slice(filters.offset);
      }
      if (filters?.limit) {
        history = history.slice(0, filters.limit);
      }

      return history;

    } catch (error: any) {
      console.error('Error getting betting history:', error);
      return [];
    }
  }

  /**
   * Cancel pending bet (if possible)
   */
  async cancelBet(betId: string, userId: string): Promise<{ success: boolean; refundAmount?: number; error?: string }> {
    try {
      const bet = await this.findBetById(betId);
      if (!bet) {
        return {
          success: false,
          error: 'Bet not found',
        };
      }

      if (bet.userId !== userId) {
        return {
          success: false,
          error: 'Unauthorized to cancel this bet',
        };
      }

      if (bet.status !== 'pending') {
        return {
          success: false,
          error: 'Only pending bets can be cancelled',
        };
      }

      // Refund the bet amount
      const refundResult = await soulPaymentService.refundPayment(
        bet.paymentTransactionId,
        'Bet cancelled by user'
      );

      if (!refundResult.success) {
        return {
          success: false,
          error: refundResult.error || 'Failed to process refund',
        };
      }

      // Update bet status
      bet.status = 'cancelled';
      bet.cancelledAt = new Date();

      return {
        success: true,
        refundAmount: refundResult.refundAmount,
      };

    } catch (error: any) {
      console.error('Error cancelling bet:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel bet',
      };
    }
  }

  // Private helper methods

  /**
   * Validate bet request
   */
  private async validateBetRequest(request: SoulBetRequest): Promise<{ valid: boolean; error?: string }> {
    // Check minimum bet amount
    if (request.soulAmount < PAYMENT_CONFIG.services.betting.minBetSoul) {
      return {
        valid: false,
        error: `Minimum bet amount is ${PAYMENT_CONFIG.services.betting.minBetSoul} SOUL`,
      };
    }

    // Check maximum bet amount
    if (request.soulAmount > PAYMENT_CONFIG.services.betting.maxBetSoul) {
      return {
        valid: false,
        error: `Maximum bet amount is ${PAYMENT_CONFIG.services.betting.maxBetSoul} SOUL`,
      };
    }

    // Check if betting is enabled
    if (!PAYMENT_CONFIG.services.betting.enabled) {
      return {
        valid: false,
        error: 'Betting is currently disabled',
      };
    }

    // Validate bet type
    if (!['YES', 'NO'].includes(request.betType)) {
      return {
        valid: false,
        error: 'Invalid bet type. Must be YES or NO',
      };
    }

    return { valid: true };
  }

  /**
   * Get market prices (mock implementation)
   */
  private async getMarketPrices(marketId: string): Promise<{ yesPrice: number; noPrice: number }> {
    try {
      // Try to get real market prices if provider is available
      if (this.onChainContractAddress) {
        // For now, return mock prices since we don't have provider context here
        // In a real implementation, this would fetch from the API or blockchain
        return {
          yesPrice: 0.6, // 60% chance
          noPrice: 0.4, // 40% chance
        };
      }
      
      // Fallback to mock prices
      return {
        yesPrice: 0.6,
        noPrice: 0.4,
      };
    } catch (error) {
      console.error('Error fetching market prices:', error);
      return {
        yesPrice: 0.5,
        noPrice: 0.5,
      };
    }
  }

  /**
   * Add bet to user's history
   */
  private addBetToHistory(userId: string, bet: any): void {
    const history = this.betHistory.get(userId) || [];
    history.push(bet);
    this.betHistory.set(userId, history);
  }

  /**
   * Find bet by ID
   */
  private async findBetById(betId: string): Promise<any | null> {
    for (const [userId, history] of this.betHistory.entries()) {
      const bet = history.find(b => b.id === betId);
      if (bet) {
        return bet;
      }
    }
    return null;
  }

  /**
   * Get betting configuration
   */
  getBettingConfig() {
    return PAYMENT_CONFIG.services.betting;
  }
}

// Export singleton instance
export const bettingPaymentService = BettingPaymentService.getInstance();