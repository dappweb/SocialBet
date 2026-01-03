import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PredictionCard from './PredictionCard';
import BetModalFixed from './BetModalFixed';
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

const FeedWithFixedModal: React.FC<FeedProps> = ({ markets: initialMarkets = [] }) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(initialMarkets);
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betType, setBetType] = useState<BetType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Update markets when initialMarkets changes
  useEffect(() => {
    setMarkets(initialMarkets);
  }, [initialMarkets]);

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

  const handleBet = useCallback((market: PredictionMarket, type: BetType) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet to place a bet', 'error');
      return;
    }
    setSelectedMarket(market);
    setBetType(type);
    setIsModalOpen(true);
  }, [isAuthenticated, showToast]);

  const handlePlaceBet = useCallback(async (marketId: string, amount: number, type: BetType, blockchain?: string) => {
    try {
      // Mock bet placement - in real app this would call the API
      console.log('Placing bet:', { marketId, amount, type, blockchain });
      
      // Update local state to reflect the bet
      setMarkets(prev => prev.map(market => 
        market.id === marketId 
          ? { 
              ...market, 
              volume: market.volume + 1,
              poolSize: market.poolSize + amount
            }
          : market
      ));
      
      showToast('Bet placed successfully!', 'success');
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw error;
    }
  }, [showToast]);

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

  return (
    <div className="w-full max-w-2xl border-x border-[#e5e5ea] dark:border-[#2c2c2e] min-h-screen pb-20 sm:pb-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e] px-6 py-4">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white">Home</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e] overflow-x-auto no-scrollbar">
        <TabButton id="foryou" label="For You" icon={<Sparkles size={16} />} />
        <TabButton id="crypto" label="Crypto" />
        <TabButton id="sports" label="Sports" />
        <TabButton id="following" label="Following" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <PredictionCard 
              key={market.id} 
              market={market} 
              onBet={handleBet}
            />
          ))
        ) : markets && markets.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#86868b] dark:text-[#a1a1a6]">
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

      <BetModalFixed
        market={selectedMarket}
        betType={betType}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaceBet={handlePlaceBet}
      />
    </div>
  );
};

export default FeedWithFixedModal;
