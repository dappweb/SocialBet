import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PredictionCard from './PredictionCard';
import BetModal from './BetModal';
import { PredictionMarket, BetType } from '../types';
import { Sparkles, Activity, TrendingUp, Clock, Users, Zap } from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { betsApi } from '../services/api';
import SkeletonLoader from './SkeletonLoader';
import LazyImage from './LazyImage';

interface FeedOptimizedProps {
  markets: PredictionMarket[];
}

type TabType = 'trending' | 'foryou' | 'following' | 'crypto' | 'sports' | 'politics';

const FeedOptimized: React.FC<FeedOptimizedProps> = ({ markets: initialMarkets = [] }) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(initialMarkets);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betType, setBetType] = useState<BetType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const { showToast } = useToast();
  const { isAuthenticated, user: authUser } = useAuth();

  // Sync with prop changes
  useEffect(() => {
    setMarkets(initialMarkets);
  }, [initialMarkets]);

  const openBetModal = useCallback((market: PredictionMarket, type: BetType) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet or sign in to place bets', 'warning');
      return;
    }
    setSelectedMarket(market);
    setBetType(type);
    setIsModalOpen(true);
  }, [isAuthenticated, showToast]);

  const handlePlaceBet = async (marketId: string, amount: number, type: BetType, blockchain?: string) => {
    try {
      const market = markets.find(m => m.id === marketId);
      if (!market) throw new Error('Market not found');

      await betsApi.place({
        marketId,
        amount,
        type,
        blockchain,
      });

      showToast('Bet placed successfully!', 'success');
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to place bet', 'error');
    }
  };

  // Enhanced filtering with trending logic
  const filteredMarkets = useMemo(() => {
    const sortedMarkets = [...markets].sort((a, b) => {
      // Sort by combined score: volume + likes + comments + hot status
      const scoreA = (a.volume || 0) * 0.4 + (a.likes || 0) * 0.3 + (a.comments || 0) * 0.2 + (a.isHot ? 1000 : 0) * 0.1;
      const scoreB = (b.volume || 0) * 0.4 + (b.likes || 0) * 0.3 + (b.comments || 0) * 0.2 + (b.isHot ? 1000 : 0) * 0.1;
      return scoreB - scoreA;
    });

    switch (activeTab) {
      case 'trending':
        return sortedMarkets.slice(0, 8); // Top 8 trending
      case 'foryou':
        return sortedMarkets.slice(0, 12); // Personalized feed
      case 'following':
        return sortedMarkets.slice(0, 6); // Following feed
      case 'crypto':
        return sortedMarkets.filter(m => m.category === 'Crypto').slice(0, 10);
      case 'sports':
        return sortedMarkets.filter(m => m.category === 'Sports').slice(0, 10);
      case 'politics':
        return sortedMarkets.filter(m => m.category === 'Politics').slice(0, 10);
      default:
        return sortedMarkets.slice(0, 12);
    }
  }, [markets, activeTab]);

  const TabButton = ({ id, label, icon: Icon, count }: { 
    id: TabType, 
    label: string, 
    icon: React.ElementType,
    count?: number 
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-2 py-3 px-4 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] transition-colors duration-200 relative"
    >
      <Icon size={16} className={activeTab === id ? "text-[#ffd700]" : "text-[#86868b]"} />
      <span className={cn("font-semibold text-sm transition-colors duration-200", activeTab === id ? "text-[#1d1d1f] dark:text-white" : "text-[#86868b] dark:text-[#a1a1a6]")}>
        {label}
      </span>
      {count && (
        <span className="px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">
          {count}
        </span>
      )}
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffd700] rounded-full"></div>
      )}
    </button>
  );

  // Quick Stats Component
  const QuickStats = () => (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-[#f5f5f7] to-[#e5e5ea] dark:from-[#1c1c1e] dark:to-[#2c2c2e] rounded-xl">
      <div className="text-center">
        <div className="text-lg font-bold text-[#1d1d1f] dark:text-white">
          {markets.filter(m => m.isHot).length}
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Hot Markets</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-[#ffd700]">
          ${(markets.reduce((sum, m) => sum + (m.volume || 0), 0) / 1000000).toFixed(1)}M
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Total Volume</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-[#34c759]">
          {markets.reduce((sum, m) => sum + (m.likes || 0), 0).toLocaleString()}
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Total Likes</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-[#007AFF]">
          {markets.reduce((sum, m) => sum + (m.comments || 0), 0).toLocaleString()}
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Comments</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl border-x border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50 min-h-screen pb-20 sm:pb-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        {/* Mobile Header */}
        <div className="sm:hidden px-4 py-3 flex items-center justify-between">
          <div className="w-8 h-8 bg-[#ffd700] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] text-sm shadow-md shadow-[#ffd700]/20">SB</div>
          <span className="font-semibold text-lg text-[#1d1d1f] dark:text-white">KOL Market</span>
          <div className="w-8"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd700] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] shadow-md shadow-[#ffd700]/20">SB</div>
            <div>
              <h1 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">KOL Market</h1>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6">KOL Intent Prediction Markets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#ffd700]" />
            <span className="text-sm text-[#86868b] dark:text-[#a1a1a6">Live Markets</span>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />
      </div>

      {/* Enhanced Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e] overflow-x-auto no-scrollbar bg-white dark:bg-[#0a0a0a]">
        <TabButton id="trending" label="Trending" icon={TrendingUp} count={markets.filter(m => m.isHot).length} />
        <TabButton id="foryou" label="For You" icon={Sparkles} />
        <TabButton id="following" label="Following" icon={Users} />
        <TabButton id="crypto" label="Crypto" icon={Zap} count={markets.filter(m => m.category === 'Crypto').length} />
        <TabButton id="sports" label="Sports" icon={Clock} count={markets.filter(m => m.category === 'Sports').length} />
        <TabButton id="politics" label="Politics" icon={Users} count={markets.filter(m => m.category === 'Politics').length} />
      </div>

      {/* Enhanced Post Input */}
      <div className="hidden sm:flex gap-4 p-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e] bg-white dark:bg-[#0a0a0a]">
        <LazyImage
          src={authUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
          className="w-10 h-10 rounded-full border-2 border-[#e5e5ea] dark:border-[#2c2c2e]"
          alt={authUser?.name || 'User avatar'}
        />
        <div className="flex-1">
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl h-10 flex items-center px-4 text-[#86868b] dark:text-[#a1a1a6] font-medium cursor-text hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] hover:border hover:border-[#ffd700]/30 transition-all duration-200">
            What prediction do you want to create?
          </div>
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 bg-[#ffd700]/20 text-[#ffd700] rounded-lg text-xs font-medium hover:bg-[#ffd700]/30 transition-colors">
              🎯 Quick Predict
            </button>
            <button className="px-3 py-1 bg-[#007AFF]/20 text-[#007AFF] rounded-lg text-xs font-medium hover:bg-[#007AFF]/30 transition-colors">
              🤖 AI Generate
            </button>
            <button className="px-3 py-1 bg-[#34c759]/20 text-[#34c759] rounded-lg text-xs font-medium hover:bg-[#34c759]/30 transition-colors">
              📊 Trending Topic
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Feed Items */}
      <div className="min-h-[50vh] bg-white dark:bg-[#0a0a0a]">
        {filteredMarkets && filteredMarkets.length > 0 ? (
          <div className="content-visibility-auto">
            {/* Featured Market */}
            {activeTab === 'trending' && filteredMarkets[0] && (
              <div className="border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
                <div className="p-4 bg-gradient-to-r from-[#ffd700]/10 to-[#ffeb3b]/5 border-l-4 border-[#ffd700]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-[#ffd700]" />
                    <span className="text-sm font-bold text-[#ffd700]">🔥 TRENDING NOW</span>
                  </div>
                  <PredictionCard
                    market={filteredMarkets[0]}
                    onBet={openBetModal}
                    featured={true}
                  />
                </div>
              </div>
            )}
            
            {/* Regular Markets */}
            <div className={activeTab === 'trending' ? 'pt-0' : ''}>
              {filteredMarkets.map((market, index) => (
                <div key={market.id} className={index === 0 && activeTab === 'trending' ? 'hidden' : ''}>
                  <PredictionCard
                    market={market}
                    onBet={openBetModal}
                    highlighted={market.isHot}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : markets && markets.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#86868b] dark:text-[#a1a1a6]">
            <Activity size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No markets found in this category</p>
            <p className="text-sm">Try exploring other categories or check back later</p>
          </div>
        ) : (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredMarkets.length > 0 && (
        <div className="p-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
          <button className="w-full py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-xl font-medium text-[#1d1d1f] dark:text-white transition-colors duration-200">
            Load More Markets
          </button>
        </div>
      )}

      <BetModal
        market={selectedMarket}
        betType={betType}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaceBet={handlePlaceBet}
      />
    </div>
  );
};

FeedOptimized.displayName = 'FeedOptimized';

export default FeedOptimized;
