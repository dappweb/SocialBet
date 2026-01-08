import React, { useState, useEffect, memo } from 'react';
import { Crown, Users, Award, TrendingUp, Target, Calendar, ExternalLink, CheckCircle, Star, Trophy, Gift, Zap } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  type Ambassador,
  type AmbassadorTask,
  type AmbassadorReward,
  type Achievement,
  getAmbassadorProfile,
  getAmbassadorTasks,
  completeAmbassadorTask,
  getAmbassadorRewards,
  applyForAmbassador,
  getAmbassadorLeaderboard,
  getAmbassadorStats,
  checkAmbassadorEligibility,
  updateAmbassadorTier,
  getAvailableAchievements,
  TIER_CONFIGS
} from '../services/ambassadorService';

const AmbassadorProgram: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'tasks' | 'rewards' | 'leaderboard' | 'apply'>('profile');
  const [profile, setProfile] = useState<Ambassador | null>(null);
  const [tasks, setTasks] = useState<AmbassadorTask[]>([]);
  const [rewards, setRewards] = useState<AmbassadorReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<Ambassador[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    socialLinks: [] as any[],
    experience: '',
    motivation: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAmbassadorData();
    }
  }, [isAuthenticated, user]);

  const loadAmbassadorData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const [profileData, tasksData, rewardsData, leaderboardData, statsData, achievementsData] = await Promise.all([
          getAmbassadorProfile(user.id),
          getAmbassadorTasks(user.id),
          getAmbassadorRewards(user.id),
          getAmbassadorLeaderboard(),
          getAmbassadorStats(),
          getAvailableAchievements(),
        ]);

        setProfile(profileData);
        setTasks(tasksData);
        setRewards(rewardsData);
        setLeaderboard(leaderboardData);
        setStats(statsData);
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Failed to load ambassador data:', error);
      showToast('Failed to load ambassador data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!profile) return;

    try {
      setActionLoading('task');
      const result = await completeAmbassadorTask(profile.id, taskId);
      
      if (result.success) {
        showToast(result.message, 'success');
        await loadAmbassadorData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      showToast('Failed to complete task', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApply = async () => {
    if (!user) return;

    try {
      setActionLoading('apply');
      const result = await applyForAmbassador(user.id, applicationForm);
      
      if (result.success) {
        showToast(result.message, 'success');
        setApplicationForm({
          name: '',
          email: '',
          socialLinks: [],
          experience: '',
          motivation: '',
        });
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      showToast('Failed to submit application', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return '💎';
      case 'platinum':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      default:
        return '🥉';
    }
  };

  const getTierColor = (tier: string) => {
    const config = TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS];
    return config?.color || '#cd7f32';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return '🐦';
      case 'youtube':
        return '📺';
      case 'telegram':
        return '✈️';
      case 'discord':
        return '💬';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '🌐';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
          <Crown size={48} className="mx-auto mb-4 text-[#ffd700]" />
          <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
            Ambassador Program
          </h2>
          <p className="text-[#86868b] mb-6">
            Sign in to join our ambassador program and earn rewards
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl"></div>
          <div className="h-64 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ambassador Program</h1>
            <p className="text-white/90">
              Become a KOL Market ambassador and earn rewards while growing the community
            </p>
          </div>
          <Crown size={48} className="text-white/80" />
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalAmbassadors || 0}</div>
            <div className="text-sm text-white/80">Total Ambassadors</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.activeAmbassadors || 0}</div>
            <div className="text-sm text-white/80">Active Ambassadors</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">${(stats?.totalPaidOut || 0).toLocaleString()}</div>
            <div className="text-sm text-white/80">Total Paid Out</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">${(stats?.avgMonthlyEarnings || 0).toLocaleString()}</div>
            <div className="text-sm text-white/80">Avg Monthly Earnings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'profile'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Crown size={20} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'tasks'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Target size={20} />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'rewards'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Gift size={20} />
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'leaderboard'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Trophy size={20} />
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {profile ? (
              <>
                {/* Ambassador Profile */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getTierIcon(profile.tier)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white">
                          {profile.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: getTierColor(profile.tier) }}
                          >
                            {profile.tier.toUpperCase()} TIER
                          </span>
                          <span className="text-sm text-[#86868b]">
                            Rank #{profile.rank}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#ffd700]">
                        ${profile.totalEarned.toLocaleString()}
                      </div>
                      <div className="text-sm text-[#86868b]">Total Earned</div>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Total Referrals</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {profile.totalReferrals}
                      </div>
                    </div>
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Active Referrals</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {profile.activeReferrals}
                      </div>
                    </div>
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Monthly Bonus</div>
                      <div className="font-semibold text-[#ffd700]">
                        ${profile.monthlyBonus.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Joined</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {new Date(profile.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-3">Social Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                          <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                          <div className="flex-1">
                            <div className="font-medium text-[#1d1d1f] dark:text-white capitalize">
                              {link.platform}
                            </div>
                            <div className="text-sm text-[#86868b]">
                              {link.followers.toLocaleString()} followers
                              {link.verified && ' ✓'}
                            </div>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white dark:bg-[#0a0a0a] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-3">Achievements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {profile.achievements.map((achievement, index) => (
                        <div key={index} className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{achievement.icon}</span>
                            <div className="font-medium text-[#1d1d1f] dark:text-white text-sm">
                              {achievement.name}
                            </div>
                          </div>
                          <div className="text-xs text-[#86868b]">
                            {achievement.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Not an ambassador yet */
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Crown size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  Not an Ambassador Yet
                </h3>
                <p className="text-[#86868b] mb-6">
                  Apply to become a KOL Market ambassador and start earning rewards!
                </p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="px-6 py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Target size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Available Tasks
                </h3>
                <p className="text-[#86868b]">
                  Check back later for new ambassador tasks!
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-[#86868b]">
                        {task.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ffd700] text-lg">
                        {task.points}
                      </div>
                      <div className="text-sm text-[#86868b]">points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[#86868b]">
                      <span className="capitalize">{task.type.replace('_', ' ')}</span>
                      {task.bonusMultiplier > 1 && (
                        <span className="px-2 py-1 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">
                          {task.bonusMultiplier}x bonus
                        </span>
                      )}
                      {task.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <span className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] rounded-lg text-sm font-medium">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={actionLoading === 'task'}
                          className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {actionLoading === 'task' ? 'Completing...' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Gift size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Rewards Yet
                </h3>
                <p className="text-[#86868b]">
                  Complete tasks and refer users to earn rewards!
                </p>
              </div>
            ) : (
              rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white capitalize">
                        {reward.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-[#86868b]">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#86868b]">
                        <span>Claimed {new Date(reward.timestamp).toLocaleDateString()}</span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          reward.status === 'paid' 
                            ? "bg-[#34c759]/10 text-[#34c759]"
                            : "bg-[#ff9500]/10 text-[#ff9500]"
                        )}>
                          {reward.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ffd700] text-lg">
                        ${reward.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Trophy size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Ambassadors Yet
                </h3>
                <p className="text-[#86868b]">
                  Be the first to join our ambassador program!
                </p>
              </div>
            ) : (
              leaderboard.map((ambassador, index) => (
                <div
                  key={ambassador.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-[#86868b] w-8">
                        #{index + 1}
                      </div>
                      <div className="text-3xl">{getTierIcon(ambassador.tier)}</div>
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                          {ambassador.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-[#86868b]">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getTierColor(ambassador.tier) }}
                          >
                            {ambassador.tier.toUpperCase()}
                          </span>
                          <span>{ambassador.totalReferrals} referrals</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ffd700] text-lg">
                        ${ambassador.totalEarned.toLocaleString()}
                      </div>
                      <div className="text-sm text-[#86868b]">Total Earned</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'apply' && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-6">
              Apply for Ambassador Program
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={applicationForm.name}
                    onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                    className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                  Experience
                </label>
                <textarea
                  value={applicationForm.experience}
                  onChange={(e) => setApplicationForm({...applicationForm, experience: e.target.value})}
                  className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                  rows={3}
                  placeholder="Describe your experience with crypto, DeFi, or content creation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                  Motivation
                </label>
                <textarea
                  value={applicationForm.motivation}
                  onChange={(e) => setApplicationForm({...applicationForm, motivation: e.target.value})}
                  className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                  rows={3}
                  placeholder="Why do you want to become a KOL Market ambassador?"
                />
              </div>
              
              <button
                onClick={handleApply}
                disabled={actionLoading === 'apply' || !applicationForm.name || !applicationForm.email}
                className="w-full py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === 'apply' ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AmbassadorProgram.displayName = 'AmbassadorProgram';

export default AmbassadorProgram;
