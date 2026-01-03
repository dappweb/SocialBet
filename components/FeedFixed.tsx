import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { cn } from '../utils';
import { PredictionMarket } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import LazyImage from './LazyImage';

interface FeedProps {
  markets: PredictionMarket[];
}

type TabType = 'foryou' | 'following' | 'crypto' | 'sports';

const FeedFixed: React.FC<FeedProps> = ({ markets: initialMarkets = [] }) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(initialMarkets);
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const filteredMarkets = useMemo(() => {
    switch (activeTab) {
      case 'foryou':
        return markets;
      case 'crypto':
        return markets.filter(m => m.category === 'Crypto');
      case 'sports':
        return markets.filter(m => m.category === 'Sports');
      case 'following':
        return markets.slice(0, 5); // Mock following
      default:
        return markets;
    }
  }, [markets, activeTab]);

  const handleBet = (market: PredictionMarket, type: 'YES' | 'NO') => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet to place a bet', 'error');
      return;
    }
    showToast(`Bet placed on ${market.question} - ${type}`, 'success');
  };

  const TabButton: React.FC<{ id: TabType; label: string; icon?: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] transition-colors duration-200",
        activeTab === id 
          ? "border-b-2 border-[#ffd700] text-[#1d1d1f] dark:text-white font-semibold text-sm" 
          : "text-[#86868b] dark:text-[#a1a1a6] font-medium text-sm"
      )}
    >
      {icon}
      {label}
    </button>
  );

  const MarketCard: React.FC<{ market: PredictionMarket }> = ({ market }) => (
    <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <LazyImage
            src={market.creator.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            className="w-10 h-10 rounded-full border-2 border-[#e5e5ea] dark:border-[#2c2c2e]"
            alt={market.creator.name}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {market.creator.name}
              </span>
              {market.creator.id !== 'ai' && (
                <div className="w-5 h-5 bg-[#ffd700] rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-[#1d1d1f] font-bold">✓</span>
                </div>
              )}
            </div>
            <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
              @{market.creator.handle}
            </span>
          </div>
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
          {new Date(market.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-3 leading-tight">
        {market.question}
      </h3>

      {/* Category */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] text-xs font-medium rounded-full">
          {market.category}
        </span>
        {market.creator.id === 'ai' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
            <Sparkles size={12} />
            AI Generated
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{market.outcomeStats.yesPercent}%</div>
          <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Yes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{market.outcomeStats.noPercent}%</div>
          <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">No</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1d1d1f] dark:text-white">${(market.poolSize / 1000).toFixed(1)}k</div>
          <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Pool</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleBet(market, 'YES')}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200"
        >
          Yes ${((market.poolSize * 0.01) / 100).toFixed(2)}
        </button>
        <button
          onClick={() => handleBet(market, 'NO')}
          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200"
        >
          No ${((market.poolSize * 0.01) / 100).toFixed(2)}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50">
        <div className="flex items-center gap-4 text-[#86868b] dark:text-[#a1a1a6] text-sm">
          <span className="flex items-center gap-1">
            <Trophy size={14} />
            {market.volume} bets
          </span>
          <span className="flex items-center gap-1">
            <Activity size={14} />
            {market.likes} likes
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl border-x border-[#e5e5ea] dark:border-[#2c2c2e] min-h-screen pb-20 sm:pb-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e] px-6 py-4">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white">Home</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e] overflow-x-auto no-scrollbar">
        <TabButton id="foryou" label="For You" icon={<TrendingUp size={16} />} />
        <TabButton id="crypto" label="Crypto" />
        <TabButton id="sports" label="Sports" />
        <TabButton id="following" label="Following" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#86868b] dark:text-[#a1a1a6]">
            <Activity size={48} className="mb-4 opacity-50" />
            <p>No markets found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedFixed;
