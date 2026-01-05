import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Star, Target, Users, Zap, Crown, Award, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usersApi } from '../services/api';
import { cn } from '../utils';
import { 
  Achievement, 
  UserLevel, 
  UserStats, 
  ACHIEVEMENTS, 
  calculateUserLevel,
  getRarityColor 
} from '../types/achievements';
import AchievementCard from './AchievementCard';
import UserLevelBadge from './UserLevelBadge';
import LoadingSpinner from './LoadingSpinner';

interface AchievementsPageProps {
  onBack?: () => void;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | Achievement['rarity']>('all');

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user stats and achievements
        const [stats, achievements] = await Promise.all([
          usersApi.getStats(user.id).catch(() => ({
            totalBets: 0,
            totalMarkets: 0,
            correctPredictions: 0,
            accuracy: 0,
            totalVolume: 0,
            followersCount: 0,
            followingCount: 0,
            achievementsUnlocked: 0,
            currentStreak: 0,
            bestStreak: 0,
          })),
          // Mock achievements for now - would be fetched from API
          Promise.resolve([]),
        ]);

        setUserStats(stats);
        
        // Calculate achievement progress based on stats
        const achievementsWithProgress: Achievement[] = ACHIEVEMENTS.map(achievement => {
          const progress = calculateAchievementProgress(achievement, stats);
          return {
            ...achievement,
            progress,
            unlockedAt: progress.completed ? new Date().toISOString() : undefined,
          };
        });

        setUserAchievements(achievementsWithProgress);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        showToast('Failed to load achievements', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id, showToast]);

  // Calculate achievement progress
  const calculateAchievementProgress = (achievement: Achievement, stats: UserStats): Achievement['progress'] => {
    switch (achievement.id) {
      case 'first_bet':
        return {
          current: stats.totalBets >= 1 ? 1 : 0,
          required: 1,
          completed: stats.totalBets >= 1,
        };
      case 'ten_bets':
        return {
          current: Math.min(stats.totalBets, 10),
          required: 10,
          completed: stats.totalBets >= 10,
        };
      case 'hundred_bets':
        return {
          current: Math.min(stats.totalBets, 100),
          required: 100,
          completed: stats.totalBets >= 100,
        };
      case 'perfect_prediction':
        return {
          current: stats.accuracy >= 100 ? 1 : 0,
          required: 1,
          completed: stats.accuracy >= 100,
        };
      case 'streak_master':
        return {
          current: Math.min(stats.bestStreak, 5),
          required: 5,
          completed: stats.bestStreak >= 5,
        };
      case 'whale_trader':
        return {
          current: Math.min(stats.totalVolume, 10000),
          required: 10000,
          completed: stats.totalVolume >= 10000,
        };
      case 'first_follow':
        return {
          current: stats.followingCount >= 1 ? 1 : 0,
          required: 1,
          completed: stats.followingCount >= 1,
        };
      case 'ten_followers':
        return {
          current: Math.min(stats.followersCount, 10),
          required: 10,
          completed: stats.followersCount >= 10,
        };
      case 'hundred_followers':
        return {
          current: Math.min(stats.followersCount, 100),
          required: 100,
          completed: stats.followersCount >= 100,
        };
      case 'social_connector':
        return {
          current: Math.min(stats.followingCount, 50),
          required: 50,
          completed: stats.followingCount >= 50,
        };
      case 'first_market':
        return {
          current: stats.totalMarkets >= 1 ? 1 : 0,
          required: 1,
          completed: stats.totalMarkets >= 1,
        };
      case 'popular_market':
        return {
          current: 0, // Would need market participant data
          required: 100,
          completed: false,
        };
      case 'ten_markets':
        return {
          current: Math.min(stats.totalMarkets, 10),
          required: 10,
          completed: stats.totalMarkets >= 10,
        };
      case 'early_adopter':
        return {
          current: user?.joinedAt ? 1 : 0,
          required: 1,
          completed: user?.joinedAt ? new Date(user.joinedAt) < new Date('2024-02-01') : false,
        };
      case 'verified_trader':
        return {
          current: user?.isVerified ? 1 : 0,
          required: 1,
          completed: !!user?.isVerified,
        };
      case 'perfect_week':
        return {
          current: 0,
          required: 1,
          completed: false,
        };
      default:
        return {
          current: 0,
          required: 1,
          completed: false,
        };
    }
  };

  // Calculate user level
  const userLevel = useMemo(() => {
    if (!userStats) return null;
    
    // Calculate experience based on achievements and stats
    const experience = 
      userStats.totalBets * 10 +
      userStats.totalMarkets * 50 +
      userStats.correctPredictions * 25 +
      userStats.followersCount * 5 +
      userStats.totalVolume / 100;
    
    return calculateUserLevel(experience);
  }, [userStats]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let filtered = userAchievements;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedRarity !== 'all') {
      filtered = filtered.filter(a => a.rarity === selectedRarity);
    }

    return filtered.sort((a, b) => {
      // Sort by completion status first, then by rarity, then by points
      if (a.progress.completed !== b.progress.completed) {
        return b.progress.completed ? 1 : -1;
      }
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return b.points - a.points;
    });
  }, [userAchievements, selectedCategory, selectedRarity]);

  // Stats for display
  const stats = useMemo(() => {
    if (!userStats) return null;
    
    return {
      totalAchievements: userAchievements.length,
      completedAchievements: userAchievements.filter(a => a.progress.completed).length,
      totalPoints: userAchievements.reduce((sum, a) => sum + (a.progress.completed ? a.points : 0), 0),
      completionRate: Math.round((userAchievements.filter(a => a.progress.completed).length / userAchievements.length) * 100),
    };
  }, [userAchievements]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white flex items-center justify-center">
        <LoadingSpinner text="Loading achievements..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white flex items-center justify-center">
        <div className="text-center">
          <Trophy size={48} className="text-[#86868b] dark:text-[#a1a1a6] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-[#86868b] dark:text-[#a1a1a6]">
            Please sign in to view your achievements and progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] shadow-sm">
        <button onClick={() => onBack?.()} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
          <Trophy size={20} className="text-[#86868b]" />
        </button>
        <div>
          <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f]">Achievements</h1>
          <p className="text-xs text-[#86868b]">
            {stats?.completionRate || 0}% Complete
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Level and Stats */}
        {userLevel && (
          <div className="bg-gradient-to-r from-[#ffd700] via-[#ffeb3b] to-[#fff9e6] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">
                  {userLevel.title}
                </h2>
                <p className="text-[#86868b]">
                  Level {userLevel.level} • {userLevel.experience} XP
                </p>
              </div>
              <UserLevelBadge level={userLevel} size="lg" showProgress={false} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {stats?.completedAchievements || 0}
                </div>
                <div className="text-xs text-[#86868b]">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ffd700]">
                  {stats?.totalPoints || 0}
                </div>
                <div className="text-xs text-[#86868b]">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {userStats?.totalBets || 0}
                </div>
                <div className="text-xs text-[#86868b]">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {Math.round(userStats?.accuracy || 0)}%
                </div>
                <div className="text-xs text-[#86868b]">Accuracy</div>
              </div>
            </div>

            {/* Progress Bar */}
            {userLevel.level < 10 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#1d1d1f]">Progress to Level {userLevel.level + 1}</span>
                  <span className="text-[#86868b]">
                    {userLevel.experience} / {userLevel.nextLevelExp} XP
                  </span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] transition-all duration-500"
                    style={{ width: `${userLevel.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', icon: Trophy },
              { value: 'trading', label: 'Trading', icon: Target },
              { value: 'social', label: 'Social', icon: Users },
              { value: 'creation', label: 'Creation', icon: Zap },
              { value: 'special', label: 'Special', icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200',
                  selectedCategory === value
                    ? 'bg-[#ffd700] text-[#1d1d1f] shadow-md'
                    : 'bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a]'
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'common', label: 'Common' },
              { value: 'rare', label: 'Rare' },
              { value: 'epic', label: 'Epic' },
              { value: 'legendary', label: 'Legendary' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedRarity(value as any)}
                className={cn(
                  'px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200',
                  selectedRarity === value
                    ? 'bg-[#ffd700] text-[#1d1d1f] shadow-md'
                    : 'bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a]'
                )}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              size="md"
              showProgress={true}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={48} className="text-[#86868b] dark:text-[#a1a1a6] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-2">
              No achievements found
            </h3>
            <p className="text-[#86868b] dark:text-[#a1a1a6]">
              Try adjusting your filters or complete more activities to unlock achievements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
