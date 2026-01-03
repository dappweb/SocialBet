/**
 * Soul Payment Service Tests
 * Property-based and unit tests for the Soul payment system
 * Feature: soul-payment-system, Property 3: 支付验证完整性
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fc from 'fast-check';
import { 
  SoulPaymentService, 
  soulPaymentService,
  SoulPaymentRequest,
  PaymentErrorType,
  PAYMENT_CONFIG 
} from '../soulPaymentService';
import { usersApi } from '../api';

// Mock the API
jest.mock('../api', () => ({
  usersApi: {
    getById: jest.fn(),
    addSoul: jest.fn(),
  },
}));

const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

describe('Soul Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton state for testing
    (soulPaymentService as any).paymentHistory.clear();
    (soulPaymentService as any).dailySpending.clear();
  });

  describe('Property Tests', () => {
    /**
     * Property 3: 支付验证完整性
     * For any 支付请求，系统应该验证用户身份、余额充足性和交易限制，只有通过所有验证的支付才能执行
     * Validates: Requirements 2.2, 6.1, 6.3
     */
    it('Property 3: Payment validation completeness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }),
            amount: fc.float({ min: 0.1, max: 20000 }),
            purpose: fc.constantFrom('betting', 'ai_avatar', 'premium_feature', 'other'),
            marketId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            serviceId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          }),
          fc.float({ min: 0, max: 100000 }), // user balance
          async (request: SoulPaymentRequest, userBalance: number) => {
            // Setup mock user balance
            mockUsersApi.getById.mockResolvedValue({
              id: request.userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: userBalance,
            });

            mockUsersApi.addSoul.mockResolvedValue({
              success: true,
              newBalance: Math.max(0, userBalance - request.amount),
            });

            // Validate payment
            const validation = await soulPaymentService.validatePayment(request.amount, request.userId);
            const paymentResult = await soulPaymentService.paySoulTokens(request);

            // Property: All payments must pass validation checks
            if (request.amount <= 0) {
              // Invalid amount should fail validation
              expect(validation.valid).toBe(false);
              expect(paymentResult.success).toBe(false);
            } else if (request.amount < PAYMENT_CONFIG.limits.minPaymentSoul) {
              // Below minimum should fail validation
              expect(validation.valid).toBe(false);
              expect(paymentResult.success).toBe(false);
            } else if (request.amount > PAYMENT_CONFIG.limits.maxPaymentSoul) {
              // Above maximum should fail validation
              expect(validation.valid).toBe(false);
              expect(paymentResult.success).toBe(false);
            } else if (userBalance < request.amount) {
              // Insufficient balance should fail payment (but pass validation)
              expect(validation.valid).toBe(true);
              expect(paymentResult.success).toBe(false);
              expect(paymentResult.error).toContain('余额不足');
            } else if (request.amount > PAYMENT_CONFIG.limits.dailyLimitSoul) {
              // Above daily limit should fail
              expect(paymentResult.success).toBe(false);
            } else {
              // Valid payment should succeed
              expect(validation.valid).toBe(true);
              expect(paymentResult.success).toBe(true);
              expect(paymentResult.transactionId).toBeDefined();
              expect(paymentResult.newBalance).toBe(userBalance - request.amount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Payment amount validation
     * For any payment amount, validation should correctly identify valid and invalid amounts
     */
    it('Property: Payment amount validation consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: -1000, max: 50000 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (amount: number, userId: string) => {
            const validation = await soulPaymentService.validatePayment(amount, userId);

            if (amount <= 0) {
              expect(validation.valid).toBe(false);
              expect(validation.error).toContain('有效的支付金额');
            } else if (amount < PAYMENT_CONFIG.limits.minPaymentSoul) {
              expect(validation.valid).toBe(false);
              expect(validation.error).toContain('Minimum payment amount');
            } else if (amount > PAYMENT_CONFIG.limits.maxPaymentSoul) {
              expect(validation.valid).toBe(false);
              expect(validation.error).toContain('Maximum payment amount');
            } else {
              expect(validation.valid).toBe(true);
              expect(validation.error).toBeUndefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Balance consistency after payment
     * For any successful payment, the user's balance should be correctly updated
     */
    it('Property: Balance consistency after payment', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 20 }),
            amount: fc.float({ min: 1, max: 1000 }),
            purpose: fc.constantFrom('betting', 'ai_avatar', 'premium_feature'),
          }),
          fc.float({ min: 1000, max: 10000 }), // sufficient balance
          async (request: SoulPaymentRequest, initialBalance: number) => {
            // Ensure amount is within valid range
            if (request.amount > PAYMENT_CONFIG.limits.maxPaymentSoul) {
              request.amount = PAYMENT_CONFIG.limits.maxPaymentSoul;
            }
            if (request.amount < PAYMENT_CONFIG.limits.minPaymentSoul) {
              request.amount = PAYMENT_CONFIG.limits.minPaymentSoul;
            }

            // Setup mocks
            mockUsersApi.getById.mockResolvedValue({
              id: request.userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: initialBalance,
            });

            const expectedNewBalance = initialBalance - request.amount;
            mockUsersApi.addSoul.mockResolvedValue({
              success: true,
              newBalance: expectedNewBalance,
            });

            const result = await soulPaymentService.paySoulTokens(request);

            // Property: Successful payment should update balance correctly
            if (initialBalance >= request.amount) {
              expect(result.success).toBe(true);
              expect(result.newBalance).toBe(expectedNewBalance);
              expect(result.transactionId).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Daily limit enforcement
     * For any series of payments within a day, the total should not exceed daily limit
     */
    it('Property: Daily limit enforcement', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(fc.float({ min: 100, max: 1000 }), { minLength: 1, maxLength: 10 }),
          async (userId: string, paymentAmounts: number[]) => {
            const totalAmount = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
            
            // Setup sufficient balance
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: totalAmount * 2, // Sufficient balance
            });

            let currentBalance = totalAmount * 2;
            let successfulPayments = 0;
            let totalSpent = 0;

            for (const amount of paymentAmounts) {
              mockUsersApi.addSoul.mockResolvedValue({
                success: true,
                newBalance: currentBalance - amount,
              });

              const request: SoulPaymentRequest = {
                userId,
                amount,
                purpose: 'betting',
              };

              const result = await soulPaymentService.paySoulTokens(request);

              if (totalSpent + amount <= PAYMENT_CONFIG.limits.dailyLimitSoul) {
                // Should succeed if within daily limit
                expect(result.success).toBe(true);
                successfulPayments++;
                totalSpent += amount;
                currentBalance -= amount;
              } else {
                // Should fail if exceeding daily limit
                expect(result.success).toBe(false);
                expect(result.error).toContain('Daily spending limit');
              }
            }

            // Property: Total successful spending should not exceed daily limit
            expect(totalSpent).toBeLessThanOrEqual(PAYMENT_CONFIG.limits.dailyLimitSoul);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property 10: 交易记录完整性
     * For any Soul代币相关交易，系统应该记录完整的交易详情并在交易历史中正确显示
     * Validates: Requirements 3.3, 6.4, 6.5
     */
    it('Property 10: Transaction record completeness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(
            fc.record({
              amount: fc.float({ min: 1, max: 1000 }),
              purpose: fc.constantFrom('betting', 'ai_avatar', 'premium_feature'),
              type: fc.constantFrom('payment', 'refund', 'reward'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (userId: string, transactions: Array<{ amount: number; purpose: string; type: string }>) => {
            // Setup sufficient balance
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: 10000, // Large balance
            });

            mockUsersApi.addSoul.mockImplementation(async (id, amount) => ({
              success: true,
              newBalance: 10000 + amount, // Simplified balance calculation
            }));

            const processedTransactions: string[] = [];

            // Process each transaction
            for (const transaction of transactions) {
              if (transaction.type === 'payment') {
                const request: SoulPaymentRequest = {
                  userId,
                  amount: transaction.amount,
                  purpose: transaction.purpose as any,
                };

                const result = await soulPaymentService.paySoulTokens(request);
                if (result.success && result.transactionId) {
                  processedTransactions.push(result.transactionId);
                }
              } else if (transaction.type === 'refund' && processedTransactions.length > 0) {
                // Refund a previous transaction
                const originalTxId = processedTransactions[processedTransactions.length - 1];
                await soulPaymentService.refundPayment(originalTxId, 'test refund');
              }
            }

            // Get transaction history
            const history = await soulPaymentService.getPaymentHistory(userId);

            // Property: All processed transactions should be recorded
            expect(history.length).toBeGreaterThan(0);

            // Property: Each transaction record should have complete information
            history.forEach(record => {
              expect(record.id).toBeDefined();
              expect(record.userId).toBe(userId);
              expect(record.type).toMatch(/^(payment|refund|reward)$/);
              expect(record.amount).toBeGreaterThan(0);
              expect(record.purpose).toBeDefined();
              expect(record.status).toMatch(/^(pending|completed|failed|cancelled)$/);
              expect(record.createdAt).toBeInstanceOf(Date);
              expect(record.updatedAt).toBeInstanceOf(Date);
              expect(record.metadata).toBeDefined();
            });

            // Property: Transaction history should be sorted by date (newest first)
            for (let i = 1; i < history.length; i++) {
              expect(history[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
                history[i].createdAt.getTime()
              );
            }

            // Property: Transaction statistics should match history
            const stats = await soulPaymentService.getTransactionStatistics(userId);
            expect(stats.totalTransactions).toBe(history.length);

            const paymentCount = history.filter(h => h.type === 'payment').length;
            const refundCount = history.filter(h => h.type === 'refund').length;
            expect(stats.transactionsByPurpose).toBeDefined();
            expect(stats.transactionsByStatus).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Transaction search consistency
     * For any search criteria, returned transactions should match all specified filters
     */
    it('Property: Transaction search consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(
            fc.record({
              amount: fc.float({ min: 10, max: 500 }),
              purpose: fc.constantFrom('betting', 'ai_avatar', 'premium_feature'),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          fc.record({
            minAmount: fc.option(fc.float({ min: 0, max: 100 })),
            maxAmount: fc.option(fc.float({ min: 200, max: 1000 })),
            query: fc.option(fc.constantFrom('betting', 'ai_avatar', 'premium')),
          }),
          async (userId: string, transactions: Array<{ amount: number; purpose: string }>, searchCriteria: any) => {
            // Setup and create transactions
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: 10000,
            });

            mockUsersApi.addSoul.mockResolvedValue({
              success: true,
              newBalance: 9000,
            });

            // Create transactions
            for (const transaction of transactions) {
              const request: SoulPaymentRequest = {
                userId,
                amount: transaction.amount,
                purpose: transaction.purpose as any,
              };
              await soulPaymentService.paySoulTokens(request);
            }

            // Search transactions
            const searchResults = await soulPaymentService.searchTransactions(userId, searchCriteria);

            // Property: All search results should match the criteria
            searchResults.forEach(result => {
              if (searchCriteria.minAmount !== undefined) {
                expect(result.amount).toBeGreaterThanOrEqual(searchCriteria.minAmount);
              }
              if (searchCriteria.maxAmount !== undefined) {
                expect(result.amount).toBeLessThanOrEqual(searchCriteria.maxAmount);
              }
              if (searchCriteria.query) {
                const query = searchCriteria.query.toLowerCase();
                const matchesQuery = 
                  result.purpose.toLowerCase().includes(query) ||
                  result.id.toLowerCase().includes(query);
                expect(matchesQuery).toBe(true);
              }
            });

            // Property: Search results should be sorted by date (newest first)
            for (let i = 1; i < searchResults.length; i++) {
              expect(searchResults[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
                searchResults[i].createdAt.getTime()
              );
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Property: Transaction export consistency
     * For any transaction history, exported CSV should contain all transaction data
     */
    it('Property: Transaction export consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(
            fc.record({
              amount: fc.float({ min: 10, max: 100 }),
              purpose: fc.constantFrom('betting', 'ai_avatar'),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (userId: string, transactions: Array<{ amount: number; purpose: string }>) => {
            // Setup and create transactions
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: 10000,
            });

            mockUsersApi.addSoul.mockResolvedValue({
              success: true,
              newBalance: 9000,
            });

            // Create transactions
            for (const transaction of transactions) {
              const request: SoulPaymentRequest = {
                userId,
                amount: transaction.amount,
                purpose: transaction.purpose as any,
              };
              await soulPaymentService.paySoulTokens(request);
            }

            // Export transaction history
            const csvExport = await soulPaymentService.exportTransactionHistory(userId);
            const history = await soulPaymentService.getPaymentHistory(userId);

            if (history.length > 0) {
              // Property: CSV should contain header row
              const lines = csvExport.split('\n');
              expect(lines.length).toBeGreaterThan(1);
              expect(lines[0]).toContain('Transaction ID');
              expect(lines[0]).toContain('Amount');
              expect(lines[0]).toContain('Purpose');

              // Property: CSV should have one row per transaction (plus header)
              expect(lines.length - 1).toBe(history.length);

              // Property: Each transaction should be represented in CSV
              history.forEach((transaction, index) => {
                const csvRow = lines[index + 1]; // Skip header
                expect(csvRow).toContain(transaction.id);
                expect(csvRow).toContain(transaction.amount.toString());
                expect(csvRow).toContain(transaction.purpose);
              });
            } else {
              expect(csvExport).toBe('No transactions found');
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should validate payment request correctly', async () => {
      // Test invalid amount
      let result = await soulPaymentService.validatePayment(0, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('有效的支付金额');

      // Test below minimum
      result = await soulPaymentService.validatePayment(0.5, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum payment amount');

      // Test above maximum
      result = await soulPaymentService.validatePayment(20000, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum payment amount');

      // Test valid amount
      result = await soulPaymentService.validatePayment(10, 'user1');
      expect(result.valid).toBe(true);
    });

    it('should handle insufficient balance correctly', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 5, // Insufficient balance
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      const result = await soulPaymentService.paySoulTokens(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('余额不足');
    });

    it('should process successful payment correctly', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 90,
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
        marketId: 'market1',
      };

      const result = await soulPaymentService.paySoulTokens(request);
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.newBalance).toBe(90);

      // Verify API calls
      expect(mockUsersApi.getById).toHaveBeenCalledWith('user1');
      expect(mockUsersApi.addSoul).toHaveBeenCalledWith('user1', -10);
    });

    it('should process refund correctly', async () => {
      // First, create a payment
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 90,
      });

      const paymentRequest: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      const paymentResult = await soulPaymentService.paySoulTokens(paymentRequest);
      expect(paymentResult.success).toBe(true);

      // Now process refund
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 90,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 100,
      });

      const refundResult = await soulPaymentService.refundPayment(
        paymentResult.transactionId!,
        'Test refund'
      );

      expect(refundResult.success).toBe(true);
      expect(refundResult.refundAmount).toBe(10);
      expect(refundResult.newBalance).toBe(100);
    });

    it('should track payment history correctly', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 90,
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      await soulPaymentService.paySoulTokens(request);

      const history = await soulPaymentService.getPaymentHistory('user1');
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('payment');
      expect(history[0].amount).toBe(10);
      expect(history[0].purpose).toBe('betting');
      expect(history[0].status).toBe('completed');
    });

    it('should get transaction statistics correctly', async () => {
      // Create multiple transactions
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 1000,
      });

      const payments = [
        { amount: 10, purpose: 'betting' },
        { amount: 20, purpose: 'ai_avatar' },
        { amount: 15, purpose: 'betting' },
      ];

      let balance = 1000;
      for (const payment of payments) {
        balance -= payment.amount;
        mockUsersApi.addSoul.mockResolvedValue({
          success: true,
          newBalance: balance,
        });

        await soulPaymentService.paySoulTokens({
          userId: 'user1',
          amount: payment.amount,
          purpose: payment.purpose as any,
        });
      }

      const stats = await soulPaymentService.getTransactionStatistics('user1');
      expect(stats.totalTransactions).toBe(3);
      expect(stats.totalSpent).toBe(45); // 10 + 20 + 15
      expect(stats.transactionsByPurpose.betting).toBe(2);
      expect(stats.transactionsByPurpose.ai_avatar).toBe(1);
    });

    it('should export transaction history to CSV', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 90,
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      await soulPaymentService.paySoulTokens(request);

      const csvExport = await soulPaymentService.exportTransactionHistory('user1');
      expect(csvExport).toContain('Transaction ID');
      expect(csvExport).toContain('Amount');
      expect(csvExport).toContain('Purpose');
      expect(csvExport).toContain('betting');
      expect(csvExport).toContain('10');
    });

    it('should search transactions by criteria', async () => {
      // Create multiple transactions
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 1000,
      });

      const payments = [
        { amount: 50, purpose: 'betting' },
        { amount: 150, purpose: 'ai_avatar' },
        { amount: 25, purpose: 'betting' },
      ];

      let balance = 1000;
      for (const payment of payments) {
        balance -= payment.amount;
        mockUsersApi.addSoul.mockResolvedValue({
          success: true,
          newBalance: balance,
        });

        await soulPaymentService.paySoulTokens({
          userId: 'user1',
          amount: payment.amount,
          purpose: payment.purpose as any,
        });
      }

      // Search by purpose
      const bettingTransactions = await soulPaymentService.searchTransactions('user1', {
        query: 'betting',
      });
      expect(bettingTransactions).toHaveLength(2);
      expect(bettingTransactions.every(t => t.purpose === 'betting')).toBe(true);

      // Search by amount range
      const largeTransactions = await soulPaymentService.searchTransactions('user1', {
        minAmount: 100,
      });
      expect(largeTransactions).toHaveLength(1);
      expect(largeTransactions[0].amount).toBe(150);
    });

    it('should get transaction by ID', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: true,
        newBalance: 90,
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      const result = await soulPaymentService.paySoulTokens(request);
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();

      const transaction = await soulPaymentService.getTransactionById(result.transactionId!);
      expect(transaction).toBeDefined();
      expect(transaction!.id).toBe(result.transactionId);
      expect(transaction!.amount).toBe(10);
      expect(transaction!.purpose).toBe('betting');
    });

    it('should filter payment history correctly', async () => {
      // Create multiple payments
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 1000,
      });

      const payments = [
        { amount: 10, purpose: 'betting' },
        { amount: 20, purpose: 'ai_avatar' },
        { amount: 15, purpose: 'betting' },
      ];

      let balance = 1000;
      for (const payment of payments) {
        balance -= payment.amount;
        mockUsersApi.addSoul.mockResolvedValue({
          success: true,
          newBalance: balance,
        });

        await soulPaymentService.paySoulTokens({
          userId: 'user1',
          amount: payment.amount,
          purpose: payment.purpose as any,
        });
      }

      // Test filtering by purpose
      const bettingHistory = await soulPaymentService.getPaymentHistory('user1', {
        purpose: 'betting',
      });
      expect(bettingHistory).toHaveLength(2);
      expect(bettingHistory.every(h => h.purpose === 'betting')).toBe(true);

      // Test limiting results
      const limitedHistory = await soulPaymentService.getPaymentHistory('user1', {
        limit: 2,
      });
      expect(limitedHistory).toHaveLength(2);
    });

    it('should return payment configuration', () => {
      const config = soulPaymentService.getPaymentConfig();
      expect(config).toBeDefined();
      expect(config.limits.minPaymentSoul).toBe(1);
      expect(config.limits.maxPaymentSoul).toBe(10000);
      expect(config.services.betting.enabled).toBe(true);
      expect(config.services.aiAvatar.enabled).toBe(true);
    });

    it('should return error messages', () => {
      const errorMessage = soulPaymentService.getErrorMessage(PaymentErrorType.INSUFFICIENT_BALANCE);
      expect(errorMessage).toBeDefined();
      expect(errorMessage.title).toBe('余额不足');
      expect(errorMessage.message).toContain('Soul代币余额不足');
    });
  });

  describe('Edge Cases', () => {
    it('should handle API failures gracefully', async () => {
      mockUsersApi.getById.mockRejectedValue(new Error('API Error'));

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      const result = await soulPaymentService.paySoulTokens(request);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle balance deduction failure', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      mockUsersApi.addSoul.mockResolvedValue({
        success: false,
        error: 'Deduction failed',
      });

      const request: SoulPaymentRequest = {
        userId: 'user1',
        amount: 10,
        purpose: 'betting',
      };

      const result = await soulPaymentService.paySoulTokens(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Deduction failed');
    });

    it('should handle refund of non-existent payment', async () => {
      const result = await soulPaymentService.refundPayment('non-existent', 'Test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });
  });
});