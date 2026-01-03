/**
 * Referral Service
 * Handles referral program logic including code generation, tracking, and rewards
 */

export interface ReferralCode {
  code: string;
  ownerId: string;
  ownerName: string;
  createdAt: number;
  usageCount: number;
  totalEarnings: number;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  tier: 'bronze' | 'silver' | 'gold';
  tierProgress: number;
  nextTierThreshold: number;
}

export interface ReferralRecord {
  id: string;
  visibleId: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  refereeAvatar?: string;
  joinedAt: number;
  status: 'pending' | 'active' | 'expired';
  totalVolume: number;
  earnings: number;
  level: 1 | 2;
}

export interface ReferralReward {
  id: string;
  referralId: string;
  amount: number;
  type: 'signup_bonus' | 'trading_fee' | 'milestone';
  status: 'pending' | 'claimed' | 'expired';
  createdAt: number;
  claimedAt?: number;
}

// Referral tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 10,
  gold: 50,
};

// Reward rates
const REWARD_RATES = {
  level1FeeShare: 0.05, // 5% of referee's trading fees
  level2FeeShare: 0.02, // 2% of sub-referee's trading fees
  signupBonus: 100, // 100 SOUL for both referrer and referee
  milestone10: 1000, // 1000 SOUL at 10 referrals
  milestone50: 5000, // 5000 SOUL at 50 referrals
};

// Generate a unique referral code
export function generateReferralCode(userId: string): string {
  const prefix = userId.slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

// Get referral code for a user (create if not exists)
export async function getUserReferralCode(userId: string, userName: string): Promise<ReferralCode> {
  // In production, this would fetch from database
  // For now, generate a deterministic code based on userId
  const code = generateReferralCode(userId);
  
  return {
    code,
    ownerId: userId,
    ownerName: userName,
    createdAt: Date.now(),
    usageCount: 0,
    totalEarnings: 0,
  };
}

// Validate a referral code
export async function validateReferralCode(code: string): Promise<{ valid: boolean; owner?: ReferralCode }> {
  // In production, this would check the database
  if (!code || code.length < 6) {
    return { valid: false };
  }
  
  // Mock validation - in production, fetch from DB
  return {
    valid: true,
    owner: {
      code,
      ownerId: 'mock-owner-id',
      ownerName: 'Referrer',
      createdAt: Date.now() - 86400000,
      usageCount: 5,
      totalEarnings: 500,
    },
  };
}

// Apply referral code when user signs up
export async function applyReferralCode(
  referralCode: string,
  newUserId: string,
  newUserName: string
): Promise<{ success: boolean; message: string; bonusAmount?: number }> {
  const validation = await validateReferralCode(referralCode);
  
  if (!validation.valid || !validation.owner) {
    return { success: false, message: 'Invalid referral code' };
  }
  
  if (validation.owner.ownerId === newUserId) {
    return { success: false, message: 'Cannot use your own referral code' };
  }
  
  // In production, this would:
  // 1. Create referral record in database
  // 2. Credit signup bonus to both users
  // 3. Set up fee sharing tracking
  
  return {
    success: true,
    message: `Successfully applied referral code! You and ${validation.owner.ownerName} each received ${REWARD_RATES.signupBonus} SOUL bonus.`,
    bonusAmount: REWARD_RATES.signupBonus,
  };
}

// Get referral statistics for a user
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  // In production, this would fetch from database
  // Mock data for now
  const totalReferrals = 12;
  const tier = totalReferrals >= TIER_THRESHOLDS.gold 
    ? 'gold' 
    : totalReferrals >= TIER_THRESHOLDS.silver 
      ? 'silver' 
      : 'bronze';
  
  const nextTierThreshold = tier === 'bronze' 
    ? TIER_THRESHOLDS.silver 
    : tier === 'silver' 
      ? TIER_THRESHOLDS.gold 
      : TIER_THRESHOLDS.gold;
  
  return {
    totalReferrals,
    activeReferrals: 8,
    totalEarnings: 1250.5,
    pendingRewards: 125.75,
    tier,
    tierProgress: tier === 'gold' ? 100 : (totalReferrals / nextTierThreshold) * 100,
    nextTierThreshold,
  };
}

// Get list of referrals for a user
export async function getReferralList(userId: string): Promise<ReferralRecord[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: '1',
      visibleId: 'REF001',
      referrerId: userId,
      refereeId: 'user-2',
      refereeName: 'Alice Chen',
      refereeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      joinedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      status: 'active',
      totalVolume: 5000,
      earnings: 250,
      level: 1,
    },
    {
      id: '2',
      visibleId: 'REF002',
      referrerId: userId,
      refereeId: 'user-3',
      refereeName: 'Bob Wang',
      refereeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      joinedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      status: 'active',
      totalVolume: 3200,
      earnings: 160,
      level: 1,
    },
    {
      id: '3',
      visibleId: 'REF003',
      referrerId: userId,
      refereeId: 'user-4',
      refereeName: 'Carol Li',
      joinedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      status: 'pending',
      totalVolume: 0,
      earnings: 0,
      level: 1,
    },
    {
      id: '4',
      visibleId: 'REF004',
      referrerId: 'user-2',
      refereeId: 'user-5',
      refereeName: 'David Zhang',
      refereeAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      joinedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      status: 'active',
      totalVolume: 1500,
      earnings: 30,
      level: 2,
    },
  ];
}

// Get pending rewards for a user
export async function getPendingRewards(userId: string): Promise<ReferralReward[]> {
  // In production, this would fetch from database
  return [
    {
      id: 'reward-1',
      referralId: '1',
      amount: 50,
      type: 'trading_fee',
      status: 'pending',
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
      id: 'reward-2',
      referralId: '2',
      amount: 25.75,
      type: 'trading_fee',
      status: 'pending',
      createdAt: Date.now() - 12 * 60 * 60 * 1000,
    },
  ];
}

// Claim pending rewards
export async function claimRewards(userId: string, rewardIds: string[]): Promise<{ success: boolean; amount: number; message: string }> {
  // In production, this would:
  // 1. Verify rewards belong to user
  // 2. Transfer SOUL tokens to user wallet
  // 3. Update reward status to 'claimed'
  
  const totalAmount = 75.75; // Mock amount
  
  return {
    success: true,
    amount: totalAmount,
    message: `Successfully claimed ${totalAmount} SOUL rewards!`,
  };
}

// Calculate tier benefits
export function getTierBenefits(tier: 'bronze' | 'silver' | 'gold'): {
  feeShareBonus: number;
  monthlyBonus: number;
  exclusiveFeatures: string[];
} {
  switch (tier) {
    case 'gold':
      return {
        feeShareBonus: 0.02, // +2% extra fee share
        monthlyBonus: 5000,
        exclusiveFeatures: [
          'Priority support',
          'Early access to new features',
          'Exclusive airdrops',
          'VIP badge',
        ],
      };
    case 'silver':
      return {
        feeShareBonus: 0.01, // +1% extra fee share
        monthlyBonus: 1500,
        exclusiveFeatures: [
          'Priority support',
          'Early access to new features',
        ],
      };
    default:
      return {
        feeShareBonus: 0,
        monthlyBonus: 500,
        exclusiveFeatures: [],
      };
  }
}

// Generate shareable referral link
export function generateReferralLink(code: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soulcast.app';
  return `${baseUrl}/join?ref=${code}`;
}

// Copy referral link to clipboard
export async function copyReferralLink(code: string): Promise<boolean> {
  try {
    const link = generateReferralLink(code);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Failed to copy referral link:', error);
    return false;
  }
}

export const REFERRAL_CONFIG = {
  TIER_THRESHOLDS,
  REWARD_RATES,
};
