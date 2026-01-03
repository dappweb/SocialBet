/**
 * Ambassador Service
 * Handles ambassador program management and rewards
 */

export interface Ambassador {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  joinDate: number;
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  monthlyBonus: number;
  socialLinks: SocialLink[];
  achievements: Achievement[];
  status: 'active' | 'inactive' | 'suspended';
  rank?: number;
}

export interface SocialLink {
  platform: 'twitter' | 'youtube' | 'telegram' | 'discord' | 'instagram' | 'tiktok' | 'blog';
  url: string;
  followers: number;
  verified: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  points: number;
}

export interface AmbassadorTask {
  id: string;
  title: string;
  description: string;
  type: 'social_post' | 'content_creation' | 'community_engagement' | 'referral_target' | 'event_hosting';
  points: number;
  bonusMultiplier: number;
  deadline?: number;
  completed: boolean;
  completedAt?: number;
  proofUrl?: string;
}

export interface AmbassadorReward {
  id: string;
  ambassadorId: string;
  amount: number;
  type: 'monthly_bonus' | 'task_completion' | 'tier_upgrade' | 'special_bonus';
  timestamp: number;
  status: 'pending' | 'paid' | 'cancelled';
  description: string;
}

export interface AmbassadorStats {
  totalAmbassadors: number;
  activeAmbassadors: number;
  totalPaidOut: number;
  avgMonthlyEarnings: number;
  topTierDistribution: Record<string, number>;
}

// Tier configurations

// Get ambassador profile
export async function getAmbassadorProfile(userId: string): Promise<Ambassador | null> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return {
    id: 'amb-1',
    userId,
    name: 'Alice Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    tier: 'gold',
    joinDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
    totalReferrals: 35,
    activeReferrals: 28,
    totalEarned: 12500,
    monthlyBonus: 5000,
    socialLinks: [
      {
        platform: 'twitter',
        url: 'https://twitter.com/alicechen',
        followers: 1250,
        verified: true,
      },
      {
        platform: 'youtube',
        url: 'https://youtube.com/@alicechen',
        followers: 8500,
        verified: false,
      },
      {
        platform: 'telegram',
        url: 'https://t.me/alicechen',
        followers: 3200,
        verified: false,
      },
    ],
    achievements: [
      {
        id: 'ach-1',
        name: 'First Referral',
        description: 'Successfully referred first user',
        icon: '🎯',
        unlockedAt: Date.now() - 85 * 24 * 60 * 60 * 1000,
        points: 100,
      },
      {
        id: 'ach-2',
        name: 'Social Butterfly',
        description: 'Reached 1000+ followers on any platform',
        icon: '🦋',
        unlockedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        points: 500,
      },
      {
        id: 'ach-3',
        name: 'Gold Ambassador',
        description: 'Achieved Gold tier status',
        icon: '🏆',
        unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        points: 1000,
      },
    ],
    status: 'active',
    rank: 15,
  };
}

// Get available tasks for ambassador
export async function getAmbassadorTasks(ambassadorId: string): Promise<AmbassadorTask[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: 'task-1',
      title: 'Weekly Twitter Thread',
      description: 'Create a thread about SoulCast features',
      type: 'social_post',
      points: 100,
      bonusMultiplier: 1.2,
      deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
      completed: false,
    },
    {
      id: 'task-2',
      title: 'YouTube Tutorial',
      description: 'Create a tutorial video for beginners',
      type: 'content_creation',
      points: 500,
      bonusMultiplier: 1.5,
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Community AMA',
      description: 'Host an AMA session in Discord',
      type: 'community_engagement',
      points: 300,
      bonusMultiplier: 1.3,
      deadline: Date.now() + 14 * 24 * 60 * 60 * 1000,
      completed: true,
      completedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      proofUrl: 'https://discord.com/events/123',
    },
    {
      id: 'task-4',
      title: 'Monthly Referral Target',
      description: 'Refer 5 new users this month',
      type: 'referral_target',
      points: 250,
      bonusMultiplier: 1,
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
      completed: false,
    },
  ];
}

// Complete ambassador task
export async function completeAmbassadorTask(
  ambassadorId: string,
  taskId: string,
  proofUrl?: string
): Promise<{
  success: boolean;
  points: number;
  message: string;
}> {
  // In production, this would:
  // 1. Validate task belongs to ambassador
  // 2. Verify proof if provided
  // 3. Update task status
  // 4. Award points and rewards
  
  return {
    success: true,
    points: 100,
    message: 'Task completed successfully! You earned 100 points.',
  };
}

// Get ambassador rewards history
export async function getAmbassadorRewards(ambassadorId: string): Promise<AmbassadorReward[]> {
  // In production, this would fetch from database
  return [
    {
      id: 'reward-1',
      ambassadorId,
      amount: 5000,
      type: 'monthly_bonus',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      status: 'paid',
      description: 'Gold tier monthly bonus',
    },
    {
      id: 'reward-2',
      ambassadorId,
      amount: 150,
      type: 'task_completion',
      timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
      status: 'paid',
      description: 'Weekly Twitter thread completion',
    },
    {
      id: 'reward-3',
      ambassadorId,
      amount: 1000,
      type: 'tier_upgrade',
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
      status: 'paid',
      description: 'Silver to Gold tier upgrade bonus',
    },
  ];
}

// Apply for ambassador program
export async function applyForAmbassador(
  userId: string,
  applicationData: {
    name: string;
    email: string;
    socialLinks: SocialLink[];
    experience: string;
    motivation: string;
  }
): Promise<{
  success: boolean;
  message: string;
  applicationId?: string;
}> {
  // In production, this would:
  // 1. Validate application data
  // 2. Check if user is already ambassador
  // 3. Create application record
  // 4. Send notification to admin team
  
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  return {
    success: true,
    message: 'Application submitted successfully! We will review your application within 3-5 business days.',
    applicationId,
  };
}

// Get ambassador leaderboard
export async function getAmbassadorLeaderboard(): Promise<Ambassador[]> {
  // In production, this would fetch from database
  // Mock data for demonstration
  return [
    {
      id: 'amb-1',
      userId: 'user-1',
      name: 'Alice Chen',
      tier: 'diamond',
      joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
      totalReferrals: 150,
      activeReferrals: 120,
      totalEarned: 45000,
      monthlyBonus: 25000,
      socialLinks: [],
      achievements: [],
      status: 'active',
      rank: 1,
    },
    {
      id: 'amb-2',
      userId: 'user-2',
      name: 'Bob Wang',
      tier: 'platinum',
      joinDate: Date.now() - 150 * 24 * 60 * 60 * 1000,
      totalReferrals: 85,
      activeReferrals: 70,
      totalEarned: 28000,
      monthlyBonus: 10000,
      socialLinks: [],
      achievements: [],
      status: 'active',
      rank: 2,
    },
    {
      id: 'amb-3',
      userId: 'user-3',
      name: 'Carol Li',
      tier: 'gold',
      joinDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
      totalReferrals: 45,
      activeReferrals: 38,
      totalEarned: 15000,
      monthlyBonus: 5000,
      socialLinks: [],
      achievements: [],
      status: 'active',
      rank: 3,
    },
  ];
}

// Get ambassador program statistics
export async function getAmbassadorStats(): Promise<AmbassadorStats> {
  // In production, this would calculate from database
  return {
    totalAmbassadors: 250,
    activeAmbassadors: 180,
    totalPaidOut: 1250000,
    avgMonthlyEarnings: 3200,
    topTierDistribution: {
      diamond: 5,
      platinum: 15,
      gold: 45,
      silver: 85,
      bronze: 100,
    },
  };
}

// Check ambassador eligibility
export async function checkAmbassadorEligibility(userId: string): Promise<{
  eligible: boolean;
  requirements: string[];
  currentStatus: string[];
}> {
  // In production, this would check actual user data
  return {
    eligible: false,
    requirements: ['Minimum 10 followers on any platform', 'Active social media presence', 'No policy violations'],
    currentStatus: ['8/10 followers requirement met', 'Active social presence verified'],
  };
}

// Update ambassador tier
export async function updateAmbassadorTier(
  ambassadorId: string,
  newTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
): Promise<{
  success: boolean;
  message: string;
  bonusAwarded?: number;
}> {
  // In production, this would:
  // 1. Validate tier upgrade requirements
  // 2. Update ambassador record
  // 3. Award tier upgrade bonus
  
  const tierBonus = TIER_CONFIGS[newTier].monthlyBonus;
  
  return {
    success: true,
    message: `Congratulations! You've been upgraded to ${newTier} tier!`,
    bonusAwarded: tierBonus,
  };
}

// Get available achievements
export async function getAvailableAchievements(): Promise<Achievement[]> {
  // In production, this would fetch from database
  return [
    {
      id: 'ach-newbie',
      name: 'Newbie Ambassador',
      description: 'Join the ambassador program',
      icon: '🌟',
      unlockedAt: 0,
      points: 50,
    },
    {
      id: 'ach-first-ref',
      name: 'First Referral',
      description: 'Successfully refer your first user',
      icon: '🎯',
      unlockedAt: 0,
      points: 100,
    },
    {
      id: 'ach-social-butterfly',
      name: 'Social Butterfly',
      description: 'Reach 1000+ followers on any platform',
      icon: '🦋',
      unlockedAt: 0,
      points: 500,
    },
    {
      id: 'ach-content-creator',
      name: 'Content Creator',
      description: 'Create 10 pieces of content',
      icon: '📹',
      unlockedAt: 0,
      points: 300,
    },
    {
      id: 'ach-community-leader',
      name: 'Community Leader',
      description: 'Host 5 community events',
      icon: '👑',
      unlockedAt: 0,
      points: 750,
    },
    {
      id: 'ach-influencer',
      name: 'Influencer',
      description: 'Reach 10000+ total followers',
      icon: '🌟',
      unlockedAt: 0,
      points: 1000,
    },
  ];
}


export const TIER_CONFIGS = {
  bronze: {
    minReferrals: 0,
    monthlyBonus: 500,
    bonusMultiplier: 1,
    requirements: ['10+ followers', 'active social presence'],
    color: '#cd7f32',
  },
  silver: {
    minReferrals: 10,
    monthlyBonus: 1500,
    bonusMultiplier: 1.2,
    requirements: ['100+ followers', 'monthly content quota'],
    color: '#c0c0c0',
  },
  gold: {
    minReferrals: 25,
    monthlyBonus: 5000,
    bonusMultiplier: 1.5,
    requirements: ['500+ followers', 'weekly content quota', 'community engagement'],
    color: '#ffd700',
  },
  platinum: {
    minReferrals: 50,
    monthlyBonus: 10000,
    bonusMultiplier: 2,
    requirements: ['1000+ followers', 'daily content', 'event hosting'],
    color: '#e5e4e2',
  },
  diamond: {
    minReferrals: 100,
    monthlyBonus: 25000,
    bonusMultiplier: 3,
    requirements: ['5000+ followers', 'premium content', 'global influence'],
    color: '#b9f2ff',
  },
};

export const AMBASSADOR_CONFIG = {
  MIN_FOLLOWERS: 10,
  MIN_CONTENT_PER_MONTH: 4,
  REFERRAL_BONUS_RATE: 0.05,
  TASK_COMPLETION_BONUS: 0.1,
  TIER_UPGRADE_BONUS: 1000,
};
