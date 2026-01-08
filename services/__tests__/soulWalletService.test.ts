/**
 * Soul Wallet Service Tests
 * Property-based and unit tests for the Soul wallet management system
 * Feature: soul-payment-system, Property 2: 余额一致性
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fc from 'fast-check';
import { 
  SoulWalletService, 
  soulWalletService,
  WalletUtils,
  BalanceChangeEvent,
  WalletPreferences 
} from '../soulWalletService';
import { usersApi } from '../api';

// Mock the API
jest.mock('../api', () => ({
  usersApi: {
    getById: jest.fn(),
    addSoul: jest.fn(),
  },
}));

const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

describe('Soul Wallet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton state for testing
    (soulWalletService as any).balanceCache.clear();
    (soulWalletService as any).balanceListeners.clear();
    (soulWalletService as any).walletData.clear();
    (soulWalletService as any).syncInProgress.clear();
  });

  describe('Property Tests', () => {
    /**
     * Property 2: 余额一致性
     * For any 成功的Soul代币交易（购买、支付、退款），用户的余额变化应该准确反映交易金额，并在所有相关界面立即更新
     * Validates: Requirements 1.4, 2.3, 3.2
     */
    it('Property 2: Balance consistency after transactions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.float({ min: 0, max: 10000 }),
          fc.array(fc.float({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 10 }),
          async (userId: string, initialBalance: number, transactions: number[]) => {
            // Setup initial balance
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: initialBalance,
            });

            // Get initial balance
            const startBalance = await soulWalletService.getSoulBalance(userId);
            expect(startBalance).toBe(initialBalance);

            let expectedBalance = initialBalance;
            let balanceChangeEvents: BalanceChangeEvent[] = [];

            // Set up balance change listener
            soulWalletService.onBalanceChange(userId, (event) => {
              balanceChangeEvents.push(event);
            });

            // Process each transaction
            for (const changeAmount of transactions) {
              const newExpectedBalance = Math.max(0, expectedBalance + changeAmount);
              
              // Update balance through wallet service
              soulWalletService.updateBalanceAfterTransaction(
                userId,
                newExpectedBalance,
                changeAmount,
                'test_transaction'
              );

              expectedBalance = newExpectedBalance;

              // Property: Balance should be consistent after each transaction
              const currentBalance = await soulWalletService.getSoulBalance(userId);
              expect(currentBalance).toBe(expectedBalance);

              // Property: Available balance should equal total balance minus locked
              const availableBalance = soulWalletService.getAvailableBalance(userId);
              expect(availableBalance).toBeLessThanOrEqual(expectedBalance);
            }

            // Property: All balance changes should be recorded
            expect(balanceChangeEvents.length).toBe(transactions.length);

            // Property: Each balance change event should have correct data
            balanceChangeEvents.forEach((event, index) => {
              expect(event.userId).toBe(userId);
              expect(event.changeAmount).toBe(transactions[index]);
              expect(event.reason).toBe('test_transaction');
              expect(event.timestamp).toBeInstanceOf(Date);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Balance locking consistency
     * For any balance locking operation, locked amount should not exceed total balance
     */
    it('Property: Balance locking consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.float({ min: 100, max: 10000 }),
          fc.array(fc.float({ min: 1, max: 500 }), { minLength: 1, maxLength: 5 }),
          async (userId: string, totalBalance: number, lockAmounts: number[]) => {
            // Setup balance
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: totalBalance,
            });

            await soulWalletService.getSoulBalance(userId);

            let totalLocked = 0;

            for (const lockAmount of lockAmounts) {
              const canLock = soulWalletService.lockSoulTokens(userId, lockAmount);
              
              if (totalLocked + lockAmount <= totalBalance) {
                // Should be able to lock if sufficient balance
                expect(canLock).toBe(true);
                totalLocked += lockAmount;
              } else {
                // Should not be able to lock if insufficient balance
                expect(canLock).toBe(false);
              }

              // Property: Available balance should equal total minus locked
              const availableBalance = soulWalletService.getAvailableBalance(userId);
              expect(availableBalance).toBe(totalBalance - totalLocked);

              // Property: Available balance should never be negative
              expect(availableBalance).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Balance cache consistency
     * For any balance operations, cached balance should match API balance
     */
    it('Property: Balance cache consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.float({ min: 0, max: 10000 }),
          fc.integer({ min: 1, max: 5 }),
          async (userId: string, balance: number, fetchCount: number) => {
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: balance,
            });

            // Fetch balance multiple times
            const balances: number[] = [];
            for (let i = 0; i < fetchCount; i++) {
              const fetchedBalance = await soulWalletService.getSoulBalance(userId);
              balances.push(fetchedBalance);
            }

            // Property: All fetches should return the same balance (cache consistency)
            expect(balances.every(b => b === balance)).toBe(true);

            // Property: API should only be called once due to caching
            expect(mockUsersApi.getById).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Wallet preferences persistence
     * For any wallet preference updates, changes should be persisted correctly
     */
    it('Property: Wallet preferences persistence', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.record({
            autoSync: fc.boolean(),
            lowBalanceAlert: fc.float({ min: 1, max: 100 }),
            confirmLargePayments: fc.boolean(),
            notificationEnabled: fc.boolean(),
          }),
          (userId: string, preferences: WalletPreferences) => {
            // Update preferences
            soulWalletService.updateWalletPreferences(userId, preferences);

            // Get wallet data
            const walletData = soulWalletService.getWalletData(userId);

            // Property: All preference updates should be persisted
            expect(walletData.preferences.autoSync).toBe(preferences.autoSync);
            expect(walletData.preferences.lowBalanceAlert).toBe(preferences.lowBalanceAlert);
            expect(walletData.preferences.confirmLargePayments).toBe(preferences.confirmLargePayments);
            expect(walletData.preferences.notificationEnabled).toBe(preferences.notificationEnabled);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Sufficient balance check consistency
     * For any balance and amount, sufficient balance check should be accurate
     */
    it('Property: Sufficient balance check consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.float({ min: 0, max: 10000 }),
          fc.float({ min: 0, max: 1000 }),
          fc.float({ min: 0, max: 5000 }),
          async (userId: string, totalBalance: number, lockedAmount: number, checkAmount: number) => {
            // Setup balance
            mockUsersApi.getById.mockResolvedValue({
              id: userId,
              name: 'Test User',
              handle: '@test',
              avatar: 'test.jpg',
              sosTokenBalance: totalBalance,
            });

            await soulWalletService.getSoulBalance(userId);

            // Lock some amount if possible
            if (lockedAmount <= totalBalance) {
              soulWalletService.lockSoulTokens(userId, lockedAmount);
            } else {
              lockedAmount = 0; // Can't lock more than available
            }

            const availableBalance = totalBalance - lockedAmount;
            const hasSufficient = soulWalletService.hasSufficientBalance(userId, checkAmount);

            // Property: Sufficient balance check should match available balance
            expect(hasSufficient).toBe(availableBalance >= checkAmount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should get Soul balance from API', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      const balance = await soulWalletService.getSoulBalance('user1');
      expect(balance).toBe(100);
      expect(mockUsersApi.getById).toHaveBeenCalledWith('user1');
    });

    it('should cache balance and avoid repeated API calls', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      // First call
      const balance1 = await soulWalletService.getSoulBalance('user1');
      expect(balance1).toBe(100);

      // Second call should use cache
      const balance2 = await soulWalletService.getSoulBalance('user1');
      expect(balance2).toBe(100);

      // API should only be called once
      expect(mockUsersApi.getById).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockUsersApi.getById.mockRejectedValue(new Error('API Error'));

      const balance = await soulWalletService.getSoulBalance('user1');
      expect(balance).toBe(0); // Should return 0 on error
    });

    it('should lock and unlock Soul tokens correctly', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      await soulWalletService.getSoulBalance('user1');

      // Lock 30 SOUL
      const lockResult = soulWalletService.lockSoulTokens('user1', 30);
      expect(lockResult).toBe(true);
      expect(soulWalletService.getAvailableBalance('user1')).toBe(70);

      // Try to lock more than available
      const lockResult2 = soulWalletService.lockSoulTokens('user1', 80);
      expect(lockResult2).toBe(false);
      expect(soulWalletService.getAvailableBalance('user1')).toBe(70);

      // Unlock 20 SOUL
      soulWalletService.unlockSoulTokens('user1', 20);
      expect(soulWalletService.getAvailableBalance('user1')).toBe(90);
    });

    it('should notify balance change listeners', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      await soulWalletService.getSoulBalance('user1');

      const balanceChanges: BalanceChangeEvent[] = [];
      soulWalletService.onBalanceChange('user1', (event) => {
        balanceChanges.push(event);
      });

      // Update balance
      soulWalletService.updateBalanceAfterTransaction('user1', 150, 50, 'test_payment');

      expect(balanceChanges).toHaveLength(1);
      expect(balanceChanges[0].userId).toBe('user1');
      expect(balanceChanges[0].oldBalance).toBe(100);
      expect(balanceChanges[0].newBalance).toBe(150);
      expect(balanceChanges[0].changeAmount).toBe(50);
      expect(balanceChanges[0].reason).toBe('test_payment');
    });

    it('should update wallet preferences', () => {
      const preferences = {
        autoSync: false,
        lowBalanceAlert: 5,
        confirmLargePayments: false,
        notificationEnabled: false,
      };

      soulWalletService.updateWalletPreferences('user1', preferences);

      const walletData = soulWalletService.getWalletData('user1');
      expect(walletData.preferences).toEqual(preferences);
    });

    it('should calculate wallet statistics', () => {
      // Create wallet with some activity
      soulWalletService.updateBalanceAfterTransaction('user1', 100, 100, 'purchase');
      soulWalletService.updateBalanceAfterTransaction('user1', 80, -20, 'payment');
      soulWalletService.updateBalanceAfterTransaction('user1', 120, 40, 'reward');

      const stats = soulWalletService.getWalletStatistics('user1');
      expect(stats.totalEarned).toBe(140); // 100 + 40
      expect(stats.totalSpent).toBe(20);
      expect(stats.netBalance).toBe(120); // 140 - 20
    });

    it('should refresh balance and clear cache', async () => {
      // Initial balance
      mockUsersApi.getById.mockResolvedValueOnce({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      const balance1 = await soulWalletService.getSoulBalance('user1');
      expect(balance1).toBe(100);

      // Updated balance
      mockUsersApi.getById.mockResolvedValueOnce({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 200,
      });

      const refreshedBalance = await soulWalletService.refreshBalance('user1');
      expect(refreshedBalance).toBe(200);
      expect(mockUsersApi.getById).toHaveBeenCalledTimes(2);
    });

    it('should sync on-chain balance', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      const syncResult = await soulWalletService.syncOnChainBalance('user1');
      expect(syncResult.success).toBe(true);
      expect(syncResult.balance).toBe(100);
      expect(syncResult.syncedAt).toBeInstanceOf(Date);
    });

    it('should prevent concurrent sync operations', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      // Start first sync
      const sync1Promise = soulWalletService.syncOnChainBalance('user1');
      
      // Try to start second sync immediately
      const sync2Result = await soulWalletService.syncOnChainBalance('user1');
      
      expect(sync2Result.success).toBe(false);
      expect(sync2Result.error).toBe('Sync already in progress');

      // Wait for first sync to complete
      const sync1Result = await sync1Promise;
      expect(sync1Result.success).toBe(true);
    });
  });

  describe('Wallet Utils Tests', () => {
    it('should format Soul balance correctly', () => {
      expect(WalletUtils.formatSoulBalance(50.123)).toBe('50.12 SOUL');
      expect(WalletUtils.formatSoulBalance(1500)).toBe('1.5K SOUL');
      expect(WalletUtils.formatSoulBalance(2500000)).toBe('2.5M SOUL');
    });

    it('should calculate USD value correctly', () => {
      const usdValue = WalletUtils.calculateUSDValue(100);
      expect(usdValue).toBe(5); // 100 * 0.05
    });

    it('should identify large payments correctly', () => {
      expect(WalletUtils.isLargePayment(50)).toBe(false);
      expect(WalletUtils.isLargePayment(100)).toBe(true);
      expect(WalletUtils.isLargePayment(500)).toBe(true);
    });

    it('should return correct balance status colors', () => {
      expect(WalletUtils.getBalanceStatusColor(0)).toBe('red');
      expect(WalletUtils.getBalanceStatusColor(5)).toBe('orange');
      expect(WalletUtils.getBalanceStatusColor(25)).toBe('yellow');
      expect(WalletUtils.getBalanceStatusColor(100)).toBe('green');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative balance updates gracefully', () => {
      soulWalletService.updateBalanceAfterTransaction('user1', -10, -110, 'test');
      
      // Balance should not go negative in real scenarios, but service should handle it
      const balance = soulWalletService.getAvailableBalance('user1');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    it('should handle unlock more than locked gracefully', async () => {
      mockUsersApi.getById.mockResolvedValue({
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: 'test.jpg',
        sosTokenBalance: 100,
      });

      await soulWalletService.getSoulBalance('user1');
      
      // Lock 10 SOUL
      soulWalletService.lockSoulTokens('user1', 10);
      expect(soulWalletService.getAvailableBalance('user1')).toBe(90);
      
      // Try to unlock 20 SOUL (more than locked)
      soulWalletService.unlockSoulTokens('user1', 20);
      
      // Should not go negative
      expect(soulWalletService.getAvailableBalance('user1')).toBe(100);
    });

    it('should handle listener removal correctly', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      soulWalletService.onBalanceChange('user1', listener1);
      soulWalletService.onBalanceChange('user1', listener2);

      // Remove first listener
      soulWalletService.removeBalanceChangeListener('user1', listener1);

      // Update balance
      soulWalletService.updateBalanceAfterTransaction('user1', 100, 100, 'test');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});