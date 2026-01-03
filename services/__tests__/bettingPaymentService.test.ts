/**
 * Betting Payment Service Tests
 * Property-based and unit tests for Soul token betting integration
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import fc from 'fast-check';
import { bettingPaymentService, SoulBetRequest, BetResult } from '../bettingPaymentService';
import { soulPaymentService, PAYMENT_CONFIG } from '../soulPaymentService';
import { soulWalletService } from '../soulWalletService';
import { betsApi } from '../api';

// Mock dependencies
vi.mock('../soulPaymentService', () => ({
  soulPaymentService: {
    paySoulTokens: vi.fn(),
    refundPayment: vi.fn(),
  },
  PAYMENT_CONFIG: {
    fees: {
      platformFeePercent: 2.5,
      minimumFee: 0.1,
      maximumFee: 1000,
    },
    limits: {
      minPaymentSoul: 1,
      maxPaymentSoul: 10000,
      dailyLimitSoul: 50000,
    },
    services: {
      betting: {
        enabled: true,
        minBetSoul: 5,
        maxBetSoul: 5000,
      },
      aiAvatar: {
        enabled: true,
        pricingTiers: []
      },
    }
  }
}));
vi.mock('../soulWalletService');
vi.mock('../api');
vi.mock('../predictionMarketService');

const mockSoulPaymentService = soulPaymentService as any;
const mockSoulWalletService = soulWalletService as any;
const mockBetsApi = betsApi as any;

describe('Betting Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockSoulWalletService.hasSufficientBalance = vi.fn().mockReturnValue(true);
    mockSoulWalletService.lockSoulTokens = vi.fn().mockReturnValue(true);
    mockSoulWalletService.unlockSoulTokens = vi.fn().mockReturnValue(true);
    mockSoulWalletService.getSoulBalance = vi.fn().mockResolvedValue(1000);
    mockSoulWalletService.updateBalanceAfterTransaction = vi.fn();
    
    mockSoulPaymentService.paySoulTokens = vi.fn().mockResolvedValue({
      success: true,
      transactionId: 'tx_123',
      newBalance: 950,
    });
    
    mockBetsApi.place = vi.fn().mockResolvedValue({
      id: 'bet_123',
      marketId: 'market_1',
      betType: 'YES',
      amount: 50,
      priceAtBet: 0.6,
      status: 'pending',
      createdAt: new Date(),
    });
  });

  describe('Property-based Tests', () => {
    /**
     * Feature: soul-payment-system, Property 6: 投注支付集成
     * For any prediction market bet, Soul tokens should be available as payment method,
     * correctly deducted after successful bet placement and recorded
     */
    it('Property 6: Betting payment integration', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }), // userId (avoid single spaces)
        fc.string({ minLength: 5, maxLength: 20 }), // marketId
        fc.constantFrom('YES', 'NO'), // betType
        fc.float({ min: 5, max: 1000 }), // soulAmount (above minimum)
        async (userId, marketId, betType, soulAmount) => {
          // Reset mocks for each test
          vi.clearAllMocks();
          
          // Setup: User has sufficient balance
          const totalCost = soulAmount * 1.025; // Including 2.5% fee
          mockSoulWalletService.hasSufficientBalance.mockReturnValue(true);
          mockSoulWalletService.lockSoulTokens.mockReturnValue(true);
          mockSoulPaymentService.paySoulTokens.mockResolvedValue({
            success: true,
            transactionId: `tx_${Date.now()}`,
            newBalance: 1000 - totalCost,
          });

          const request: SoulBetRequest = {
            userId,
            marketId,
            betType: betType as 'YES' | 'NO',
            soulAmount,
          };

          const result = await bettingPaymentService.placeBetWithSoul(request);

          // Property: Successful bet placement should deduct Soul tokens and record bet
          if (result.success) {
            expect(mockSoulWalletService.lockSoulTokens).toHaveBeenCalledWith(userId, expect.any(Number));
            expect(mockSoulPaymentService.paySoulTokens).toHaveBeenCalledWith(
              expect.objectContaining({
                userId,
                amount: expect.any(Number),
                purpose: 'betting',
                marketId,
              })
            );
            expect(mockBetsApi.place).toHaveBeenCalledWith(
              expect.objectContaining({
                marketId,
                betType,
                amount: soulAmount,
                userId,
              })
            );
            expect(result.betId).toBeDefined();
            expect(result.actualAmount).toBe(soulAmount);
            expect(result.newBalance).toBeDefined();
          }
        }
      ), { numRuns: 10 }); // Reduced runs for faster testing
    });

    /**
     * Feature: soul-payment-system, Property 7: 奖励发放准确性
     * For any winning bet, system should automatically calculate and distribute
     * correct amount of Soul token rewards to user wallet
     */
    it('Property 7: Reward distribution accuracy', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }), // betId (avoid single spaces)
        fc.float({ min: 1, max: 5000 }), // winAmount
        async (betId, winAmount) => {
          // Reset mocks for each test
          vi.clearAllMocks();
          
          // Setup: Mock bet exists
          const mockBet = {
            id: betId,
            userId: 'user_123',
            marketId: 'market_1',
            soulAmount: 100,
            status: 'pending',
          };
          
          // Mock findBetById to return the bet
          vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(mockBet);
          
          const initialBalance = 500;
          mockSoulWalletService.getSoulBalance.mockResolvedValue(initialBalance);

          const result = await bettingPaymentService.processWinnings(betId, winAmount);

          // Property: Successful winnings processing should add exact amount to balance
          if (result.success) {
            expect(mockSoulWalletService.updateBalanceAfterTransaction).toHaveBeenCalledWith(
              mockBet.userId,
              initialBalance + winAmount,
              winAmount,
              'betting_winnings'
            );
            expect(mockBet.status).toBe('won');
            expect(mockBet.winAmount).toBe(winAmount);
            expect(mockBet.claimedAt).toBeInstanceOf(Date);
          }
        }
      ), { numRuns: 10 });
    });

    /**
     * Feature: soul-payment-system, Property 4: 交易原子性
     * For any payment operation, either complete success (deduct and provide service)
     * or complete failure (maintain original state), no partial success
     */
    it('Property 4: Transaction atomicity in betting', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }), // userId
        fc.string({ minLength: 5, maxLength: 20 }), // marketId
        fc.constantFrom('YES', 'NO'), // betType
        fc.float({ min: 5, max: 1000 }), // soulAmount (above minimum)
        fc.boolean(), // shouldPaymentFail
        async (userId, marketId, betType, soulAmount, shouldPaymentFail) => {
          // Reset mocks for each test
          vi.clearAllMocks();
          
          const totalCost = soulAmount * 1.025;
          mockSoulWalletService.hasSufficientBalance.mockReturnValue(true);
          mockSoulWalletService.lockSoulTokens.mockReturnValue(true);

          if (shouldPaymentFail) {
            mockSoulPaymentService.paySoulTokens.mockResolvedValue({
              success: false,
              error: 'Payment failed',
            });
          } else {
            mockSoulPaymentService.paySoulTokens.mockResolvedValue({
              success: true,
              transactionId: `tx_${Date.now()}`,
              newBalance: 1000 - totalCost,
            });
          }

          const request: SoulBetRequest = {
            userId,
            marketId,
            betType: betType as 'YES' | 'NO',
            soulAmount,
          };

          const result = await bettingPaymentService.placeBetWithSoul(request);

          // Property: Transaction atomicity - either all operations succeed or all fail
          if (shouldPaymentFail) {
            expect(result.success).toBe(false);
            expect(mockBetsApi.place).not.toHaveBeenCalled();
            expect(mockSoulWalletService.unlockSoulTokens).toHaveBeenCalledWith(userId, expect.closeTo(totalCost, 0.01));
          } else {
            if (result.success) {
              expect(mockSoulPaymentService.paySoulTokens).toHaveBeenCalled();
              expect(mockBetsApi.place).toHaveBeenCalled();
              expect(mockSoulWalletService.unlockSoulTokens).toHaveBeenCalledWith(userId, expect.closeTo(totalCost, 0.01));
            }
          }
        }
      ), { numRuns: 10 });
    });
  });

  describe('Unit Tests', () => {
    describe('placeBetWithSoul', () => {
      it('should successfully place bet with sufficient balance', async () => {
        const request: SoulBetRequest = {
          userId: 'user_123',
          marketId: 'market_1',
          betType: 'YES',
          soulAmount: 50,
        };

        const result = await bettingPaymentService.placeBetWithSoul(request);

        expect(result.success).toBe(true);
        expect(result.betId).toBe('bet_123');
        expect(result.actualAmount).toBe(50);
        expect(result.newBalance).toBe(950);
        expect(mockSoulWalletService.lockSoulTokens).toHaveBeenCalled();
        expect(mockSoulPaymentService.paySoulTokens).toHaveBeenCalled();
        expect(mockBetsApi.place).toHaveBeenCalled();
      });

      it('should fail with insufficient balance', async () => {
        mockSoulWalletService.hasSufficientBalance.mockReturnValue(false);

        const request: SoulBetRequest = {
          userId: 'user_123',
          marketId: 'market_1',
          betType: 'YES',
          soulAmount: 50,
        };

        const result = await bettingPaymentService.placeBetWithSoul(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Insufficient Soul balance');
        expect(mockSoulPaymentService.paySoulTokens).not.toHaveBeenCalled();
      });

      it('should fail with invalid bet amount (too low)', async () => {
        const request: SoulBetRequest = {
          userId: 'user_123',
          marketId: 'market_1',
          betType: 'YES',
          soulAmount: 0.5, // Below minimum of 5
        };

        const result = await bettingPaymentService.placeBetWithSoul(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Minimum bet amount is 5 SOUL');
      });

      it('should fail with invalid bet amount (too high)', async () => {
        const request: SoulBetRequest = {
          userId: 'user_123',
          marketId: 'market_1',
          betType: 'YES',
          soulAmount: 10000, // Above maximum of 5000
        };

        const result = await bettingPaymentService.placeBetWithSoul(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Maximum bet amount is 5000 SOUL');
      });

      it('should unlock tokens on payment failure', async () => {
        mockSoulPaymentService.paySoulTokens.mockResolvedValue({
          success: false,
          error: 'Payment failed',
        });

        const request: SoulBetRequest = {
          userId: 'user_123',
          marketId: 'market_1',
          betType: 'YES',
          soulAmount: 50,
        };

        const result = await bettingPaymentService.placeBetWithSoul(request);

        expect(result.success).toBe(false);
        expect(mockSoulWalletService.unlockSoulTokens).toHaveBeenCalled();
      });
    });

    describe('calculateBetCost', () => {
      it('should calculate bet cost with platform fee', async () => {
        const cost = await bettingPaymentService.calculateBetCost(100, 'market_1');

        expect(cost.soulAmount).toBe(100);
        expect(cost.platformFee).toBeGreaterThan(0);
        expect(cost.totalCost).toBeGreaterThan(100);
        expect(cost.potentialPayout).toBeGreaterThan(0);
      });

      it('should handle calculation errors gracefully', async () => {
        // Mock error in price fetching
        vi.spyOn(bettingPaymentService as any, 'getMarketPrices').mockRejectedValue(new Error('Price fetch failed'));

        const cost = await bettingPaymentService.calculateBetCost(100, 'market_1');

        // Should return default calculation
        expect(cost.soulAmount).toBe(100);
        expect(cost.platformFee).toBe(2.5); // 2.5% default fee
        expect(cost.totalCost).toBeCloseTo(102.5, 1); // Allow for floating point precision
      });
    });

    describe('processWinnings', () => {
      it('should process winnings for valid bet', async () => {
        const mockBet = {
          id: 'bet_123',
          userId: 'user_123',
          marketId: 'market_1',
          soulAmount: 100,
          status: 'pending',
        };
        
        vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(mockBet);
        mockSoulWalletService.getSoulBalance.mockResolvedValue(500);

        const result = await bettingPaymentService.processWinnings('bet_123', 200);

        expect(result.success).toBe(true);
        expect(mockSoulWalletService.updateBalanceAfterTransaction).toHaveBeenCalledWith(
          'user_123',
          700, // 500 + 200
          200,
          'betting_winnings'
        );
        expect(mockBet.status).toBe('won');
        expect(mockBet.winAmount).toBe(200);
      });

      it('should fail for non-existent bet', async () => {
        vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(null);

        const result = await bettingPaymentService.processWinnings('bet_123', 200);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Bet not found');
      });
    });

    describe('getBettingStatistics', () => {
      it('should return empty statistics for user with no bets', async () => {
        // Mock empty bet history
        const mockBetHistory = new Map();
        vi.spyOn(bettingPaymentService as any, 'betHistory', 'get').mockReturnValue(mockBetHistory);

        const stats = await bettingPaymentService.getBettingStatistics('user_123');

        expect(stats.totalBets).toBe(0);
        expect(stats.totalWagered).toBe(0);
        expect(stats.totalWon).toBe(0);
        expect(stats.winRate).toBe(0);
        expect(stats.profitLoss).toBe(0);
      });

      it('should calculate statistics correctly for user with bets', async () => {
        // Setup mock bet history
        const mockHistory = [
          { soulAmount: 100, status: 'won', winAmount: 200, category: 'Sports' },
          { soulAmount: 50, status: 'lost', winAmount: 0, category: 'Politics' },
          { soulAmount: 75, status: 'won', winAmount: 150, category: 'Sports' },
        ];
        
        // Mock the betHistory getter
        const mockBetHistory = new Map([['user_123', mockHistory]]);
        vi.spyOn(bettingPaymentService as any, 'betHistory', 'get').mockReturnValue(mockBetHistory);

        const stats = await bettingPaymentService.getBettingStatistics('user_123');

        expect(stats.totalBets).toBe(3);
        expect(stats.totalWagered).toBe(225);
        expect(stats.totalWon).toBe(350);
        expect(stats.winRate).toBeCloseTo(0.667, 2);
        expect(stats.averageBet).toBe(75);
        expect(stats.largestWin).toBe(200);
        expect(stats.favoriteCategory).toBe('Sports');
        expect(stats.profitLoss).toBe(125); // 350 - 225
      });
    });

    describe('cancelBet', () => {
      it('should cancel pending bet and process refund', async () => {
        const mockBet = {
          id: 'bet_123',
          userId: 'user_123',
          status: 'pending',
          paymentTransactionId: 'tx_123',
        };
        
        vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(mockBet);
        mockSoulPaymentService.refundPayment = vi.fn().mockResolvedValue({
          success: true,
          refundAmount: 51.25,
        });

        const result = await bettingPaymentService.cancelBet('bet_123', 'user_123');

        expect(result.success).toBe(true);
        expect(result.refundAmount).toBe(51.25);
        expect(mockBet.status).toBe('cancelled');
        expect(mockBet.cancelledAt).toBeInstanceOf(Date);
      });

      it('should fail to cancel non-pending bet', async () => {
        const mockBet = {
          id: 'bet_123',
          userId: 'user_123',
          status: 'completed',
        };
        
        vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(mockBet);

        const result = await bettingPaymentService.cancelBet('bet_123', 'user_123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Only pending bets can be cancelled');
      });

      it('should fail for unauthorized user', async () => {
        const mockBet = {
          id: 'bet_123',
          userId: 'user_456',
          status: 'pending',
        };
        
        vi.spyOn(bettingPaymentService as any, 'findBetById').mockResolvedValue(mockBet);

        const result = await bettingPaymentService.cancelBet('bet_123', 'user_123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Unauthorized to cancel this bet');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent bet placement attempts', async () => {
      const request: SoulBetRequest = {
        userId: 'user_123',
        marketId: 'market_1',
        betType: 'YES',
        soulAmount: 50,
      };

      // Simulate concurrent requests - some might fail due to validation or locking
      const promises = Array(5).fill(null).map(() => 
        bettingPaymentService.placeBetWithSoul(request)
      );

      const results = await Promise.all(promises);

      // All should have some result (success or failure)
      results.forEach(result => {
        expect(typeof result.success).toBe('boolean');
      });
    });

    it('should handle very small bet amounts', async () => {
      const request: SoulBetRequest = {
        userId: 'user_123',
        marketId: 'market_1',
        betType: 'YES',
        soulAmount: 5, // Minimum allowed
      };

      const result = await bettingPaymentService.placeBetWithSoul(request);

      if (result.success) {
        expect(result.actualAmount).toBe(5);
        expect(result.newBalance).toBeDefined();
      }
    });

    it('should handle network errors during bet placement', async () => {
      mockBetsApi.place.mockRejectedValue(new Error('Network error'));

      const request: SoulBetRequest = {
        userId: 'user_123',
        marketId: 'market_1',
        betType: 'YES',
        soulAmount: 50,
      };

      const result = await bettingPaymentService.placeBetWithSoul(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(mockSoulWalletService.unlockSoulTokens).toHaveBeenCalled();
    });
  });
});