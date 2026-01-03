/**
 * Red Envelope (红包) Service
 * Handles social gifting feature for viral growth in Asian markets
 */

export interface RedEnvelope {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  totalAmount: number;
  currency: 'SOUL' | 'ETH' | 'USDC';
  envelopeType: 'random' | 'fixed' | 'lucky';
  totalSlots: number;
  remainingSlots: number;
  message?: string;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'empty';
  password?: string;
  isPrivate: boolean;
}

export interface RedEnvelopeClaim {
  id: string;
  envelopeId: string;
  claimerId: string;
  claimerName: string;
  claimerAvatar?: string;
  amount: number;
  claimedAt: number;
  isLucky: boolean;
  rank?: number;
}

export interface CreateRedEnvelopeParams {
  totalAmount: number;
  currency: 'SOUL' | 'ETH' | 'USDC';
  envelopeType: 'random' | 'fixed' | 'lucky';
  totalSlots: number;
  message?: string;
  password?: string;
  isPrivate?: boolean;
  expiresIn?: number; // hours
}

export interface RedEnvelopeStats {
  totalCreated: number;
  totalSent: number;
  totalReceived: number;
  luckyDraws: number;
  averageAmount: number;
}

// Generate unique envelope ID
export function generateEnvelopeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `env_${timestamp}_${random}`;
}

// Calculate random distribution for red envelope
export function calculateRandomDistribution(
  totalAmount: number,
  totalSlots: number,
  envelopeType: 'random' | 'fixed' | 'lucky'
): number[] {
  const amounts: number[] = [];
  
  switch (envelopeType) {
    case 'fixed':
      const fixedAmount = totalAmount / totalSlots;
      for (let i = 0; i < totalSlots; i++) {
        amounts.push(fixedAmount);
      }
      break;
      
    case 'random':
      let remaining = totalAmount;
      for (let i = 0; i < totalSlots - 1; i++) {
        const maxAmount = remaining * 0.8; // Max 80% of remaining
        const minAmount = remaining * 0.01; // Min 1% of remaining
        const amount = Math.random() * (maxAmount - minAmount) + minAmount;
        amounts.push(amount);
        remaining -= amount;
      }
      amounts.push(remaining); // Last slot gets remaining
      break;
      
    case 'lucky':
      // One lucky slot gets 50-70% of total, others share the rest
      const luckyIndex = Math.floor(Math.random() * totalSlots);
      const luckyAmount = totalAmount * (0.5 + Math.random() * 0.2);
      const remainingAmount = totalAmount - luckyAmount;
      const normalAmount = remainingAmount / (totalSlots - 1);
      
      for (let i = 0; i < totalSlots; i++) {
        amounts.push(i === luckyIndex ? luckyAmount : normalAmount);
      }
      break;
  }
  
  // Shuffle for random distribution
  return envelopeType === 'fixed' ? amounts : amounts.sort(() => Math.random() - 0.5);
}

// Create a new red envelope
export async function createRedEnvelope(
  userId: string,
  userName: string,
  params: CreateRedEnvelopeParams,
  userAvatar?: string
): Promise<RedEnvelope> {
  const envelopeId = generateEnvelopeId();
  const now = Date.now();
  const expiresIn = params.expiresIn || 24; // Default 24 hours
  
  const envelope: RedEnvelope = {
    id: envelopeId,
    creatorId: userId,
    creatorName: userName,
    creatorAvatar: userAvatar,
    totalAmount: params.totalAmount,
    currency: params.currency,
    envelopeType: params.envelopeType,
    totalSlots: params.totalSlots,
    remainingSlots: params.totalSlots,
    message: params.message,
    createdAt: now,
    expiresAt: now + (expiresIn * 60 * 60 * 1000),
    status: 'active',
    password: params.password,
    isPrivate: params.isPrivate || false,
  };
  
  // In production, this would save to database
  console.log('Created red envelope:', envelope);
  
  return envelope;
}

// Get red envelope by ID
export async function getRedEnvelope(envelopeId: string): Promise<RedEnvelope | null> {
  // In production, this would fetch from database
  // Mock data for demonstration
  const mockEnvelope: RedEnvelope = {
    id: envelopeId,
    creatorId: 'user-1',
    creatorName: 'Alice Chen',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    totalAmount: 1000,
    currency: 'SOUL',
    envelopeType: 'random',
    totalSlots: 10,
    remainingSlots: 7,
    message: 'Happy New Year! 🎊',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    expiresAt: Date.now() + 22 * 60 * 60 * 1000,
    status: 'active',
    isPrivate: false,
  };
  
  return envelopeId.startsWith('env_') ? mockEnvelope : null;
}

// Claim from red envelope
export async function claimRedEnvelope(
  envelopeId: string,
  userId: string,
  userName: string,
  password?: string,
  userAvatar?: string
): Promise<{
  success: boolean;
  amount?: number;
  isLucky?: boolean;
  message: string;
  claim?: RedEnvelopeClaim;
}> {
  const envelope = await getRedEnvelope(envelopeId);
  
  if (!envelope) {
    return { success: false, message: 'Red envelope not found' };
  }
  
  if (envelope.status !== 'active') {
    return { success: false, message: 'This red envelope is no longer available' };
  }
  
  if (Date.now() > envelope.expiresAt) {
    return { success: false, message: 'Red envelope has expired' };
  }
  
  if (envelope.remainingSlots <= 0) {
    return { success: false, message: 'All slots have been claimed' };
  }
  
  if (envelope.isPrivate && envelope.password !== password) {
    return { success: false, message: 'Incorrect password' };
  }
  
  // In production, check if user already claimed
  // For now, generate random amount
  const amounts = calculateRandomDistribution(
    envelope.totalAmount,
    envelope.totalSlots,
    envelope.envelopeType
  );
  
  const claimedCount = envelope.totalSlots - envelope.remainingSlots;
  const amount = amounts[claimedCount];
  const isLucky = envelope.envelopeType === 'lucky' && amount > envelope.totalAmount * 0.4;
  
  const claim: RedEnvelopeClaim = {
    id: `claim_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    envelopeId,
    claimerId: userId,
    claimerName: userName,
    claimerAvatar: userAvatar,
    amount,
    claimedAt: Date.now(),
    isLucky,
    rank: claimedCount + 1,
  };
  
  // In production, this would:
  // 1. Save claim to database
  // 2. Transfer tokens to user wallet
  // 3. Update envelope remaining slots
  
  return {
    success: true,
    amount,
    isLucky,
    message: isLucky 
      ? `🎉 Lucky draw! You received ${amount.toFixed(2)} ${envelope.currency}!`
      : `You received ${amount.toFixed(2)} ${envelope.currency}!`,
    claim,
  };
}

// Get claims for a red envelope
export async function getRedEnvelopeClaims(envelopeId: string): Promise<RedEnvelopeClaim[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: 'claim-1',
      envelopeId,
      claimerId: 'user-2',
      claimerName: 'Bob Wang',
      claimerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      amount: 150.5,
      claimedAt: Date.now() - 60 * 60 * 1000,
      isLucky: true,
      rank: 1,
    },
    {
      id: 'claim-2',
      envelopeId,
      claimerId: 'user-3',
      claimerName: 'Carol Li',
      claimerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
      amount: 85.2,
      claimedAt: Date.now() - 30 * 60 * 1000,
      isLucky: false,
      rank: 2,
    },
    {
      id: 'claim-3',
      envelopeId,
      claimerId: 'user-4',
      claimerName: 'David Zhang',
      amount: 120.8,
      claimedAt: Date.now() - 15 * 60 * 1000,
      isLucky: false,
      rank: 3,
    },
  ];
}

// Get user's red envelope statistics
export async function getUserRedEnvelopeStats(userId: string): Promise<RedEnvelopeStats> {
  // In production, this would calculate from database
  return {
    totalCreated: 5,
    totalSent: 5000,
    totalReceived: 850.5,
    luckyDraws: 2,
    averageAmount: 170.1,
  };
}

// Get user's created envelopes
export async function getUserCreatedEnvelopes(userId: string): Promise<RedEnvelope[]> {
  // In production, this would fetch from database
  return [
    {
      id: 'env_1',
      creatorId: userId,
      creatorName: 'You',
      totalAmount: 1000,
      currency: 'SOUL',
      envelopeType: 'random',
      totalSlots: 10,
      remainingSlots: 3,
      message: 'Happy Birthday! 🎂',
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
      expiresAt: Date.now() + 0,
      status: 'active',
      isPrivate: false,
    },
    {
      id: 'env_2',
      creatorId: userId,
      creatorName: 'You',
      totalAmount: 500,
      currency: 'SOUL',
      envelopeType: 'lucky',
      totalSlots: 5,
      remainingSlots: 0,
      message: 'Weekend bonus!',
      createdAt: Date.now() - 48 * 60 * 60 * 1000,
      expiresAt: Date.now() - 24 * 60 * 60 * 1000,
      status: 'empty',
      isPrivate: true,
    },
  ];
}

// Get user's claimed envelopes
export async function getUserClaimedEnvelopes(userId: string): Promise<RedEnvelopeClaim[]> {
  // In production, this would fetch from database
  return [
    {
      id: 'claim-4',
      envelopeId: 'env_3',
      claimerId: userId,
      claimerName: 'You',
      amount: 200,
      claimedAt: Date.now() - 2 * 60 * 60 * 1000,
      isLucky: false,
    },
    {
      id: 'claim-5',
      envelopeId: 'env_4',
      claimerId: userId,
      claimerName: 'You',
      amount: 350,
      claimedAt: Date.now() - 6 * 60 * 60 * 1000,
      isLucky: true,
    },
  ];
}

// Get trending red envelopes
export async function getTrendingRedEnvelopes(): Promise<RedEnvelope[]> {
  // In production, this would fetch based on activity
  return [
    {
      id: 'env_trending_1',
      creatorId: 'user-5',
      creatorName: 'Eve Johnson',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
      totalAmount: 5000,
      currency: 'SOUL',
      envelopeType: 'lucky',
      totalSlots: 20,
      remainingSlots: 15,
      message: 'Mega giveaway! 🎰',
      createdAt: Date.now() - 30 * 60 * 1000,
      expiresAt: Date.now() + 23.5 * 60 * 60 * 1000,
      status: 'active',
      isPrivate: false,
    },
    {
      id: 'env_trending_2',
      creatorId: 'user-6',
      creatorName: 'Frank Lee',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank',
      totalAmount: 2000,
      currency: 'SOUL',
      envelopeType: 'random',
      totalSlots: 15,
      remainingSlots: 8,
      message: 'Community love ❤️',
      createdAt: Date.now() - 45 * 60 * 1000,
      expiresAt: Date.now() + 23.25 * 60 * 60 * 1000,
      status: 'active',
      isPrivate: false,
    },
  ];
}

// Generate shareable link for red envelope
export function generateRedEnvelopeLink(envelopeId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soulcast.app';
  return `${baseUrl}/red-envelope/${envelopeId}`;
}

// Copy red envelope link to clipboard
export async function copyRedEnvelopeLink(envelopeId: string): Promise<boolean> {
  try {
    const link = generateRedEnvelopeLink(envelopeId);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Failed to copy red envelope link:', error);
    return false;
  }
}

export const RED_ENVELOPE_CONFIG = {
  MIN_AMOUNT: 10,
  MAX_AMOUNT: 100000,
  MIN_SLOTS: 2,
  MAX_SLOTS: 100,
  DEFAULT_EXPIRY_HOURS: 24,
  MAX_EXPIRY_HOURS: 168, // 7 days
};
