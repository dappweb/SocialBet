import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, PieChart, ArrowUpRight, Info, RefreshCw } from 'lucide-react';
import { cn } from '../utils';
import { operationsApi, TreasuryData } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

/**
 * Treasury Management Component
 * Displays platform operational funding from SOUL token trading
 */
const TreasuryManagement: React.FC = () => {
  const [treasuryData, setTreasuryData] = useState<TreasuryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreasuryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await operationsApi.getTreasury();
      setTreasuryData(data);
    } catch (err: any) {
      console.error('Failed to fetch treasury data:', err);
      setError(err.message || 'Failed to load treasury data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasuryData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTreasuryData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-[#e5e5ea]">
        <LoadingSpinner text="Loading treasury data..." />
      </div>
    );
  }

  if (error || !treasuryData) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-[#e5e5ea]">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || 'Failed to load treasury data'}</p>
          <button
            onClick={fetchTreasuryData}
            className="px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-xl font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate allocation breakdown from API data
  const allocations = useMemo(() => {
    if (!treasuryData.allocations) {
      return {
        development: 0,
        operations: 0,
        marketing: 0,
        reserves: 0,
        partnerships: 0,
      };
    }
    return {
      development: treasuryData.allocations.development?.allocated || 0,
      operations: treasuryData.allocations.operations?.allocated || 0,
      marketing: treasuryData.allocations.marketing?.allocated || 0,
      reserves: treasuryData.allocations.reserves?.allocated || 0,
      partnerships: treasuryData.allocations.partnerships?.allocated || 0,
    };
  }, [treasuryData.allocations]);

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${treasuryData.totalRevenue.toLocaleString()}`,
      change: treasuryData.trends?.revenueChange || '+0%',
      trend: (treasuryData.trends?.revenueChange || '+0%').startsWith('+') ? 'up' as const : 'down' as const,
      icon: DollarSign,
    },
    {
      label: 'Monthly Revenue',
      value: `$${treasuryData.monthlyRevenue.toLocaleString()}`,
      change: treasuryData.trends?.monthlyRevenueChange || '+0%',
      trend: (treasuryData.trends?.monthlyRevenueChange || '+0%').startsWith('+') ? 'up' as const : 'down' as const,
      icon: TrendingUp,
    },
    {
      label: 'Operational Fund',
      value: `$${treasuryData.operationalFund.toLocaleString()}`,
      change: treasuryData.trends?.fundChange || '+0%',
      trend: (treasuryData.trends?.fundChange || '+0%').startsWith('+') ? 'up' as const : 'down' as const,
      icon: PieChart,
    },
    {
      label: 'Total Trades',
      value: treasuryData.totalTrades.toLocaleString(),
      change: treasuryData.trends?.tradesChange || '+0%',
      trend: (treasuryData.trends?.tradesChange || '+0%').startsWith('+') ? 'up' as const : 'down' as const,
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl border border-[#e5e5ea]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] flex items-center gap-2">
            <PieChart className="text-[#ffd700]" size={28} />
            Treasury Management
          </h2>
          <p className="text-sm text-[#86868b] mt-1">
            Platform operational funding from SOUL token trading
          </p>
        </div>
        <button
          onClick={fetchTreasuryData}
          className="p-2 rounded-xl hover:bg-[#f5f5f7] transition-colors duration-200"
          title="Refresh data"
        >
          <RefreshCw size={20} className="text-[#86868b]" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#f5f5f7] rounded-xl p-4 border border-[#e5e5ea]"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className="text-[#86868b]" />
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded",
                  stat.trend === 'up'
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-[#86868b] mb-1">{stat.label}</p>
            <p className="text-xl font-semibold text-[#1d1d1f]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Allocation Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">
          Fund Allocation
        </h3>
        <div className="space-y-3">
          {[
            { 
              label: 'Development', 
              value: allocations.development, 
              color: 'bg-[#ffd700]', 
              percent: treasuryData.allocations?.development?.percentage || 40 
            },
            { 
              label: 'Operations', 
              value: allocations.operations, 
              color: 'bg-[#34c759]', 
              percent: treasuryData.allocations?.operations?.percentage || 30 
            },
            { 
              label: 'Marketing', 
              value: allocations.marketing, 
              color: 'bg-[#007aff]', 
              percent: treasuryData.allocations?.marketing?.percentage || 15 
            },
            { 
              label: 'Reserves', 
              value: allocations.reserves, 
              color: 'bg-[#ff9500]', 
              percent: treasuryData.allocations?.reserves?.percentage || 10 
            },
            { 
              label: 'Partnerships', 
              value: allocations.partnerships, 
              color: 'bg-[#af52de]', 
              percent: treasuryData.allocations?.partnerships?.percentage || 5 
            },
          ].map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1d1d1f]">
                  {item.label}
                </span>
                <span className="text-sm text-[#86868b]">
                  ${item.value.toLocaleString()} ({item.percent}%)
                </span>
              </div>
              <div className="w-full bg-[#e5e5ea] rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    item.color
                  )}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Fee Info */}
      <div className="bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-[#ffd700] mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1d1d1f] mb-1">
              Platform Fee Structure
            </p>
            <p className="text-xs text-[#86868b] leading-relaxed">
              A {treasuryData.platformFeePercent}% fee is collected on all SOUL token trades 
              (buy and sell). This fee directly funds platform operations, ensuring sustainable 
              growth and continuous development of KOL Market features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryManagement;

