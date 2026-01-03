/**
 * Soul Payment Service Simple Tests
 * Basic unit tests to verify core functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  soulPaymentService,
  PaymentErrorType
} from '../soulPaymentService';
import { usersApi } from '../api';

// Mock the API
vi.mock('../api', () => ({
  usersApi: {
    getById: vi.fn(),
    addSoul: vi.fn()
  }
}));

describe('Soul Payment Service Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soulPaymentService.clearPaymentHistory();
  });

  describe('Payment Validation', () => {
    it('should reject payments with invalid amounts', async () => {
      const result = await soulPaymentService.validatePayment(0, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('金额');
    });

    it('should reject payments with negative amounts', async () => {
      const result = await soulPaymentService.validatePayment(-10, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('金额');
    });

    it('should reject payments with empty user ID', async () => {
      const result = await soulPaymentService.validatePayment(10, '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('用户');
    });

    it('should reject payments with whitespace-only user ID', async () => {
      const result = await soulPaymentService.validatePayment(10, '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('用户');
    });

    it('should reject payments below minimum amount', async () => {
      const result = await soulPaymentService.validatePayment(0.005, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('最小支付金额');
    });

    it('should accept valid payments with sufficient balance', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 100
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);

      const result = await soulPaymentService.validatePayment(50, 'user1');
      expect(result.valid).toBe(true);
      expect(result.currentBalance).toBe(100);
    });

    it('should reject payments with insufficient balance', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 10
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);

      const result = await soulPaymentService.validatePayment(50, 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('余额不足');
      expect(result.currentBalance).toBe(10);
      expect(result.requiredAmount).toBe(50);
    });
  });

  describe('Payment Processing', () => {
    it('should process valid payments successfully', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 100
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);
      (usersApi.addSoul as any).mockResolvedValue({ 
        success: true, 
        newBalance: 50 
      });

      const result = await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 50,
        purpose: 'betting'
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.newBalance).toBe(50);
      expect(usersApi.addSoul).toHaveBeenCalledWith('user1', -50);
    });

    it('should fail payments with insufficient balance', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 10
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);

      const result = await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 50,
        purpose: 'betting'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('余额不足');
      expect(usersApi.addSoul).not.toHaveBeenCalled();
    });

    it('should generate unique transaction IDs', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 1000
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);
      (usersApi.addSoul as any).mockResolvedValue({ 
        success: true, 
        newBalance: 950 
      });

      const result1 = await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 25,
        purpose: 'betting'
      });

      const result2 = await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 25,
        purpose: 'ai_avatar'
      });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.transactionId).not.toBe(result2.transactionId);
      expect(result1.transactionId).toMatch(/^soul_tx_\d+_\d+$/);
      expect(result2.transactionId).toMatch(/^soul_tx_\d+_\d+$/);
    });
  });

  describe('Payment History', () => {
    it('should record payment history correctly', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 100
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);
      (usersApi.addSoul as any).mockResolvedValue({ 
        success: true, 
        newBalance: 75 
      });

      // Make a payment
      await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 25,
        purpose: 'betting'
      });

      // Check history
      const history = await soulPaymentService.getPaymentHistory('user1');
      expect(history.length).toBe(1);
      expect(history[0].amount).toBe(25);
      expect(history[0].purpose).toBe('betting');
      expect(history[0].status).toBe('completed');
    });

    it('should sort payment history by date (newest first)', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        handle: '@test',
        avatar: null,
        isVerified: true,
        sosTokenBalance: 1000
      };

      (usersApi.getById as any).mockResolvedValue(mockUser);
      (usersApi.addSoul as any).mockResolvedValue({ 
        success: true, 
        newBalance: 900 
      });

      // Make multiple payments with small delays
      await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 10,
        purpose: 'betting'
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await soulPaymentService.paySoulTokens({
        userId: 'user1',
        amount: 20,
        purpose: 'ai_avatar'
      });

      const history = await soulPaymentService.getPaymentHistory('user1');
      expect(history.length).toBe(2);
      expect(history[0].amount).toBe(20); // Most recent first
      expect(history[1].amount).toBe(10);
    });
  });
});