export interface UserLevel {
  level: number;
  title: string;
  experience: number;
  nextLevelExp: number;
  progress: number; // 0-100
  color: string;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trading' | 'social' | 'creation' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: {
    current: number;
    required: number;
    completed: boolean;
  };
  unlockedAt?: string;
  points: number;
}

export interface UserStats {
  totalBets: number;
  totalMarkets: number;
  correctPredictions: number;
  accuracy: number;
  totalVolume: number;
  followersCount: number;
  followingCount: number;
  achievementsUnlocked: number;
  currentStreak: number;
  bestStreak: number;
}

export interface LevelReward {
  level: number;
  title: string;
  rewards: {
    soulTokens: number;
    features: string[];
    badge: string;
  };
}

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  // Trading Achievements
  {
    id: 'first_bet',
    name: 'First Bet',
    description: 'Place your first prediction bet',
    icon: '🎯',
    category: 'trading',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'ten_bets',
    name: 'Betting Enthusiast',
    description: 'Place 10 prediction bets',
    icon: '📊',
    category: 'trading',
    rarity: 'common',
    points: 25,
  },
  {
    id: 'hundred_bets',
    name: 'Seasoned Trader',
    description: 'Place 100 prediction bets',
    icon: '💹',
    category: 'trading',
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'perfect_prediction',
    name: 'Perfect Prediction',
    description: 'Get a prediction 100% correct',
    icon: '🎯',
    category: 'trading',
    rarity: 'epic',
    points: 50,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Get 5 correct predictions in a row',
    icon: '🔥',
    category: 'trading',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'whale_trader',
    name: 'Whale Trader',
    description: 'Trade over 10,000 USD total volume',
    icon: '🐋',
    category: 'trading',
    rarity: 'epic',
    points: 150,
  },

  // Social Achievements
  {
    id: 'first_follow',
    name: 'Social Butterfly',
    description: 'Follow your first user',
    icon: '🦋',
    category: 'social',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'ten_followers',
    name: 'Rising Star',
    description: 'Get 10 followers',
    icon: '⭐',
    category: 'social',
    rarity: 'common',
    points: 25,
  },
  {
    id: 'hundred_followers',
    name: 'Influencer',
    description: 'Get 100 followers',
    icon: '👑',
    category: 'social',
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'social_connector',
    name: 'Social Connector',
    description: 'Follow 50 users',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    points: 30,
  },

  // Creation Achievements
  {
    id: 'first_market',
    name: 'Market Creator',
    description: 'Create your first prediction market',
    icon: '🏪',
    category: 'creation',
    rarity: 'common',
    points: 15,
  },
  {
    id: 'popular_market',
    name: 'Trendsetter',
    description: 'Create a market with 100+ participants',
    icon: '📈',
    category: 'creation',
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'ten_markets',
    name: 'Market Maker',
    description: 'Create 10 prediction markets',
    icon: '🏭',
    category: 'creation',
    rarity: 'rare',
    points: 50,
  },

  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join in the first month of launch',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    points: 200,
  },
  {
    id: 'verified_trader',
    name: 'Verified Trader',
    description: 'Get your account verified',
    icon: '✅',
    category: 'special',
    rarity: 'epic',
    points: 100,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Maintain 100% prediction accuracy for a week',
    icon: '🏆',
    category: 'special',
    rarity: 'legendary',
    points: 500,
  },
];

// Level definitions
export const LEVELS: LevelReward[] = [
  { level: 1, title: 'Novice Trader', rewards: { soulTokens: 0, features: ['basic_betting'], badge: '🌱' } },
  { level: 2, title: 'Apprentice Trader', rewards: { soulTokens: 10, features: ['basic_betting', 'market_creation'], badge: '🌿' } },
  { level: 3, title: 'Journeyman Trader', rewards: { soulTokens: 25, features: ['basic_betting', 'market_creation', 'advanced_analytics'], badge: '🌳' } },
  { level: 4, title: 'Expert Trader', rewards: { soulTokens: 50, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets'], badge: '🌲' } },
  { level: 5, title: 'Master Trader', rewards: { soulTokens: 100, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access'], badge: '🌳' } },
  { level: 6, title: 'Grandmaster Trader', rewards: { soulTokens: 200, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access', 'early_access'], badge: '🌳' } },
  { level: 7, title: 'Legendary Trader', rewards: { soulTokens: 500, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access', 'early_access', 'custom_badge'], badge: '🌳' } },
  { level: 8, title: 'Oracle Trader', rewards: { soulTokens: 1000, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access', 'early_access', 'custom_badge', 'oracle_features'], badge: '🌳' } },
  { level: 9, title: 'Deity Trader', rewards: { soulTokens: 2000, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access', 'early_access', 'custom_badge', 'oracle_features', 'god_mode'], badge: '🌳' } },
  { level: 10, title: 'Immortal Trader', rewards: { soulTokens: 5000, features: ['basic_betting', 'market_creation', 'advanced_analytics', 'premium_markets', 'api_access', 'early_access', 'custom_badge', 'oracle_features', 'god_mode', 'immortal_status'], badge: '🌳' } },
];

// Experience requirements for each level
export const LEVEL_EXPERIENCE = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1600,   // Level 6
  2400,   // Level 7
  3500,   // Level 8
  5000,   // Level 9
  7000,   // Level 10
];

// Helper functions
export const calculateUserLevel = (experience: number): UserLevel => {
  let level = 1;
  for (let i = 0; i < LEVEL_EXPERIENCE.length; i++) {
    if (experience >= LEVEL_EXPERIENCE[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentLevelExp = LEVEL_EXPERIENCE[level - 1] || 0;
  const nextLevelExp = LEVEL_EXPERIENCE[level] || LEVEL_EXPERIENCE[LEVEL_EXPERIENCE.length - 1];
  const progress = level >= 10 ? 100 : ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  
  const levelData = LEVELS[level - 1] || LEVELS[0];
  
  return {
    level,
    title: levelData.title,
    experience,
    nextLevelExp,
    progress,
    color: getLevelColor(level),
    icon: levelData.badge,
  };
};

export const getLevelColor = (level: number): string => {
  const colors = [
    '#86868b', // Level 1 - Gray
    '#34c759', // Level 2 - Green
    '#007aff', // Level 3 - Blue
    '#5856d6', // Level 4 - Purple
    '#af52de', // Level 5 - Pink
    '#ff9500', // Level 6 - Orange
    '#ff3b30', // Level 7 - Red
    '#ffd700', // Level 8 - Gold
    '#00d4aa', // Level 9 - Teal
    '#1d1d1f', // Level 10 - Black
  ];
  return colors[Math.min(level - 1, colors.length - 1)];
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return '#86868b';
    case 'rare': return '#007aff';
    case 'epic': return '#af52de';
    case 'legendary': return '#ffd700';
    default: return '#86868b';
  }
};

export const getRarityBorder = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'border-[#86868b]';
    case 'rare': return 'border-[#007aff]';
    case 'epic': return 'border-[#af52de]';
    case 'legendary': return 'border-[#ffd700]';
    default: return 'border-[#86868b]';
  }
};
