import React, { useState } from 'react';
import { Calendar, Link as LinkIcon, MapPin, ArrowLeft, Ghost } from 'lucide-react';
import { MOCK_MARKETS } from '../constants';
import PredictionCard from './PredictionCard';
import { PredictionMarket, BetType } from '../types';
import { cn } from '../utils';
import LazyImage from './LazyImage';

interface ProfileProps {
    onBack?: () => void;
}

type ProfileTab = 'bets' | 'created' | 'likes';

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('bets');

  // Mock Data Logic
  const userBets = MOCK_MARKETS.slice(0, 3);
  const createdMarkets = MOCK_MARKETS.filter(m => m.creator.handle === '@degen_eth');
  const likedMarkets = [MOCK_MARKETS[2], MOCK_MARKETS[4]]; // Random selection

  const handleBet = (market: PredictionMarket, type: BetType) => {
    console.log("Bet clicked on profile", market.id, type);
  };

  const renderContent = () => {
    let data = userBets;
    let emptyMsg = "No bets placed yet.";

    if (activeTab === 'created') {
        data = createdMarkets;
        emptyMsg = "No markets created yet.";
    } else if (activeTab === 'likes') {
        data = likedMarkets;
        emptyMsg = "No liked markets yet.";
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-[#86868b]">
                <div className="bg-[#f5f5f7] rounded-full p-6 mb-4">
                     <Ghost size={40} className="opacity-50" />
                </div>
                <p className="font-medium">{emptyMsg}</p>
            </div>
        );
    }

    return data.map(market => (
        <div key={market.id} className="relative animate-in fade-in duration-300">
            {activeTab === 'bets' && (
                <div className="px-5 pt-4 pb-1 text-[11px] font-semibold text-[#86868b] flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
                    <span>You bet YES • $500.00</span>
                </div>
            )}
            <PredictionCard market={market} onBet={handleBet} />
        </div>
    ));
  };

  const TabButton = ({ id, label }: { id: ProfileTab, label: string }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className="flex-1 py-4 hover:bg-[#f5f5f7] transition-colors duration-200 relative"
      >
          <span className={cn("font-semibold text-sm transition-colors duration-200", activeTab === id ? "text-[#1d1d1f]" : "text-[#86868b]")}>
            {label}
          </span>
          {activeTab === id && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#ffd700] rounded-full"></div>
          )}
      </button>
  );

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200 group">
            <ArrowLeft size={20} className="text-[#86868b] group-hover:text-[#1d1d1f]" />
        </button>
        <div>
            <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f]">Degen Trader</h1>
            <p className="text-xs text-[#86868b]">1,240 Bets</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-[#ffd700] via-[#ffeb3b] to-[#fff9e6] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="px-5 relative mb-4">
        <div className="absolute -top-14 sm:-top-16 left-5">
            <LazyImage 
                src="https://picsum.photos/id/100/200/200" 
                alt="Me" 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover bg-white shadow-lg" 
            />
        </div>
        <div className="flex justify-end py-3">
            <button className="px-5 py-2 border border-[#e5e5ea] rounded-xl font-semibold text-sm hover:bg-[#f5f5f7] hover:border-[#ffd700] transition-all duration-200 active:scale-95 text-[#1d1d1f]">
                Edit Profile
            </button>
        </div>

        <div className="mt-3">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] flex items-center gap-2">
                Degen Trader
            </h2>
            <p className="text-[#86868b] font-medium">@degen_eth</p>
            
            <p className="mt-4 text-[#1d1d1f] text-[15px] leading-relaxed max-w-md">
                Full-time crypto speculator. Betting on volatility. <br />
                Not financial advice. 🚀
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[#86868b] text-sm">
                <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-default">
                    <MapPin size={16} /> <span>Metaverse</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#ffd700] transition-colors duration-200 cursor-pointer">
                    <LinkIcon size={16} /> <a href="#">degentrader.eth</a>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-default">
                    <Calendar size={16} /> <span>Joined September 2021</span>
                </div>
            </div>

            <div className="flex gap-6 mt-5 text-sm">
                <div className="hover:underline cursor-pointer group">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ffd700] transition-colors duration-200">420</span> <span className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors duration-200">Following</span>
                </div>
                <div className="hover:underline cursor-pointer group">
                    <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ffd700] transition-colors duration-200">6.9K</span> <span className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors duration-200">Followers</span>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] bg-white">
          <TabButton id="bets" label="Bets" />
          <TabButton id="created" label="Created" />
          <TabButton id="likes" label="Likes" />
      </div>

      {/* Content List */}
      <div className="min-h-[200px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Profile;