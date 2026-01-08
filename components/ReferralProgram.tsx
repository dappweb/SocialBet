import React, { useState, useEffect, memo } from 'react';
import { Users, Gift, TrendingUp, Copy, Check, Crown, Star, ExternalLink, Share2, Trophy } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  ReferralStats, 
  ReferralRecord, 
  ReferralReward,
  getUserReferralCode,
  getReferralStats,
  getReferralList,
  getPendingRewards,
  claimRewards,
  copyReferralLink,
  generateReferralLink,
  getTierBenefits
} from '../services/referralService';

const ReferralProgram: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'rewards'>('overview');
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadReferralData();
    }
  }, [isAuthenticated, user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const [codeData, statsData, referralsData, rewardsData] = await Promise.all([
          getUserReferralCode(user.id, user.name),
          getReferralStats(user.id),
          getReferralList(user.id),
          getPendingRewards(user.id),
        ]);

        setReferralCode(codeData.code);
        setStats(statsData);
        setReferrals(referralsData);
        setRewards(rewardsData);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      showToast('Failed to load referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralCode) return;

    const success = await copyReferralLink(referralCode);
    if (success) {
      setCopied(true);
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleClaimRewards = async (rewardIds: string[]) => {
    if (!user) return;

    try {
      setClaiming(true);
      const result = await claimRewards(user.id, rewardIds);
      
      if (result.success) {
        showToast(result.message, 'success');
        // Reload data
        await loadReferralData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      showToast('Failed to claim rewards', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const getTierIcon = (tier: 'bronze' | 'silver' | 'gold') => {
    switch (tier) {
      case 'gold':
        return <Crown className="text-[#ffd700]" size={24} />;
      case 'silver':
        return <Star className="text-[#c0c0c0]" size={24} />;
      default:
        return <Trophy className="text-[#cd7f32]" size={24} />;
    }
  };

  const getTierColor = (tier: 'bronze' | 'silver' | 'gold') => {
    switch (tier) {
      case 'gold':
        return 'text-[#ffd700] border-[#ffd700]';
      case 'silver':
        return 'text-[#c0c0c0] border-[#c0c0c0]';
      default:
        return 'text-[#cd7f32] border-[#cd7f32]';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-[#ffd700]" />
          <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
            Join Referral Program
          </h2>
          <p className="text-[#86868b] mb-6">
            Sign in to start earning rewards by referring friends to KOL Market
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

  const tierBenefits = stats ? getTierBenefits(stats.tier) : null;
  const referralLink = referralCode ? generateReferralLink(referralCode) : '';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffd700] to-[#ffb700] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
            <p className="text-white/90">
              Earn SOUL tokens by inviting friends to join KOL Market
            </p>
          </div>
          {stats && getTierIcon(stats.tier)}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <div className="text-sm text-white/80">Total Referrals</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalEarnings.toFixed(2) || '0'}</div>
            <div className="text-sm text-white/80">Total Earnings (SOUL)</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.pendingRewards.toFixed(2) || '0'}</div>
            <div className="text-sm text-white/80">Pending Rewards</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold capitalize">{stats?.tier || 'bronze'}</div>
            <div className="text-sm text-white/80">Current Tier</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
          Your Referral Code
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl font-mono text-lg font-bold text-[#1d1d1f] dark:text-white">
              {referralCode}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-6 py-4 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          
          <div className="p-4 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
            <div className="text-sm text-[#1d1d1f] dark:text-white">
              <strong>Share this link:</strong> {referralLink}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'overview'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <TrendingUp size={20} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'referrals'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Users size={20} />
          Referrals
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
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Tier Progress */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Tier Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {stats && getTierIcon(stats.tier)}
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white capitalize">
                        {stats?.tier} Tier
                      </div>
                      <div className="text-sm text-[#86868b]">
                        {stats?.totalReferrals || 0} / {stats?.nextTierThreshold || 10} referrals
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#ffd700]">
                    {stats?.tierProgress.toFixed(0)}%
                  </div>
                </div>
                
                <div className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#ffd700] to-[#ffb700] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.tierProgress || 0}%` }}
                  />
                </div>
                
                {tierBenefits && (
                  <div className="mt-6 space-y-3">
                    <div className="font-semibold text-[#1d1d1f] dark:text-white">
                      Tier Benefits
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                        <div className="text-sm text-[#86868b]">Fee Share Bonus</div>
                        <div className="font-semibold text-[#1d1d1f] dark:text-white">
                          +{(tierBenefits.feeShareBonus * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                        <div className="text-sm text-[#86868b]">Monthly Bonus</div>
                        <div className="font-semibold text-[#1d1d1f] dark:text-white">
                          {tierBenefits.monthlyBonus} SOUL
                        </div>
                      </div>
                    </div>
                    {tierBenefits.exclusiveFeatures.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-[#86868b] mb-2">Exclusive Features</div>
                        <div className="flex flex-wrap gap-2">
                          {tierBenefits.exclusiveFeatures.map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#fff9e6] dark:bg-[#332d1a] text-xs font-medium text-[#1d1d1f] dark:text-white rounded-full border border-[#ffd700]/20"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reward Structure */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Reward Structure
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">Signup Bonus</span>
                    <span className="font-bold text-[#ffd700]">100 SOUL</span>
                  </div>
                  <div className="text-sm text-[#86868b]">
                    Both you and your friend receive 100 SOUL when they sign up with your code
                  </div>
                </div>
                
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">Trading Fee Share</span>
                    <span className="font-bold text-[#ffd700]">5%</span>
                  </div>
                  <div className="text-sm text-[#86868b]">
                    Earn 5% of your direct referrals' trading fees for 12 months
                  </div>
                </div>
                
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">Milestone Rewards</span>
                    <span className="font-bold text-[#ffd700]">1,000-5,000 SOUL</span>
                  </div>
                  <div className="text-sm text-[#86868b]">
                    Get 1,000 SOUL at 10 referrals and 5,000 SOUL at 50 referrals
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {referrals.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Users size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Referrals Yet
                </h3>
                <p className="text-[#86868b]">
                  Start sharing your referral code to earn rewards!
                </p>
              </div>
            ) : (
              referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#2c2c2e]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] font-bold">
                        {referral.refereeName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] dark:text-white">
                          {referral.refereeName}
                        </div>
                        <div className="text-sm text-[#86868b]">
                          Joined {new Date(referral.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {referral.earnings.toFixed(2)} SOUL
                      </div>
                      <div className="text-sm text-[#86868b]">
                        Level {referral.level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      referral.status === 'active' 
                        ? "bg-[#34c759]/10 text-[#34c759]"
                        : "bg-[#ff9500]/10 text-[#ff9500]"
                    )}>
                      {referral.status}
                    </span>
                    <span className="text-[#86868b]">
                      Volume: {referral.totalVolume.toLocaleString()} SOUL
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Pending Rewards */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">
                  Pending Rewards
                </h3>
                {rewards.length > 0 && (
                  <button
                    onClick={() => handleClaimRewards(rewards.map(r => r.id))}
                    disabled={claiming}
                    className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {claiming ? 'Claiming...' : 'Claim All'}
                  </button>
                )}
              </div>
              
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <Gift size={48} className="mx-auto mb-4 text-[#86868b]" />
                  <p className="text-[#86868b]">No pending rewards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-white capitalize">
                          {reward.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-[#86868b]">
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-bold text-[#ffd700]">
                        {reward.amount.toFixed(2)} SOUL
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ReferralProgram.displayName = 'ReferralProgram';

export default ReferralProgram;
