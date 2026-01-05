import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Target, Calendar, Award, Zap, Shield, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';
import { cn } from '../utils';
import { calculateUserLevel } from '../types/achievements';

interface UserStatsDashboardProps {
  className?: string;
}

const UserStatsDashboard: React.FC<UserStatsDashboardProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const userStats = await usersApi.getStats(user.id).catch(() => ({
          totalBets: 42,
          totalMarkets: 5,
          correctPredictions: 31,
          accuracy: 0.74,
          totalVolume: 12500,
          followersCount: user.followersCount || 0,
          followingCount: user.followingCount || 0,
          achievementsUnlocked: 8,
          currentStreak: 3,
          bestStreak: 7,
        }));
        
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated || !user) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <Shield size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600">Please sign in to view your statistics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate user level based on stats
  const experience = (stats?.totalBets || 0) * 10 + (stats?.totalMarkets || 0) * 50 + (stats?.correctPredictions || 0) * 25;
  const userLevel = calculateUserLevel(experience);

  const statCards = [
    {
      title: 'Total Bets',
      value: stats?.totalBets || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Win Rate',
      value: `${Math.round((stats?.accuracy || 0) * 100)}%`,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Total Volume',
      value: `$${((stats?.totalVolume || 0) / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+23%',
      changeType: 'positive',
    },
    {
      title: 'Current Streak',
      value: stats?.currentStreak || 0,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+2',
      changeType: 'positive',
    },
  ];

  const achievements = [
    { name: 'First Bet', icon: Target, unlocked: true },
    { name: 'Trading Enthusiast', icon: Trophy, unlocked: true },
    { name: 'Perfect Prediction', icon: Star, unlocked: false },
    { name: 'Streak Master', icon: Zap, unlocked: true },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* User Level */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">{userLevel.title}</h3>
            <p className="text-yellow-100">Level {userLevel.level}</p>
          </div>
          <div className="text-4xl">{userLevel.icon}</div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Level {userLevel.level + 1}</span>
            <span>{Math.round(userLevel.progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${userLevel.progress}%` }}
            />
          </div>
        </div>
        
        <div className="text-sm text-yellow-100">
          {userLevel.experience} / {userLevel.nextLevelExp} XP
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bgColor)}>
                <stat.icon size={16} className={stat.color} />
              </div>
              {stat.change && (
                <span className={cn(
                  'text-xs font-medium',
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={16} />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Won bet on "Will BTC reach $100k?"</span>
            <span className="text-gray-400 ml-auto">2h ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Created new market</span>
            <span className="text-gray-400 ml-auto">5h ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Unlocked "Trading Enthusiast"</span>
            <span className="text-gray-400 ml-auto">1d ago</span>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award size={16} />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div key={index} className={cn(
              'flex items-center gap-2 p-2 rounded-lg',
              achievement.unlocked ? 'bg-green-50' : 'bg-gray-50'
            )}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center',
                achievement.unlocked ? 'bg-green-500' : 'bg-gray-300'
              )}>
                <achievement.icon size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium truncate',
                  achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {achievement.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users size={16} />
          Social Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.followersCount || user.followersCount || 0}
            </div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.followingCount || user.followingCount || 0}
            </div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsDashboard;
