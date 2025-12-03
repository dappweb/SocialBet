import React, { useState, useMemo } from 'react';
import PredictionCard from './PredictionCard';
import BetModal from './BetModal';
import { PredictionMarket, BetType } from '../types';
import { Sparkles, Activity } from 'lucide-react';
import { cn } from '../utils';

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

  const openBetModal = (market: PredictionMarket, type: BetType) => {
    setSelectedMarket(market);
    setBetType(type);
    setIsModalOpen(true);
  };

  const handlePlaceBet = async (marketId: string, amount: number, type: BetType) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update local state to reflect the bet (Mocking real-time updates)
    setMarkets(prev => prev.map(m => {
      if (m.id !== marketId) return m;
      
      // Simplified AMM impact simulation
      // If betting YES, yesPercent goes up, price goes up.
      const impact = Math.min(amount / m.poolSize * 10, 5); // Cap impact at 5% for mock
      
      let newYesPercent = m.outcomeStats.yesPercent;
      
      if (type === 'YES') {
          newYesPercent += impact;
      } else {
          newYesPercent -= impact;
      }

      // Clamp
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
      className="flex-1 py-4 hover:bg-slate-900/50 transition-colors relative"
    >
      <span className={cn("font-bold text-sm sm:text-base", activeTab === id ? "text-white" : "text-slate-500")}>
        {label}
      </span>
      {activeTab === id && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-1 bg-blue-500 rounded-full"></div>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-2xl border-x border-slate-800 min-h-screen pb-20 sm:pb-0">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between sm:hidden">
         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20">SB</div>
         <span className="font-bold text-lg">Home</span>
         <div className="w-8"></div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 items-center justify-between cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
        <h1 className="text-xl font-bold text-white">Home</h1>
        <Sparkles size={20} className="text-blue-500" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
          <TabButton id="foryou" label="For You" />
          <TabButton id="following" label="Following" />
          <TabButton id="crypto" label="Crypto" />
          <TabButton id="sports" label="Sports" />
      </div>

      {/* Post Input Teaser */}
      <div className="hidden sm:flex gap-4 p-4 border-b border-slate-800">
         <img src="https://picsum.photos/id/100/100/100" className="w-10 h-10 rounded-full border border-slate-700" alt="avatar" />
         <div className="flex-1">
             <div className="bg-slate-900 rounded-full h-10 flex items-center px-4 text-slate-500 font-medium cursor-text hover:bg-slate-800 transition-colors">
                 What do you want to predict?
             </div>
         </div>
      </div>

      {/* Feed Items */}
      <div className="min-h-[50vh]">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map(market => (
            <PredictionCard 
              key={market.id} 
              market={market} 
              onBet={openBetModal}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <Activity size={48} className="mb-4 opacity-50" />
             <p>No markets found in this category.</p>
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