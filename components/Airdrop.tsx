import React, { useState, useEffect, memo } from 'react';
import { Gift, Calendar, Users, CheckCircle, Clock, TrendingUp, Award, Target, Share2, Copy, ExternalLink, Star, Trophy, Check } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  type AirdropCampaign,
  type UserAirdropStatus,
  type AirdropTask,
  getAirdropCampaigns,
  getUserAirdropStatus,
  getUserAirdropTasks,
  completeTask,
  claimAirdropReward,
  getUserAirdropHistory,
  getAirdropStats,
  checkTaskEligibility,
  copyAirdropLink,
  generateAirdropLink
} from '../services/airdropService';

const Airdrop: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'tasks' | 'history' | 'stats'>('campaigns');
  const [campaigns, setCampaigns] = useState<AirdropCampaign[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserAirdropStatus>>(new Map());
  const [tasks, setTasks] = useState<AirdropTask[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<AirdropCampaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAirdropData();
    }
  }, [isAuthenticated, user]);

  const loadAirdropData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const [campaignsData, tasksData, historyData, statsData] = await Promise.all([
          getAirdropCampaigns(),
          getUserAirdropTasks(user.id),
          getUserAirdropHistory(user.id),
          getAirdropStats(user.id),
        ]);

        setCampaigns(campaignsData);
        setTasks(tasksData);
        setHistory(historyData);
        setStats(statsData);

        // Load user status for each campaign
        const statuses = new Map<string, UserAirdropStatus>();
        for (const campaign of campaignsData) {
          const status = await getUserAirdropStatus(campaign.id, user.id);
          if (status) {
            statuses.set(campaign.id, status);
          }
        }
        setUserStatuses(statuses);
      }
    } catch (error) {
      console.error('Failed to load airdrop data:', error);
      showToast('Failed to load airdrop data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const result = await completeTask(user.id, taskId);
      
      if (result.success) {
        showToast(result.message, 'success');
        
        // Reload tasks
        const updatedTasks = await getUserAirdropTasks(user.id);
        setTasks(updatedTasks);
        
        // Reload stats
        const updatedStats = await getAirdropStats(user.id);
        setStats(updatedStats);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      showToast('Failed to complete task', 'error');
    }
  };

  const handleClaimReward = async (campaignId: string) => {
    if (!user) return;

    try {
      setClaiming(campaignId);
      const result = await claimAirdropReward(campaignId, user.id);
      
      if (result.success) {
        showToast(result.message, 'success');
        
        // Reload data
        await loadAirdropData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      showToast('Failed to claim reward', 'error');
    } finally {
      setClaiming(null);
    }
  };

  const handleCopyLink = async (campaignId: string) => {
    const success = await copyAirdropLink(campaignId);
    if (success) {
      setCopied(true);
      showToast('Airdrop link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#34c759] bg-[#34c759]/10';
      case 'upcoming':
        return 'text-[#007AFF] bg-[#007AFF]/10';
      case 'ended':
        return 'text-[#ff9500] bg-[#ff9500]/10';
      case 'expired':
        return 'text-[#86868b] bg-[#86868b]/10';
      default:
        return 'text-[#86868b] bg-[#86868b]/10';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="text-[#007AFF]" size={20} />;
      case 'weekly':
        return <Clock className="text-[#ff9500]" size={20} />;
      default:
        return <Target className="text-[#34c759]" size={20} />;
    }
  };

  const getProgressPercentage = (campaign: AirdropCampaign, userStatus?: UserAirdropStatus) => {
    if (!userStatus) return 0;
    return (userStatus.completedRequirements.length / campaign.requirements.length) * 100;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
          <Gift size={48} className="mx-auto mb-4 text-[#ffd700]" />
          <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
            Airdrop Campaigns
          </h2>
          <p className="text-[#86868b] mb-6">
            Sign in to participate in airdrop campaigns and earn SOUL tokens
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
      <div className="bg-gradient-to-r from-[#34c759] to-[#30a14e] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Airdrop Campaigns</h1>
            <p className="text-white/90">
              Complete tasks and earn SOUL tokens through airdrop campaigns
            </p>
          </div>
          <Gift size={48} className="text-white/80" />
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalClaimed || 0}</div>
            <div className="text-sm text-white/80">Total Claimed (SOUL)</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalPoints || 0}</div>
            <div className="text-sm text-white/80">Total Points</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
            <div className="text-sm text-white/80">Completed Tasks</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <div className="text-sm text-white/80">Active Campaigns</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'campaigns'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Gift size={20} />
          Campaigns
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
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'history'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <CheckCircle size={20} />
          History
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'stats'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Trophy size={20} />
          Stats
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Gift size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Active Campaigns
                </h3>
                <p className="text-[#86868b]">
                  Check back later for new airdrop campaigns!
                </p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const userStatus = userStatuses.get(campaign.id);
                const progress = getProgressPercentage(campaign, userStatus);
                
                return (
                  <div
                    key={campaign.id}
                    className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {campaign.imageUrl && (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
                            {campaign.name}
                          </h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            getStatusColor(campaign.status)
                          )}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#86868b] mb-3">
                          {campaign.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[#86868b]">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {campaign.claimedCount}/{campaign.totalRecipients}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Gift size={14} />
                            {campaign.totalAmount} {campaign.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {userStatus && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#86868b]">
                            Progress: {userStatus.completedRequirements.length}/{campaign.requirements.length}
                          </span>
                          <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#34c759] to-[#30a14e] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-2">Requirements</h4>
                      <div className="space-y-2">
                        {campaign.requirements.slice(0, 3).map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2",
                              userStatus?.completedRequirements.includes(req.type)
                                ? "bg-[#34c759] border-[#34c759]"
                                : "border-[#e5e5ea] dark:border-[#2c2c2e]"
                            )}>
                              {userStatus?.completedRequirements.includes(req.type) && (
                                <CheckCircle size={12} className="text-white" />
                              )}
                            </div>
                            <span className={cn(
                              userStatus?.completedRequirements.includes(req.type)
                                ? "text-[#1d1d1f] dark:text-white"
                                : "text-[#86868b]"
                            )}>
                              {req.description}
                            </span>
                          </div>
                        ))}
                        {campaign.requirements.length > 3 && (
                          <div className="text-sm text-[#86868b]">
                            +{campaign.requirements.length - 3} more requirements
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {campaign.rewards.map((reward, index) => (
                          <div
                            key={index}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              userStatus && userStatus.completedRequirements.length >= reward.minRequirements
                                ? "bg-[#ffd700]/20 text-[#ffd700]"
                                : "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b]"
                            )}
                          >
                            Tier {reward.tier}: {reward.amount} {campaign.currency}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(campaign.id)}
                          className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        {userStatus?.claimStatus === 'eligible' && (
                          <button
                            onClick={() => handleClaimReward(campaign.id)}
                            disabled={claiming === campaign.id}
                            className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {claiming === campaign.id ? 'Claiming...' : 'Claim Reward'}
                          </button>
                        )}
                        {userStatus?.claimStatus === 'claimed' && (
                          <span className="px-4 py-2 bg-[#34c759]/10 text-[#34c759] rounded-lg font-medium">
                            Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
                  Check back later for new tasks to complete!
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTaskIcon(task.type)}
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-sm text-[#86868b]">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#86868b]">
                          <span className="flex items-center gap-1">
                            <Star size={14} />
                            {task.points} points
                          </span>
                          <span className="capitalize">{task.type}</span>
                          {task.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Expires {new Date(task.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <span className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] rounded-lg text-sm font-medium">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {task.actionUrl && (
                        <a
                          href={task.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <CheckCircle size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Claims Yet
                </h3>
                <p className="text-[#86868b]">
                  Complete campaign requirements to claim rewards!
                </p>
              </div>
            ) : (
              history.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                        {item.campaign.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-[#86868b]">
                        <span>Claimed {new Date(item.claimedAt).toLocaleDateString()}</span>
                        <span>Tier {item.tier}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ffd700] text-lg">
                        {item.amount} {item.campaign.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-6">
              Your Airdrop Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Total SOUL Claimed</div>
                  <div className="text-2xl font-bold text-[#ffd700]">
                    {stats?.totalClaimed || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Total Points Earned</div>
                  <div className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
                    {stats?.totalPoints || 0}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Tasks Completed</div>
                  <div className="text-2xl font-bold text-[#34c759]">
                    {stats?.completedTasks || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Global Rank</div>
                  <div className="text-2xl font-bold text-[#007AFF]">
                    #{stats?.rank || 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievement Badges */}
            <div className="mt-6">
              <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-3">Achievements</h4>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-2 bg-[#ffd700]/20 text-[#ffd700] rounded-lg text-sm font-medium">
                  🎯 First Claim
                </div>
                <div className="px-3 py-2 bg-[#34c759]/20 text-[#34c759] rounded-lg text-sm font-medium">
                  ⭐ Task Master
                </div>
                <div className="px-3 py-2 bg-[#007AFF]/20 text-[#007AFF] rounded-lg text-sm font-medium">
                  🚀 Early Bird
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Airdrop.displayName = 'Airdrop';

export default Airdrop;
