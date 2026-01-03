/**
 * Soul Payment Service
 * 统一的Soul代币支付服务，整合现有的代币交易功能
 * 支持投注、AI头像生成等各种平台服务的支付
 */

import { IProvider } from '@web3auth/base';
import { 
  buySoulWithETH, 
  SOUL_TOKEN_CONFIG,
  calculateSoulTokensFromFiat,
  getSoulPrice
} from './tokenTradingImproved';
import { usersApi } from './api';

// 支付请求接口
export interface SoulPaymentRequest {
  userId: string;
  amount: number;
  purpose: 'betting' | 'ai_avatar' | 'premium_feature' | 'other';
  marketId?: string;
  serviceId?: string;
  metadata?: Record<string, any>;
}

// 支付结果接口
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
  requiresConfirmation?: boolean;
}

// 验证结果接口
export interface ValidationResult {
  valid: boolean;
  error?: string;
  currentBalance?: number;
  requiredAmount?: number;
}

// 退款结果接口
export interface RefundResult {
  success: boolean;
  refundAmount?: number;
  newBalance?: number;
  error?: string;
}

// 支付历史过滤器
export interface PaymentFilters {
  purpose?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  limit?: number;
  offset?: number;
}

// 支付历史记录
export interface PaymentHistory {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

// 支付错误类型
export enum PaymentErrorType {
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  INVALID_AMOUNT = 'invalid_amount',
  USER_NOT_FOUND = 'user_not_found',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  VALIDATION_FAILED = 'validation_failed',
  TRANSACTION_FAILED = 'transaction_failed',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

// 支付错误接口
export interface PaymentError {
  type: PaymentErrorType;
  message: string;
  details?: Record<string, any>;
  suggestedAction?: string;
  retryable: boolean;
}

// 错误消息配置
const ERROR_MESSAGES = {
  [PaymentErrorType.INSUFFICIENT_BALANCE]: {
    title: '余额不足',
    message: '您的Soul代币余额不足以完成此次支付',
    action: '购买更多Soul代币',
    retryable: false
  },
  [PaymentErrorType.INVALID_AMOUNT]: {
    title: '金额无效',
    message: '支付金额必须大于0',
    action: '请输入有效的支付金额',
    retryable: false
  },
  [PaymentErrorType.USER_NOT_FOUND]: {
    title: '用户未找到',
    message: '无法找到指定的用户账户',
    action: '请确认用户身份',
    retryable: false
  },
  [PaymentErrorType.SERVICE_UNAVAILABLE]: {
    title: '服务不可用',
    message: '支付服务暂时不可用',
    action: '请稍后重试',
    retryable: true
  },
  [PaymentErrorType.NETWORK_ERROR]: {
    title: '网络连接问题',
    message: '请检查您的网络连接并重试',
    action: '重试',
    retryable: true
  },
  [PaymentErrorType.VALIDATION_FAILED]: {
    title: '验证失败',
    message: '支付请求验证失败',
    action: '请检查支付信息',
    retryable: false
  },
  [PaymentErrorType.TRANSACTION_FAILED]: {
    title: '交易失败',
    message: '支付交易处理失败',
    action: '请重试或联系客服',
    retryable: true
  },
  [PaymentErrorType.RATE_LIMIT_EXCEEDED]: {
    title: '操作过于频繁',
    message: '您的操作过于频繁，请稍后重试',
    action: '等待一段时间后重试',
    retryable: true
  }
};

/**
 * Soul支付服务类
 */
export class SoulPaymentService {
  private static instance: SoulPaymentService;
  private paymentHistory: Map<string, PaymentHistory[]> = new Map();
  private transactionCounter = 0;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): SoulPaymentService {
    if (!SoulPaymentService.instance) {
      SoulPaymentService.instance = new SoulPaymentService();
    }
    return SoulPaymentService.instance;
  }

  /**
   * 使用Soul代币进行支付
   */
  public async paySoulTokens(request: SoulPaymentRequest): Promise<PaymentResult> {
    try {
      // 验证支付请求
      const validation = await this.validatePayment(request.amount, request.userId);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // 生成交易ID
      const transactionId = this.generateTransactionId();

      // 创建支付记录
      const paymentRecord: PaymentHistory = {
        id: transactionId,
        userId: request.userId,
        amount: request.amount,
        purpose: request.purpose,
        status: 'pending',
        createdAt: new Date(),
        metadata: request.metadata
      };

      // 添加到历史记录
      this.addPaymentHistory(request.userId, paymentRecord);

      try {
        // 扣除Soul代币
        const result = await usersApi.addSoul(request.userId, -request.amount);
        
        // 更新支付记录状态
        paymentRecord.status = 'completed';
        paymentRecord.completedAt = new Date();

        return {
          success: true,
          transactionId,
          newBalance: result.newBalance
        };
      } catch (error: any) {
        // 支付失败，更新记录状态
        paymentRecord.status = 'failed';
        
        return {
          success: false,
          error: this.createPaymentError(PaymentErrorType.TRANSACTION_FAILED, error.message).message,
          transactionId
        };
      }
    } catch (error: any) {
      console.error('Soul payment error:', error);
      return {
        success: false,
        error: this.createPaymentError(PaymentErrorType.SERVICE_UNAVAILABLE, error.message).message
      };
    }
  }

  /**
   * 验证支付能力
   */
  public async validatePayment(amount: number, userId: string): Promise<ValidationResult> {
    try {
      // 验证用户ID
      if (!userId || userId.trim().length === 0) {
        return {
          valid: false,
          error: this.createPaymentError(PaymentErrorType.USER_NOT_FOUND, '用户ID不能为空').message
        };
      }

      // 验证金额
      if (amount <= 0 || !isFinite(amount)) {
        return {
          valid: false,
          error: this.createPaymentError(PaymentErrorType.INVALID_AMOUNT).message
        };
      }

      // 验证最小金额 (0.01 Soul)
      if (amount < 0.01) {
        return {
          valid: false,
          error: this.createPaymentError(PaymentErrorType.INVALID_AMOUNT, '最小支付金额为0.01 SOUL').message
        };
      }

      // 获取用户当前余额
      let currentBalance = 0;
      try {
        const userData = await usersApi.getById(userId.trim());
        currentBalance = userData.sosTokenBalance || 0;
      } catch (error) {
        return {
          valid: false,
          error: this.createPaymentError(PaymentErrorType.USER_NOT_FOUND).message
        };
      }

      // 检查余额是否充足
      if (currentBalance < amount) {
        return {
          valid: false,
          error: this.createPaymentError(PaymentErrorType.INSUFFICIENT_BALANCE).message,
          currentBalance,
          requiredAmount: amount
        };
      }

      return {
        valid: true,
        currentBalance
      };
    } catch (error: any) {
      console.error('Payment validation error:', error);
      return {
        valid: false,
        error: this.createPaymentError(PaymentErrorType.VALIDATION_FAILED, error.message).message
      };
    }
  }

  /**
   * 处理退款
   */
  public async refundPayment(transactionId: string, reason: string): Promise<RefundResult> {
    try {
      // 查找支付记录
      const paymentRecord = this.findPaymentRecord(transactionId);
      if (!paymentRecord) {
        return {
          success: false,
          error: '未找到对应的支付记录'
        };
      }

      if (paymentRecord.status !== 'completed') {
        return {
          success: false,
          error: '只能退款已完成的支付'
        };
      }

      // 执行退款
      const result = await usersApi.addSoul(paymentRecord.userId, paymentRecord.amount);

      // 创建退款记录
      const refundRecord: PaymentHistory = {
        id: this.generateTransactionId(),
        userId: paymentRecord.userId,
        amount: paymentRecord.amount,
        purpose: 'refund',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
        metadata: {
          originalTransactionId: transactionId,
          refundReason: reason
        }
      };

      this.addPaymentHistory(paymentRecord.userId, refundRecord);

      return {
        success: true,
        refundAmount: paymentRecord.amount,
        newBalance: result.newBalance
      };
    } catch (error: any) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: `退款失败: ${error.message}`
      };
    }
  }

  /**
   * 获取支付历史
   */
  public async getPaymentHistory(userId: string, filters?: PaymentFilters): Promise<PaymentHistory[]> {
    try {
      let history = this.paymentHistory.get(userId) || [];

      // 应用过滤器
      if (filters) {
        if (filters.purpose) {
          history = history.filter(h => h.purpose === filters.purpose);
        }
        if (filters.status) {
          history = history.filter(h => h.status === filters.status);
        }
        if (filters.startDate) {
          history = history.filter(h => h.createdAt >= filters.startDate!);
        }
        if (filters.endDate) {
          history = history.filter(h => h.createdAt <= filters.endDate!);
        }

        // 分页
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        history = history.slice(offset, offset + limit);
      }

      // 按时间倒序排列
      return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      console.error('Get payment history error:', error);
      return [];
    }
  }

  /**
   * 获取支付统计信息
   */
  public async getPaymentStats(userId: string): Promise<{
    totalSpent: number;
    totalTransactions: number;
    averageAmount: number;
    purposeBreakdown: Record<string, number>;
  }> {
    try {
      const history = await this.getPaymentHistory(userId);
      const completedPayments = history.filter(h => h.status === 'completed' && h.purpose !== 'refund');

      const totalSpent = completedPayments.reduce((sum, h) => sum + h.amount, 0);
      const totalTransactions = completedPayments.length;
      const averageAmount = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

      const purposeBreakdown: Record<string, number> = {};
      completedPayments.forEach(h => {
        purposeBreakdown[h.purpose] = (purposeBreakdown[h.purpose] || 0) + h.amount;
      });

      return {
        totalSpent,
        totalTransactions,
        averageAmount,
        purposeBreakdown
      };
    } catch (error: any) {
      console.error('Get payment stats error:', error);
      return {
        totalSpent: 0,
        totalTransactions: 0,
        averageAmount: 0,
        purposeBreakdown: {}
      };
    }
  }

  /**
   * 创建支付错误
   */
  private createPaymentError(type: PaymentErrorType, customMessage?: string): PaymentError {
    const errorConfig = ERROR_MESSAGES[type];
    return {
      type,
      message: customMessage || errorConfig.message,
      suggestedAction: errorConfig.action,
      retryable: errorConfig.retryable
    };
  }

  /**
   * 生成交易ID
   */
  private generateTransactionId(): string {
    this.transactionCounter++;
    return `soul_tx_${Date.now()}_${this.transactionCounter}`;
  }

  /**
   * 添加支付历史记录
   */
  private addPaymentHistory(userId: string, record: PaymentHistory): void {
    if (!this.paymentHistory.has(userId)) {
      this.paymentHistory.set(userId, []);
    }
    this.paymentHistory.get(userId)!.push(record);
  }

  /**
   * 查找支付记录
   */
  private findPaymentRecord(transactionId: string): PaymentHistory | null {
    for (const userHistory of this.paymentHistory.values()) {
      const record = userHistory.find(h => h.id === transactionId);
      if (record) {
        return record;
      }
    }
    return null;
  }

  /**
   * 清除支付历史（仅用于测试）
   */
  public clearPaymentHistory(): void {
    this.paymentHistory.clear();
    this.transactionCounter = 0;
  }
}

// 导出单例实例
export const soulPaymentService = SoulPaymentService.getInstance();

// 便捷函数
export async function paySoulTokens(request: SoulPaymentRequest): Promise<PaymentResult> {
  return soulPaymentService.paySoulTokens(request);
}

export async function validateSoulPayment(amount: number, userId: string): Promise<ValidationResult> {
  return soulPaymentService.validatePayment(amount, userId);
}

export async function refundSoulPayment(transactionId: string, reason: string): Promise<RefundResult> {
  return soulPaymentService.refundPayment(transactionId, reason);
}

export async function getSoulPaymentHistory(userId: string, filters?: PaymentFilters): Promise<PaymentHistory[]> {
  return soulPaymentService.getPaymentHistory(userId, filters);
}

export async function getSoulPaymentStats(userId: string) {
  return soulPaymentService.getPaymentStats(userId);
}