import React, { useState } from 'react';
import { Calendar, Link as LinkIcon, MapPin, ArrowLeft, Ghost } from 'lucide-react';
import { MOCK_MARKETS } from '../constants';
import PredictionCard from './PredictionCard';
import { PredictionMarket, BetType } from '../types';
import { cn } from '../utils';

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
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                <div className="bg-slate-900 rounded-full p-6 mb-4">
                     <Ghost size={40} className="opacity-50" />
                </div>
                <p className="font-medium">{emptyMsg}</p>
            </div>
        );
    }

    return data.map(market => (
        <div key={market.id} className="relative animate-in fade-in duration-300">
            {activeTab === 'bets' && (
                <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
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
        className="flex-1 py-4 hover:bg-white/5 transition-colors relative"
      >
          <span className={cn("font-bold text-sm transition-colors", activeTab === id ? "text-white" : "text-slate-500")}>
            {label}
          </span>
          {activeTab === id && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
          )}
      </button>
  );

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-slate-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
            <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
        </button>
        <div>
            <h1 className="font-bold text-lg leading-5">Degen Trader</h1>
            <p className="text-xs text-slate-500">1,240 Bets</p>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="px-5 relative mb-4">
        <div className="absolute -top-14 sm:-top-16 left-5">
            <img 
                src="https://picsum.photos/id/100/200/200" 
                alt="Me" 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-black object-cover bg-slate-900 shadow-xl" 
            />
        </div>
        <div className="flex justify-end py-3">
            <button className="px-5 py-2 border border-slate-700 rounded-full font-bold text-sm hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95">
                Edit Profile
            </button>
        </div>

        <div className="mt-3">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Degen Trader
            </h2>
            <p className="text-slate-500 font-medium">@degen_eth</p>
            
            <p className="mt-4 text-slate-300 text-[15px] leading-relaxed max-w-md">
                Full-time crypto speculator. Betting on volatility. <br />
                Not financial advice. 🚀
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-default">
                    <MapPin size={16} /> <span>Metaverse</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer">
                    <LinkIcon size={16} /> <a href="#">degentrader.eth</a>
                </div>
                <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-default">
                    <Calendar size={16} /> <span>Joined September 2021</span>
                </div>
            </div>

            <div className="flex gap-6 mt-5 text-sm">
                <div className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white">420</span> <span className="text-slate-500 group-hover:text-slate-400">Following</span>
                </div>
                <div className="hover:underline cursor-pointer group">
                    <span className="font-bold text-white group-hover:text-white">6.9K</span> <span className="text-slate-500 group-hover:text-slate-400">Followers</span>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
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