import React, { useState, useMemo, useCallback } from 'react';
import PredictionCard from './PredictionCard';
import BetModal from './BetModal';
import { PredictionMarket, BetType } from '../types';
import { Sparkles, Activity } from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { betsApi } from '../services/api';
import SkeletonLoader from './SkeletonLoader';
import LazyImage from './LazyImage';

interface FeedProps {
  markets: PredictionMarket[];
}

type TabType = 'foryou' | 'following' | 'crypto' | 'sports';

const Feed: React.FC<FeedProps> = ({ markets: initialMarkets }) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(initialMarkets);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betType, setBetType] = useState<BetType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const openBetModal = useCallback((market: PredictionMarket, type: BetType) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet or sign in to place bets', 'warning');
      return;
    }
    setSelectedMarket(market);
    setBetType(type);
    setIsModalOpen(true);
  }, [isAuthenticated, showToast]);

  const handlePlaceBet = async (marketId: string, amount: number, type: BetType) => {
    try {
      const market = markets.find(m => m.id === marketId);
      if (!market) throw new Error('Market not found');

      // Place bet via API
      await betsApi.place({
        marketId,
        betType: type,
        amount,
        priceAtBet: type === 'YES' ? market.outcomeStats.yesPrice : market.outcomeStats.noPrice,
        userId: 'me',
      });

      // Update local state to reflect the bet
      setMarkets(prev => prev.map(m => {
        if (m.id !== marketId) return m;

        const impact = Math.min(amount / m.poolSize * 10, 5);
        let newYesPercent = m.outcomeStats.yesPercent;

        if (type === 'YES') {
          newYesPercent += impact;
        } else {
          newYesPercent -= impact;
        }

        newYesPercent = Math.max(1, Math.min(99, newYesPercent));
        const newNoPercent = 100 - newYesPercent;

        return {
          ...m,
          poolSize: m.poolSize + amount,
          volume: m.volume + amount,
          outcomeStats: {
            yesPercent: newYesPercent,
            noPercent: newNoPercent,
            yesPrice: newYesPercent / 100,
            noPrice: newNoPercent / 100,
          }
        };
      }));

      showToast(`Bet placed successfully! ${type} $${amount.toFixed(2)}`, 'success');
    } catch (error) {
      console.error('Failed to place bet:', error);
      showToast('Failed to place bet. Please try again.', 'error');
      throw error;
    }
  };

  // Filter markets based on active tab
  const filteredMarkets = useMemo(() => {
    switch (activeTab) {
      case 'foryou':
        return markets; // Show all for now
      case 'following':
        return markets.slice(0, 3); // Mock following feed
      case 'crypto':
        return markets.filter(m => m.category === 'Crypto');
      case 'sports':
        return markets.filter(m => m.category === 'Sports');
      default:
        return markets;
    }
  }, [markets, activeTab]);

  const TabButton = ({ id, label }: { id: TabType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className="flex-1 py-4 hover:bg-[#f5f5f7] transition-colors duration-200 relative"
    >
      <span className={cn("font-semibold text-sm sm:text-base transition-colors duration-200", activeTab === id ? "text-[#1d1d1f]" : "text-[#86868b]")}>
        {label}
      </span>
      {activeTab === id && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-0.5 bg-[#ffd700] rounded-full"></div>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-2xl border-x border-[#e5e5ea]/50 min-h-screen pb-20 sm:pb-0 bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] px-4 py-3 flex items-center justify-between sm:hidden shadow-sm">
        <div className="w-8 h-8 bg-[#ffd700] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] text-sm shadow-md shadow-[#ffd700]/20">SB</div>
        <span className="font-semibold text-lg text-[#1d1d1f]">Home</span>
        <div className="w-8"></div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] px-6 py-5 items-center justify-between cursor-pointer shadow-sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <h1 className="text-2xl font-semibold text-[#1d1d1f]">Home</h1>
        <Sparkles size={20} className="text-[#ffd700]" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] overflow-x-auto no-scrollbar bg-white">
        <TabButton id="foryou" label="For You" />
        <TabButton id="following" label="Following" />
        <TabButton id="crypto" label="Crypto" />
        <TabButton id="sports" label="Sports" />
      </div>

      {/* Post Input Teaser */}
      <div className="hidden sm:flex gap-4 p-4 border-b border-[#e5e5ea] bg-white">
        <LazyImage
          src="https://picsum.photos/id/100/100/100"
          className="w-10 h-10 rounded-full border-2 border-[#e5e5ea]"
          alt="avatar"
        />
        <div className="flex-1">
          <div className="bg-[#f5f5f7] rounded-xl h-10 flex items-center px-4 text-[#86868b] font-medium cursor-text hover:bg-[#fff9e6] hover:border hover:border-[#ffd700]/30 transition-all duration-200">
            What do you want to predict?
          </div>
        </div>
      </div>

      {/* Feed Items */}
      <div className="min-h-[50vh] bg-white">
        {filteredMarkets.length > 0 ? (
          <div className="content-visibility-auto">
            {filteredMarkets.map(market => (
              <PredictionCard
                key={market.id}
                market={market}
                onBet={openBetModal}
              />
            ))}
          </div>
        ) : filteredMarkets.length === 0 && markets.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#86868b]">
            <Activity size={48} className="mb-4 opacity-50" />
            <p>No markets found in this category.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        )}
      </div>

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

export default Feed;