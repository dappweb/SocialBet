import React, { useState, useEffect, memo } from 'react';
import { Flame, TrendingUp, Calendar, DollarSign, Target, Clock, BarChart3, Zap, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  type BuybackEvent,
  type BurnEvent,
  type BurnSchedule,
  getBuybackEvents,
  getBurnEvents,
  getBuybackStats,
  getBurnSchedule,
  executeBuybackBurn,
  getTokenSupplyInfo,
  getDeflationMetrics,
  getUpcomingBurnEvents,
  getBurnImpactAnalysis,
  getBurnHistoryChartData,
  getBurnLeaderboard,
  calculateBurnEfficiency,
  BUYBACK_BURN_CONFIG
} from '../services/buybackBurnService';

const BuybackBurn: React.FC = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'schedule' | 'analytics' | 'leaderboard'>('overview');
  const [buybackEvents, setBuybackEvents] = useState<BuybackEvent[]>([]);
  const [burnEvents, setBurnEvents] = useState<BurnEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [schedule, setSchedule] = useState<BurnSchedule[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [supplyInfo, setSupplyInfo] = useState<any>(null);
  const [deflationMetrics, setDeflationMetrics] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state for manual buyback
  const [buybackForm, setBuybackForm] = useState({
    amount: '',
    maxPrice: '',
    source: 'market_revenue' as const,
  });

  useEffect(() => {
    loadBuybackBurnData();
  }, []);

  const loadBuybackBurnData = async () => {
    try {
      setLoading(true);
      
      const [
        buybackData,
        burnData,
        statsData,
        scheduleData,
        upcomingData,
        supplyData,
        deflationData,
        impactData,
        chartDataResponse,
        leaderboardData,
      ] = await Promise.all([
        getBuybackEvents(),
        getBurnEvents(),
        getBuybackStats(),
        getBurnSchedule(),
        getUpcomingBurnEvents(),
        getTokenSupplyInfo(),
        getDeflationMetrics(),
        getBurnImpactAnalysis(),
        getBurnHistoryChartData('30d'),
        getBurnLeaderboard(),
      ]);

      setBuybackEvents(buybackData);
      setBurnEvents(burnData);
      setStats(statsData);
      setSchedule(scheduleData);
      setUpcomingEvents(upcomingData);
      setSupplyInfo(supplyData);
      setDeflationMetrics(deflationData);
      setImpactAnalysis(impactData);
      setChartData(chartDataResponse);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load buyback & burn data:', error);
      showToast('Failed to load buyback & burn data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBuyback = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to execute buyback', 'error');
      return;
    }

    try {
      setActionLoading('buyback');
      const amount = Number(buybackForm.amount);
      const maxPrice = Number(buybackForm.maxPrice);
      
      if (amount < BUYBACK_BURN_CONFIG.MIN_BUYBACK_AMOUNT) {
        showToast(`Minimum buyback amount is ${BUYBACK_BURN_CONFIG.MIN_BUYBACK_AMOUNT} SOUL`, 'error');
        return;
      }
      
      if (amount > BUYBACK_BURN_CONFIG.MAX_BUYBACK_AMOUNT) {
        showToast(`Maximum buyback amount is ${BUYBACK_BURN_CONFIG.MAX_BUYBACK_AMOUNT} SOUL`, 'error');
        return;
      }

      const result = await executeBuybackBurn(amount, maxPrice, buybackForm.source);
      
      if (result.success) {
        showToast(result.message, 'success');
        setBuybackForm({ amount: '', maxPrice: '', source: 'market_revenue' });
        await loadBuybackBurnData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Failed to execute buyback:', error);
      showToast('Failed to execute buyback', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-[#34c759] bg-[#34c759]/10';
      case 'pending':
        return 'text-[#ff9500] bg-[#ff9500]/10';
      case 'failed':
        return 'text-[#ff3b30] bg-[#ff3b30]/10';
      default:
        return 'text-[#86868b] bg-[#86868b]/10';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'market_revenue':
        return '💰';
      case 'treasury':
        return '🏛️';
      case 'community_fund':
        return '👥';
      default:
        return '📊';
    }
  };

  const formatCountdown = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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
      <div className="bg-gradient-to-r from-[#ff3b30] to-[#ff6b6b] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Buyback & Burn</h1>
            <p className="text-white/90">
              Deflationary mechanism to reduce token supply and increase value
            </p>
          </div>
          <Flame size={48} className="text-white/80" />
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalBuybackAmount?.toLocaleString() || 0}</div>
            <div className="text-sm text-white/80">Total Buyback</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.totalBurnedAmount?.toLocaleString() || 0}</div>
            <div className="text-sm text-white/80">Total Burned</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">{stats?.currentBurnRate || 0}%</div>
            <div className="text-sm text-white/80">Burn Rate</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-2xl font-bold">${stats?.totalValueSpent?.toLocaleString() || 0}</div>
            <div className="text-sm text-white/80">Value Spent</div>
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
          <Flame size={20} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'events'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Calendar size={20} />
          Events
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'schedule'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <Clock size={20} />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors",
            activeTab === 'analytics'
              ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
              : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          )}
        >
          <BarChart3 size={20} />
          Analytics
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
          <Award size={20} />
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Supply Information */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Token Supply Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Total Supply</div>
                  <div className="text-xl font-bold text-[#1d1d1f] dark:text-white">
                    {supplyInfo?.totalSupply?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Circulating Supply</div>
                  <div className="text-xl font-bold text-[#1d1d1f] dark:text-white">
                    {supplyInfo?.circulatingSupply?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Burned Amount</div>
                  <div className="text-xl font-bold text-[#ff3b30]">
                    {supplyInfo?.burnedAmount?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Burn Percentage</div>
                  <div className="text-xl font-bold text-[#ffd700]">
                    {supplyInfo?.burnPercentage || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Burns */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Upcoming Burn Events
              </h3>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                    <div>
                      <div className="font-medium text-[#1d1d1f] dark:text-white capitalize">
                        {event.schedule.type} Burn
                      </div>
                      <div className="text-sm text-[#86868b]">
                        {event.estimatedAmount.toLocaleString()} SOUL • {event.source}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ff3b30]">
                        {formatCountdown(event.countdown)}
                      </div>
                      <div className="text-sm text-[#86868b]">remaining</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Buyback */}
            {isAuthenticated && (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                  Manual Buyback & Burn
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                        Amount (SOUL)
                      </label>
                      <input
                        type="number"
                        value={buybackForm.amount}
                        onChange={(e) => setBuybackForm({...buybackForm, amount: e.target.value})}
                        className="w-full p-3 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                        min={BUYBACK_BURN_CONFIG.MIN_BUYBACK_AMOUNT}
                        max={BUYBACK_BURN_CONFIG.MAX_BUYBACK_AMOUNT}
                        placeholder={`Min: ${BUYBACK_BURN_CONFIG.MIN_BUYBACK_AMOUNT}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                        Max Price (USD)
                      </label>
                      <input
                        type="number"
                        value={buybackForm.maxPrice}
                        onChange={(e) => setBuybackForm({...buybackForm, maxPrice: e.target.value})}
                        className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                        step="0.01"
                        min="0.01"
                        placeholder="0.85"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
                      Source
                    </label>
                    <select
                      value={buybackForm.source}
                      onChange={(e) => setBuybackForm({...buybackForm, source: e.target.value as any})}
                      className="w-full p-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-lg bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white"
                    >
                      <option value="market_revenue">Market Revenue</option>
                      <option value="treasury">Treasury</option>
                      <option value="community_fund">Community Fund</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleExecuteBuyback}
                    disabled={actionLoading === 'buyback' || !buybackForm.amount || !buybackForm.maxPrice}
                    className="w-full py-3 bg-[#ff3b30] hover:bg-[#ff6b6b] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'buyback' ? 'Executing...' : 'Execute Buyback & Burn'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Buyback Events */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Recent Buyback Events
              </h3>
              <div className="space-y-3">
                {buybackEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSourceIcon(event.source)}</span>
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-white">
                          {event.amount.toLocaleString()} SOUL
                        </div>
                        <div className="text-sm text-[#86868b]">
                          ${event.totalValue.toLocaleString()} • {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getStatusColor(event.status)
                      )}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Burn Events */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Recent Burn Events
              </h3>
              <div className="space-y-3">
                {burnEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Flame size={24} className="text-[#ff3b30]" />
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-white">
                          {event.amount.toLocaleString()} SOUL Burned
                        </div>
                        <div className="text-sm text-[#86868b]">
                          {event.percentageOfSupply.toFixed(2)}% of supply • {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#ff3b30]">
                        {event.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#38383a]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f] dark:text-white capitalize">
                      {item.type} Burn Schedule
                    </h4>
                    <p className="text-sm text-[#86868b]">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isActive ? (
                      <span className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] rounded-full text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-[#86868b]/10 text-[#86868b] rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    )}
                    {item.autoExecute && (
                      <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-sm font-medium">
                        Auto
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <div className="text-sm text-[#86868b]">Amount</div>
                    <div className="font-semibold text-[#1d1d1f] dark:text-white">
                      {item.amount.toLocaleString()} SOUL
                    </div>
                  </div>
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <div className="text-sm text-[#86868b]">Next Execution</div>
                    <div className="font-semibold text-[#1d1d1f] dark:text-white">
                      {new Date(item.nextExecution).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <div className="text-sm text-[#86868b]">Countdown</div>
                    <div className="font-semibold text-[#ff3b30]">
                      {formatCountdown(item.nextExecution - Date.now())}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Deflation Metrics */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Deflation Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Current Burn Rate</div>
                  <div className="text-2xl font-bold text-[#ff3b30]">
                    {deflationMetrics?.currentRate || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Projected Annual Rate</div>
                  <div className="text-2xl font-bold text-[#ffd700]">
                    {deflationMetrics?.projectedAnnualRate || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Next Milestone</div>
                  <div className="text-2xl font-bold text-[#34c759]">
                    {deflationMetrics?.nextMilestone || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Value Locked</div>
                  <div className="text-2xl font-bold text-[#007AFF]">
                    ${(deflationMetrics?.valueLocked || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Burn Impact Analysis ({impactAnalysis?.timeframe})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Price Impact</div>
                  <div className="text-2xl font-bold text-[#34c759]">
                    +{impactAnalysis?.priceImpact || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Supply Reduction</div>
                  <div className="text-2xl font-bold text-[#ff3b30]">
                    -{impactAnalysis?.supplyReduction || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Holder Value Increase</div>
                  <div className="text-2xl font-bold text-[#ffd700]">
                    +{impactAnalysis?.holderValueIncrease || 0}%
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl">
                  <div className="text-sm text-[#86868b] mb-1">Market Cap Change</div>
                  <div className="text-2xl font-bold text-[#007AFF]">
                    +{impactAnalysis?.marketCapChange || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Data */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">
                Burn History (30 Days)
              </h3>
              <div className="space-y-2">
                {chartData.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-lg">
                    <div className="text-sm text-[#86868b]">{data.date}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[#1d1d1f] dark:text-white">
                        {data.burned.toLocaleString()} SOUL
                      </div>
                      <div className="text-sm text-[#ffd700]">
                        ${data.price.toFixed(3)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {leaderboard.map((item, index) => (
              <div key={index} className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 border border-[#e5e5ea] dark:border-[#2c2c2e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-[#86868b] w-8">
                      #{item.rank}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f] dark:text-white">
                        {item.address}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-[#86868b]">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          item.type === 'protocol' 
                            ? "bg-[#007AFF]/10 text-[#007AFF]"
                            : "bg-[#34c759]/10 text-[#34c759]"
                        )}>
                          {item.type}
                        </span>
                        <span>{item.percentage.toFixed(1)}% of total burns</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#ff3b30] text-lg">
                      {item.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#86868b]">SOUL</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

BuybackBurn.displayName = 'BuybackBurn';

export default BuybackBurn;
