/**
 * Soul Wallet Service
 * Enhanced wallet service for Soul token management
 * Integrates with existing AuthContext and provides advanced wallet functionality
 */

import { usersApi } from './api';
import { SOUL_TOKEN_CONFIG } from './tokenTradingImproved';

// Wallet service interfaces
export interface WalletBalance {
  soulBalance: number;
  lockedSoul: number;
  availableBalance: number;
  lastUpdated: Date;
}

export interface BalanceChangeEvent {
  userId: string;
  oldBalance: number;
  newBalance: number;
  changeAmount: number;
  reason: string;
  timestamp: Date;
}

export interface SyncResult {
  success: boolean;
  balance?: number;
  error?: string;
  syncedAt: Date;
}

export interface WalletPreferences {
  autoSync: boolean;
  lowBalanceAlert: number;
  confirmLargePayments: boolean;
  notificationEnabled: boolean;
}

export interface UserWallet {
  userId: string;
  soulBalance: number;
  lockedSoul: number;
  totalEarned: number;
  totalSpent: number;
  lastSyncAt: Date;
  preferences: WalletPreferences;
}

// Balance change listener type
export type BalanceChangeListener = (event: BalanceChangeEvent) => void;

/**
 * Soul Wallet Service Class
 * Provides comprehensive wallet management for Soul tokens
 */
export class SoulWalletService {
  private static instance: SoulWalletService;
  private balanceCache: Map<string, WalletBalance> = new Map();
  private balanceListeners: Map<string, BalanceChangeListener[]> = new Map();
  private walletData: Map<string, UserWallet> = new Map();
  private syncInProgress: Set<string> = new Set();

  private constructor() {
    // Initialize auto-sync for users with auto-sync enabled
    this.startAutoSyncTimer();
  }

  public static getInstance(): SoulWalletService {
    if (!SoulWalletService.instance) {
      SoulWalletService.instance = new SoulWalletService();
    }
    return SoulWalletService.instance;
  }

  /**
   * Get Soul balance for user
   */
  async getSoulBalance(userId: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.balanceCache.get(userId);
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached.soulBalance;
      }

      // Fetch from API
      const user = await usersApi.getById(userId);
      const balance = user.sosTokenBalance || 0;

      // Update cache
      this.updateBalanceCache(userId, balance, 0);

      return balance;
    } catch (error) {
      console.error('Error getting Soul balance:', error);
      // Return cached value if available, otherwise 0
      const cached = this.balanceCache.get(userId);
      return cached?.soulBalance || 0;
    }
  }

  /**
   * Update balance display for user
   */
  async updateBalanceDisplay(userId: string): Promise<void> {
    try {
      const oldBalance = this.balanceCache.get(userId)?.soulBalance || 0;
      const newBalance = await this.getSoulBalance(userId);

      if (oldBalance !== newBalance) {
        // Notify listeners of balance change
        this.notifyBalanceChange(userId, oldBalance, newBalance, 'display_update');
      }
    } catch (error) {
      console.error('Error updating balance display:', error);
    }
  }

  /**
   * Sync on-chain balance (if available)
   */
  async syncOnChainBalance(userId: string): Promise<SyncResult> {
    if (this.syncInProgress.has(userId)) {
      return {
        success: false,
        error: 'Sync already in progress',
        syncedAt: new Date(),
      };
    }

    this.syncInProgress.add(userId);

    try {
      // Try to get on-chain balance
      let onChainBalance = 0;
      try {
        const { getBalance } = await import('./soulContractService');
        // This would require provider and wallet address
        // For now, we'll simulate or use API balance
        onChainBalance = await this.getSoulBalance(userId);
      } catch (contractError) {
        console.warn('On-chain balance not available, using API balance');
        onChainBalance = await this.getSoulBalance(userId);
      }

      // Update cache and wallet data
      const oldBalance = this.balanceCache.get(userId)?.soulBalance || 0;
      this.updateBalanceCache(userId, onChainBalance, 0);

      // Update wallet data
      const wallet = this.getOrCreateWallet(userId);
      wallet.soulBalance = onChainBalance;
      wallet.lastSyncAt = new Date();

      // Notify listeners if balance changed
      if (oldBalance !== onChainBalance) {
        this.notifyBalanceChange(userId, oldBalance, onChainBalance, 'on_chain_sync');
      }

      return {
        success: true,
        balance: onChainBalance,
        syncedAt: new Date(),
      };

    } catch (error: any) {
      console.error('Error syncing on-chain balance:', error);
      return {
        success: false,
        error: error.message || 'Sync failed',
        syncedAt: new Date(),
      };
    } finally {
      this.syncInProgress.delete(userId);
    }
  }

  /**
   * Add balance change listener
   */
  onBalanceChange(userId: string, callback: BalanceChangeListener): void {
    const listeners = this.balanceListeners.get(userId) || [];
    listeners.push(callback);
    this.balanceListeners.set(userId, listeners);
  }

  /**
   * Remove balance change listener
   */
  removeBalanceChangeListener(userId: string, callback: BalanceChangeListener): void {
    const listeners = this.balanceListeners.get(userId) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
      this.balanceListeners.set(userId, listeners);
    }
  }

  /**
   * Get wallet data for user
   */
  getWalletData(userId: string): UserWallet {
    return this.getOrCreateWallet(userId);
  }

  /**
   * Update wallet preferences
   */
  updateWalletPreferences(userId: string, preferences: Partial<WalletPreferences>): void {
    const wallet = this.getOrCreateWallet(userId);
    wallet.preferences = { ...wallet.preferences, ...preferences };
    this.walletData.set(userId, wallet);
  }

  /**
   * Get available balance (total - locked)
   */
  getAvailableBalance(userId: string): number {
    const cached = this.balanceCache.get(userId);
    if (cached) {
      return Math.max(0, cached.soulBalance - cached.lockedSoul);
    }
    return 0;
  }

  /**
   * Lock Soul tokens (for pending transactions)
   */
  lockSoulTokens(userId: string, amount: number): boolean {
    const cached = this.balanceCache.get(userId);
    if (!cached || cached.soulBalance < cached.lockedSoul + amount) {
      return false; // Insufficient balance to lock
    }

    cached.lockedSoul += amount;
    this.balanceCache.set(userId, cached);
    return true;
  }

  /**
   * Unlock Soul tokens (after transaction completion)
   */
  unlockSoulTokens(userId: string, amount: number): void {
    const cached = this.balanceCache.get(userId);
    if (cached) {
      cached.lockedSoul = Math.max(0, cached.lockedSoul - amount);
      this.balanceCache.set(userId, cached);
    }
  }

  /**
   * Update balance after transaction
   */
  updateBalanceAfterTransaction(
    userId: string, 
    newBalance: number, 
    changeAmount: number, 
    reason: string
  ): void {
    const oldBalance = this.balanceCache.get(userId)?.soulBalance || 0;
    
    // Update cache
    this.updateBalanceCache(userId, newBalance, 0);
    
    // Update wallet statistics
    const wallet = this.getOrCreateWallet(userId);
    if (changeAmount > 0) {
      wallet.totalEarned += changeAmount;
    } else {
      wallet.totalSpent += Math.abs(changeAmount);
    }
    wallet.soulBalance = newBalance;
    
    // Notify listeners
    this.notifyBalanceChange(userId, oldBalance, newBalance, reason);
    
    // Check low balance alert
    this.checkLowBalanceAlert(userId, newBalance);
  }

  /**
   * Get balance history for user
   */
  getBalanceHistory(userId: string): BalanceChangeEvent[] {
    // This would typically come from a database or API
    // For now, return empty array as this is handled by payment service
    return [];
  }

  /**
   * Refresh balance from API
   */
  async refreshBalance(userId: string): Promise<number> {
    try {
      // Clear cache to force fresh fetch
      this.balanceCache.delete(userId);
      
      // Get fresh balance
      const balance = await this.getSoulBalance(userId);
      
      return balance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
      throw error;
    }
  }

  /**
   * Check if user has sufficient balance
   */
  hasSufficientBalance(userId: string, amount: number): boolean {
    const availableBalance = this.getAvailableBalance(userId);
    return availableBalance >= amount;
  }

  /**
   * Get wallet statistics
   */
  getWalletStatistics(userId: string): {
    totalEarned: number;
    totalSpent: number;
    netBalance: number;
    transactionCount: number;
  } {
    const wallet = this.getOrCreateWallet(userId);
    return {
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      netBalance: wallet.totalEarned - wallet.totalSpent,
      transactionCount: 0, // Would be calculated from transaction history
    };
  }

  // Private helper methods

  /**
   * Update balance cache
   */
  private updateBalanceCache(userId: string, soulBalance: number, lockedSoul: number): void {
    this.balanceCache.set(userId, {
      soulBalance,
      lockedSoul,
      availableBalance: soulBalance - lockedSoul,
      lastUpdated: new Date(),
    });
  }

  /**
   * Check if cache is valid (within 5 minutes)
   */
  private isCacheValid(lastUpdated: Date): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastUpdated.getTime() < fiveMinutes;
  }

  /**
   * Notify balance change listeners
   */
  private notifyBalanceChange(
    userId: string, 
    oldBalance: number, 
    newBalance: number, 
    reason: string
  ): void {
    const listeners = this.balanceListeners.get(userId) || [];
    const event: BalanceChangeEvent = {
      userId,
      oldBalance,
      newBalance,
      changeAmount: newBalance - oldBalance,
      reason,
      timestamp: new Date(),
    };

    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in balance change listener:', error);
      }
    });
  }

  /**
   * Get or create wallet data for user
   */
  private getOrCreateWallet(userId: string): UserWallet {
    let wallet = this.walletData.get(userId);
    if (!wallet) {
      wallet = {
        userId,
        soulBalance: 0,
        lockedSoul: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastSyncAt: new Date(),
        preferences: {
          autoSync: true,
          lowBalanceAlert: 10, // Alert when balance < 10 SOUL
          confirmLargePayments: true,
          notificationEnabled: true,
        },
      };
      this.walletData.set(userId, wallet);
    }
    return wallet;
  }

  /**
   * Check low balance alert
   */
  private checkLowBalanceAlert(userId: string, balance: number): void {
    const wallet = this.getOrCreateWallet(userId);
    if (wallet.preferences.notificationEnabled && 
        balance < wallet.preferences.lowBalanceAlert) {
      // Trigger low balance notification
      console.log(`Low balance alert for user ${userId}: ${balance} SOUL`);
      // In a real app, this would trigger a notification system
    }
  }

  /**
   * Start auto-sync timer
   */
  private startAutoSyncTimer(): void {
    // Auto-sync every 10 minutes for users with auto-sync enabled
    setInterval(async () => {
      for (const [userId, wallet] of this.walletData.entries()) {
        if (wallet.preferences.autoSync) {
          try {
            await this.syncOnChainBalance(userId);
          } catch (error) {
            console.error(`Auto-sync failed for user ${userId}:`, error);
          }
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
}

// Export singleton instance
export const soulWalletService = SoulWalletService.getInstance();

// Export utility functions
export const WalletUtils = {
  /**
   * Format Soul balance for display
   */
  formatSoulBalance(balance: number): string {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M SOUL`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K SOUL`;
    } else {
      return `${balance.toFixed(2)} SOUL`;
    }
  },

  /**
   * Calculate USD value of Soul balance
   */
  calculateUSDValue(soulBalance: number): number {
    return soulBalance * SOUL_TOKEN_CONFIG.priceUSD;
  },

  /**
   * Check if amount is considered "large" for confirmation
   */
  isLargePayment(amount: number): boolean {
    return amount >= 100; // 100 SOUL or more is considered large
  },

  /**
   * Get balance status color for UI
   */
  getBalanceStatusColor(balance: number, lowBalanceThreshold: number = 10): string {
    if (balance <= 0) return 'red';
    if (balance < lowBalanceThreshold) return 'orange';
    if (balance < lowBalanceThreshold * 5) return 'yellow';
    return 'green';
  },
};