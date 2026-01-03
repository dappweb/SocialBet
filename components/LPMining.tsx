import React, { useState, useEffect, memo } from 'react';
import { TrendingUp, DollarSign, Plus, Minus, Award, Clock, BarChart3, ExternalLink, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  type LPPool,
  type LPPosition,
  type LPReward,
  getLPPools,
  getUserLPPositions,
  addLiquidity,
  removeLiquidity,
  claimLPRewards,
  getLPMiningStats,
  getLPRewardHistory,
  calculateEstimatedRewards,
  getPoolMetrics,
  checkTokenBalance,
  getLPMiningCampaigns,
  LP_MINING_CONFIG
} from '../services/lpMiningService';

const LPMining: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'pools' | 'positions' | 'rewards' | 'campaigns'>('pools');
  const [pools, setPools] = useState<LPPool[]>([]);
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [rewards, setRewards] = useState<LPReward[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedPool, setSelectedPool] = useState<LPPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [addLiquidityForm, setAddLiquidityForm] = useState({
    tokenAAmount: '',
    tokenBAmount: '',
  });
  const [removeLiquidityForm, setRemoveLiquidityForm] = useState({
    positionId: '',
    percentage: 50,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadLPMiningData();
    }
  }, [isAuthenticated, user]);

  const loadLPMiningData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const [poolsData, positionsData, rewardsData, statsData, campaignsData] = await Promise.all([
          getLPPools(user.id),
          getUserLPPositions(user.id),
          getLPRewardHistory(user.id),
          getLPMiningStats(user.id),
          getLPMiningCampaigns(),
        ]);

        setPools(poolsData);
        setPositions(positionsData);
        setRewards(rewardsData);
        setStats(statsData);
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error('Failed to load LP mining data:', error);
      showToast('Failed to load LP mining data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async (poolId: string) => {
    if (!user) return;

    try {
      setActionLoading('add');
      
      const tokenAAmount = Number(addLiquidityForm.tokenAAmount);
      const tokenBAmount = Number(addLiquidityForm.tokenBAmount);
      
      if (tokenAAmount < LP_MINING_CONFIG.MIN_DEPOSIT_AMOUNT || tokenBAmount < LP_MINING_CONFIG.MIN_DEPOSIT_AMOUNT) {
        showToast(`Minimum deposit amount is ${LP_MINING_CONFIG.MIN_DEPOSIT_AMOUNT}`, 'error');
        return;
      }

      const result = await addLiquidity(user.id, poolId, tokenAAmount, tokenBAmount);
      
      if (result.success) {
        showToast(result.message, 'success');
        setAddLiquidityForm({ tokenAAmount: '', tokenBAmount: '' });
        await loadLPMiningData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      showToast('Failed to add liquidity', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!user) return;

    try {
      setActionLoading('remove');
      
      const result = await removeLiquidity(
        user.id,
        removeLiquidityForm.positionId,
        removeLiquidityForm.percentage
      );
      
      if (result.success) {
        showToast(result.message, 'success');
        setRemoveLiquidityForm({ positionId: '', percentage: 50 });
        await loadLPMiningData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      showToast('Failed to remove liquidity', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimRewards = async (positionIds: string[]) => {
    if (!user) return;

    try {
      setActionLoading('claim');
      const result = await claimLPRewards(user.id, positionIds);
      
      if (result.success) {
        showToast(result.message, 'success');
        await loadLPMiningData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      showToast('Failed to claim rewards', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'uniswap':
        return '🦄';
      case 'raydium':
        return '🌊';
      case 'pancakeswap':
        return '🥞';
      default:
        return '💱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'uniswap':
        return 'text-[#FF007A]';
      case 'raydium':
        return 'text-[#00D4FF]';
      case 'pancakeswap':
        return 'text-[#633001]';
      default:
        return 'text-[#86868b]';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-[#ffd700]" />
          <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
            Liquidity Mining
          </h2>
          <p className="text-[#86868b] mb-6">
            Sign in to provide liquidity and earn SOUL token rewards
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
      <div className="bg-gradient-to-r from-[#00D4FF] to-[#0099CC] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Liquidity Mining</h1>
            <p className="text-white/90">
              Provide liquidity to DEX pools and earn SOUL token rewards
            </p>
          </div>
          <TrendingUp size={48} className="text-white/80" />
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalDeposited || 0}</div>
            <div className="text-sm text-white/80">Total Deposited</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalEarned || 0}</div>
            <div className="text-sm text-white/80">SOUL Earned</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.activePositions || 0}</div>
            <div className="text-sm text-white/80">Active Positions</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.averageAPR || 0}%</div>
            <div className="text-sm text-white/80">Average APR</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <button
          onClick={() => setActiveTab('pools')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'pools'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <BarChart3 size={20} />
          Pools
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'positions'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <DollarSign size={20} />
          Positions
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
          <Award size={20} />
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'campaigns'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <TrendingUp size={20} />
          Campaigns
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'pools' && (
          <div className="space-y-4">
            {pools.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Available Pools
                </h3>
                <p className="text-[#86868b]">
                  Check back later for new liquidity pools!
                </p>
              </div>
            ) : (
              pools.map((pool) => (
                <div
                  key={pool.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getPlatformIcon(pool.platform)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
                          {pool.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#86868b]">
                          <span className={getPlatformColor(pool.platform)}>
                            {pool.platform.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>Fee: {pool.feeTier / 10000}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#ffd700]">
                        {pool.apr}%
                      </div>
                      <div className="text-sm text-[#86868b]">APR</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Total Liquidity</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        ${pool.totalLiquidity.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Daily Rewards</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {pool.rewardsPerDay} SOUL
                      </div>
                    </div>
                    <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                      <div className="text-sm text-[#86868b]">Your Share</div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">
                        {pool.userShare.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Liquidity Form */}
                  {pool.userLiquidity > 0 && (
                    <div className="mb-4 p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-lg border border-[#ffd700]/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-[#1d1d1f] dark:text-white">
                            Your Position
                          </div>
                          <div className="text-xs text-[#86868b]">
                            ${pool.userLiquidity.toLocaleString()} • Pending: {pool.pendingRewards.toFixed(2)} SOUL
                          </div>
                        </div>
                        <button
                          onClick={() => handleClaimRewards([pool.id])}
                          disabled={actionLoading === 'claim' || pool.pendingRewards < LP_MINING_CONFIG.MIN_REWARD_CLAIM}
                          className="px-3 py-1 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Claim Rewards
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder={`${pool.tokenASymbol} Amount`}
                        value={addLiquidityForm.tokenAAmount}
                        onChange={(e) => setAddLiquidityForm({...addLiquidityForm, tokenAAmount: e.target.value})}
                        className="w-full p-3 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                        min={LP_MINING_CONFIG.MIN_DEPOSIT_AMOUNT}
                      />
                      <input
                        type="number"
                        placeholder={`${pool.tokenBSymbol} Amount`}
                        value={addLiquidityForm.tokenBAmount}
                        onChange={(e) => setAddLiquidityForm({...addLiquidityForm, tokenBAmount: e.target.value})}
                        className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                        min={LP_MINING_CONFIG.MIN_DEPOSIT_AMOUNT}
                      />
                    </div>
                    <button
                      onClick={() => handleAddLiquidity(pool.id)}
                      disabled={actionLoading === 'add' || !addLiquidityForm.tokenAAmount || !addLiquidityForm.tokenBAmount}
                      className="w-full py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'add' ? 'Adding...' : 'Add Liquidity'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-4">
            {positions.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <DollarSign size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Active Positions
                </h3>
                <p className="text-[#86868b]">
                  Add liquidity to pools to start earning rewards!
                </p>
              </div>
            ) : (
              <>
                {positions.map((position) => {
                  const pool = pools.find(p => p.id === position.poolId);
                  return (
                    <div
                      key={position.id}
                      className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{pool ? getPlatformIcon(pool.platform) : '💱'}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
                              {pool?.name || 'Unknown Pool'}
                            </h3>
                            <div className="text-sm text-[#86868b]">
                              Deposited {new Date(position.depositedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#ffd700]">
                            ${position.liquidityAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-[#86868b]">Position Value</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                          <div className="text-sm text-[#86868b]">Token A</div>
                          <div className="font-semibold text-[#1d1d1f] dark:text-white">
                            {position.tokenAAmount} {pool?.tokenASymbol}
                          </div>
                        </div>
                        <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                          <div className="text-sm text-[#86868b]">Token B</div>
                          <div className="font-semibold text-[#1d1d1f] dark:text-white">
                            {position.tokenBAmount} {pool?.tokenBSymbol}
                          </div>
                        </div>
                        <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                          <div className="text-sm text-[#86868b]">Total Earned</div>
                          <div className="font-semibold text-[#ffd700]">
                            {position.rewardsEarned.toFixed(2)} SOUL
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <select
                            value={removeLiquidityForm.positionId === position.id ? removeLiquidityForm.percentage : 50}
                            onChange={(e) => setRemoveLiquidityForm({positionId: position.id, percentage: Number(e.target.value)})}
                            className="px-3 py-2 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                          >
                            <option value={25}>25%</option>
                            <option value={50}>50%</option>
                            <option value={75}>75%</option>
                            <option value={100}>100%</option>
                          </select>
                          <button
                            onClick={handleRemoveLiquidity}
                            disabled={actionLoading === 'remove' || removeLiquidityForm.positionId !== position.id}
                            className="px-4 py-2 bg-[#ff3b30] hover:bg-[#ff6b6b] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === 'remove' ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                        <button
                          onClick={() => handleClaimRewards([position.id])}
                          disabled={actionLoading === 'claim'}
                          className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg font-medium transition-colors"
                        >
                          Claim Rewards
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Claim All Button */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                        Claim All Rewards
                      </h4>
                      <p className="text-sm text-[#86868b]">
                        Claim rewards from all active positions
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimRewards(positions.map(p => p.id))}
                      disabled={actionLoading === 'claim'}
                      className="px-6 py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'claim' ? 'Claiming...' : 'Claim All'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <Award size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Rewards Yet
                </h3>
                <p className="text-[#86868b]">
                  Add liquidity to pools to start earning rewards!
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
                        {reward.type} Reward
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-[#86868b]">
                        <span>Claimed {new Date(reward.timestamp).toLocaleDateString()}</span>
                        {reward.multiplier > 1 && (
                          <span className="px-2 py-1 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">
                            {reward.multiplier}x Multiplier
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ffd700] text-lg">
                        {reward.amount.toFixed(2)} SOUL
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-[#86868b]" />
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
                  No Active Campaigns
                </h3>
                <p className="text-[#86868b]">
                  Check back later for new mining campaigns!
                </p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-[#86868b] mb-2">
                        {campaign.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#86868b]">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">
                          {campaign.bonusMultiplier}x Rewards
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {campaign.isActive ? (
                        <span className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] rounded-full text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#86868b]/10 text-[#86868b] rounded-full text-sm font-medium">
                          Ended
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <div className="text-sm text-[#86868b] mb-2">Eligible Pools:</div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.eligiblePools.map((poolId: string) => {
                        const pool = pools.find(p => p.id === poolId);
                        return pool ? (
                          <span
                            key={poolId}
                            className="px-3 py-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-sm font-medium text-[#1d1d1f] dark:text-white border border-[#e5e5ea] dark:border-[#2c2c2e]"
                          >
                            {pool.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
});

LPMining.displayName = 'LPMining';

export default LPMining;
