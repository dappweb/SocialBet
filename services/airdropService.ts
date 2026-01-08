/**
 * Airdrop Service
 * Handles airdrop campaigns and rewards for user engagement
 */

export interface AirdropCampaign {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  currency: 'SOUL' | 'ETH' | 'USDC';
  totalRecipients: number;
  claimedCount: number;
  startDate: number;
  endDate: number;
  status: 'upcoming' | 'active' | 'ended' | 'expired';
  requirements: AirdropRequirement[];
  rewards: AirdropReward[];
  imageUrl?: string;
  createdBy: string;
  createdAt: number;
}

export interface AirdropRequirement {
  type: 'social_follow' | 'social_share' | 'join_discord' | 'join_telegram' | 'hold_tokens' | 'make_prediction' | 'invite_friends' | 'daily_checkin';
  description: string;
  target: number;
  current?: number;
  completed?: boolean;
  platform?: string;
  link?: string;
}

export interface AirdropReward {
  tier: number;
  minRequirements: number;
  amount: number;
  bonusMultiplier: number;
  description: string;
}

export interface UserAirdropStatus {
  campaignId: string;
  userId: string;
  completedRequirements: string[];
  claimedReward: number;
  claimStatus: 'eligible' | 'claimed' | 'ineligible';
  claimedAt?: number;
  totalPoints: number;
  rank?: number;
}

export interface AirdropTask {
  id: string;
  type: 'daily' | 'weekly' | 'one_time';
  title: string;
  description: string;
  points: number;
  completed: boolean;
  completedAt?: number;
  expiresAt?: number;
  actionUrl?: string;
}

// Generate unique campaign ID
export function generateCampaignId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `airdrop_${timestamp}_${random}`;
}

// Get available airdrop campaigns
export async function getAirdropCampaigns(): Promise<AirdropCampaign[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: 'airdrop_1',
      name: 'New Year Celebration',
      description: 'Celebrate the new year with SOUL tokens! Complete tasks to earn rewards.',
      totalAmount: 100000,
      currency: 'SOUL',
      totalRecipients: 1000,
      claimedCount: 342,
      startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 23 * 24 * 60 * 60 * 1000,
      status: 'active',
      requirements: [
        {
          type: 'social_follow',
          description: 'Follow us on Twitter',
          target: 1,
          current: 1,
          completed: true,
          platform: 'Twitter',
          link: 'https://twitter.com/kolmarket',
        },
        {
          type: 'join_discord',
          description: 'Join our Discord server',
          target: 1,
          current: 0,
          completed: false,
          platform: 'Discord',
          link: 'https://discord.gg/kolmarket',
        },
        {
          type: 'make_prediction',
          description: 'Make 5 predictions',
          target: 5,
          current: 2,
          completed: false,
        },
        {
          type: 'invite_friends',
          description: 'Invite 3 friends',
          target: 3,
          current: 1,
          completed: false,
        },
      ],
      rewards: [
        {
          tier: 1,
          minRequirements: 2,
          amount: 50,
          bonusMultiplier: 1,
          description: 'Basic reward',
        },
        {
          tier: 2,
          minRequirements: 3,
          amount: 100,
          bonusMultiplier: 1.5,
          description: 'Enhanced reward',
        },
        {
          tier: 3,
          minRequirements: 4,
          amount: 200,
          bonusMultiplier: 2,
          description: 'Premium reward',
        },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1511794139838-b041a42ac69c?w=800',
      createdBy: 'soulcast-team',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'airdrop_2',
      name: 'Community Builder',
      description: 'Help build our community and get rewarded!',
      totalAmount: 50000,
      currency: 'SOUL',
      totalRecipients: 500,
      claimedCount: 127,
      startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 27 * 24 * 60 * 60 * 1000,
      status: 'active',
      requirements: [
        {
          type: 'hold_tokens',
          description: 'Hold 100 SOUL tokens',
          target: 100,
          current: 0,
          completed: false,
        },
        {
          type: 'daily_checkin',
          description: 'Daily check-in for 7 days',
          target: 7,
          current: 3,
          completed: false,
        },
        {
          type: 'social_share',
          description: 'Share 3 posts about KOL Market',
          target: 3,
          current: 1,
          completed: false,
          platform: 'Twitter',
        },
      ],
      rewards: [
        {
          tier: 1,
          minRequirements: 2,
          amount: 25,
          bonusMultiplier: 1,
          description: 'Community reward',
        },
        {
          tier: 2,
          minRequirements: 3,
          amount: 75,
          bonusMultiplier: 1.2,
          description: 'Super community reward',
        },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-a65137e80414?w=800',
      createdBy: 'soulcast-team',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
  ];
}

// Get user's airdrop status for a campaign
export async function getUserAirdropStatus(
  campaignId: string,
  userId: string
): Promise<UserAirdropStatus | null> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return {
    campaignId,
    userId,
    completedRequirements: ['social_follow'],
    claimedReward: 0,
    claimStatus: 'eligible',
    totalPoints: 15,
    rank: 342,
  };
}

// Get user's available tasks
export async function getUserAirdropTasks(userId: string): Promise<AirdropTask[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: 'task_1',
      type: 'daily',
      title: 'Daily Check-in',
      description: 'Check in daily to earn points',
      points: 5,
      completed: true,
      completedAt: Date.now() - 2 * 60 * 60 * 1000,
      expiresAt: Date.now() + 22 * 60 * 60 * 1000,
    },
    {
      id: 'task_2',
      type: 'daily',
      title: 'Make a Prediction',
      description: 'Make at least one prediction today',
      points: 10,
      completed: false,
      expiresAt: Date.now() + 22 * 60 * 60 * 1000,
    },
    {
      id: 'task_3',
      type: 'weekly',
      title: 'Weekly Trading',
      description: 'Trade 100 SOUL worth of tokens this week',
      points: 50,
      completed: false,
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'task_4',
      type: 'one_time',
      title: 'Complete Profile',
      description: 'Complete your profile setup',
      points: 25,
      completed: true,
      completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'task_5',
      type: 'daily',
      title: 'Share on Social Media',
      description: 'Share KOL Market on social media',
      points: 15,
      completed: false,
      expiresAt: Date.now() + 22 * 60 * 60 * 1000,
      actionUrl: 'https://twitter.com/intent/tweet?text=Check+out+KOL+Market!',
    },
  ];
}

// Complete a task
export async function completeTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; points: number; message: string }> {
  // In production, this would:
  // 1. Verify task belongs to user
  // 2. Check if task is already completed
  // 3. Update task status in database
  // 4. Award points to user
  
  return {
    success: true,
    points: 10,
    message: 'Task completed! You earned 10 points.',
  };
}

// Claim airdrop reward
export async function claimAirdropReward(
  campaignId: string,
  userId: string
): Promise<{
  success: boolean;
  amount?: number;
  message: string;
  tier?: number;
}> {
  const campaign = (await getAirdropCampaigns()).find(c => c.id === campaignId);
  const userStatus = await getUserAirdropStatus(campaignId, userId);
  
  if (!campaign || !userStatus) {
    return { success: false, message: 'Campaign not found' };
  }
  
  if (campaign.status !== 'active') {
    return { success: false, message: 'Campaign is not active' };
  }
  
  if (userStatus.claimStatus === 'claimed') {
    return { success: false, message: 'You have already claimed this airdrop' };
  }
  
  if (userStatus.claimStatus === 'ineligible') {
    return { success: false, message: 'You are not eligible for this airdrop' };
  }
  
  // Calculate reward based on completed requirements
  const completedCount = userStatus.completedRequirements.length;
  let rewardTier = 0;
  let rewardAmount = 0;
  
  for (const reward of campaign.rewards) {
    if (completedCount >= reward.minRequirements) {
      rewardTier = reward.tier;
      rewardAmount = reward.amount * reward.bonusMultiplier;
    }
  }
  
  if (rewardAmount === 0) {
    return { success: false, message: 'Complete more requirements to claim a reward' };
  }
  
  // In production, this would:
  // 1. Transfer tokens to user wallet
  // 2. Update user claim status
  // 3. Update campaign claimed count
  
  return {
    success: true,
    amount: rewardAmount,
    message: `Successfully claimed ${rewardAmount.toFixed(2)} ${campaign.currency}!`,
    tier: rewardTier,
  };
}

// Get user's airdrop history
export async function getUserAirdropHistory(userId: string): Promise<{
  campaign: AirdropCampaign;
  claimedAt: number;
  amount: number;
  tier: number;
}[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      campaign: (await getAirdropCampaigns())[0],
      claimedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      amount: 100,
      tier: 2,
    },
  ];
}

// Get airdrop statistics
export async function getAirdropStats(userId: string): Promise<{
  totalClaimed: number;
  totalPoints: number;
  completedTasks: number;
  activeCampaigns: number;
  rank: number;
}> {
  // In production, this would calculate from database
  return {
    totalClaimed: 150,
    totalPoints: 250,
    completedTasks: 8,
    activeCampaigns: 2,
    rank: 342,
  };
}

// Check task eligibility
export async function checkTaskEligibility(
  userId: string,
  taskType: string
): Promise<{ eligible: boolean; reason?: string }> {
  // In production, this would check actual user data
  switch (taskType) {
    case 'hold_tokens':
      // Check if user holds minimum tokens
      return { eligible: false, reason: 'You need to hold at least 100 SOUL tokens' };
    case 'make_prediction':
      // Check if user has made predictions today
      return { eligible: true };
    case 'daily_checkin':
      // Check if user has checked in today
      return { eligible: false, reason: 'You have already checked in today' };
    default:
      return { eligible: true };
  }
}

// Generate shareable link for airdrop
export function generateAirdropLink(campaignId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kolmarket.ai';
  return `${baseUrl}/airdrop/${campaignId}`;
}

// Copy airdrop link to clipboard
export async function copyAirdropLink(campaignId: string): Promise<boolean> {
  try {
    const link = generateAirdropLink(campaignId);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Failed to copy airdrop link:', error);
    return false;
  }
}

export const AIRDROP_CONFIG = {
  MIN_CAMPAIGN_AMOUNT: 1000,
  MAX_CAMPAIGN_AMOUNT: 1000000,
  MIN_RECIPIENTS: 10,
  MAX_RECIPIENTS: 10000,
  DEFAULT_DURATION_DAYS: 30,
  MAX_DURATION_DAYS: 365,
};
