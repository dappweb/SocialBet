import React, { useState } from 'react';
import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, Medal, Crown } from 'lucide-react';
import { cn, formatCurrency } from '../utils';
import LazyImage from './LazyImage';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Vitalik Fan', handle: '@vitalik_eth', profit: 45200, winRate: 78, avatar: 'https://picsum.photos/id/64/200/200' },
  { rank: 2, name: 'Degen Trader', handle: '@degen_eth', profit: 32150, winRate: 62, avatar: 'https://picsum.photos/id/100/100/100' },
  { rank: 3, name: 'Crypto Whale', handle: '@whale_alert', profit: 28900, winRate: 55, avatar: 'https://picsum.photos/id/237/200/200' },
  { rank: 4, name: 'Elon Stan', handle: '@doge_king', profit: 15400, winRate: 48, avatar: 'https://picsum.photos/id/22/200/200' },
  { rank: 5, name: 'Prediction God', handle: '@oracle_v1', profit: 12200, winRate: 85, avatar: 'https://picsum.photos/id/55/200/200' },
  { rank: 6, name: 'Bear Market', handle: '@short_everything', profit: -4500, winRate: 30, avatar: 'https://picsum.photos/id/66/200/200' },
  { rank: 7, name: 'Moon Boi', handle: '@lambo_soon', profit: -8900, winRate: 15, avatar: 'https://picsum.photos/id/77/200/200' },
];

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'alltime'>('weekly');

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] px-4 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Crown className="text-[#ffd700]" /> Leaderboard
        </h1>
        <div className="flex bg-[#f5f5f7] rounded-lg p-1 border border-[#e5e5ea]">
            <button 
              onClick={() => setTimeframe('weekly')}
              className={cn("px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200", timeframe === 'weekly' ? "bg-white text-[#1d1d1f] shadow-sm text-[#ffd700]" : "text-[#86868b] hover:text-[#1d1d1f]")}
            >
              Weekly
            </button>
            <button 
              onClick={() => setTimeframe('alltime')}
              className={cn("px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200", timeframe === 'alltime' ? "bg-white text-[#1d1d1f] shadow-sm text-[#ffd700]" : "text-[#86868b] hover:text-[#1d1d1f]")}
            >
              All Time
            </button>
        </div>
      </div>

      <div className="divide-y divide-[#e5e5ea]">
        {/* Header */}
        <div className="grid grid-cols-12 px-6 py-3 text-[11px] font-semibold text-[#86868b] uppercase tracking-widest bg-[#f5f5f7]">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-6 sm:col-span-7 pl-2">Trader</div>
          <div className="col-span-4 sm:col-span-4 text-right">Net PnL</div>
        </div>

        {LEADERBOARD_DATA.map((user) => {
          let rankStyle = "text-[#86868b] font-mono";
          let rowBg = "hover:bg-[#f5f5f7]";
          let medal = null;

          if (user.rank === 1) {
             rankStyle = "text-[#ffd700] font-semibold text-xl";
             rowBg = "bg-gradient-to-r from-[#fff9e6] to-transparent hover:from-[#ffeb3b]/20";
             medal = <Medal className="w-6 h-6 text-[#ffd700] absolute -left-1 top-1/2 -translate-y-1/2" />;
          } else if (user.rank === 2) {
             rankStyle = "text-[#86868b] font-semibold text-xl";
             rowBg = "bg-gradient-to-r from-[#f5f5f7] to-transparent hover:from-[#e5e5ea]";
             medal = <Medal className="w-5 h-5 text-[#86868b] absolute -left-1 top-1/2 -translate-y-1/2" />;
          } else if (user.rank === 3) {
             rankStyle = "text-[#ffc107] font-semibold text-xl";
             rowBg = "bg-gradient-to-r from-[#fff9e6] to-transparent hover:from-[#ffeb3b]/10";
             medal = <Medal className="w-5 h-5 text-[#ffc107] absolute -left-1 top-1/2 -translate-y-1/2" />;
          }

          return (
            <div key={user.rank} className={cn("grid grid-cols-12 px-6 py-4 transition-all duration-200 items-center group cursor-pointer animate-in slide-in-from-bottom-2 duration-500 border-l-2 border-transparent", rowBg)} style={{ animationDelay: `${user.rank * 50}ms`, borderLeftColor: user.rank === 1 ? '#ffd700' : 'transparent'}}>
              
              {/* Rank */}
              <div className="col-span-2 sm:col-span-1 flex justify-center relative h-full">
                <span className={cn(rankStyle, "relative z-10")}>
                    {user.rank <= 3 ? user.rank : `#${user.rank}`}
                </span>
              </div>

              {/* User */}
              <div className="col-span-6 sm:col-span-7 flex items-center gap-4 pl-2">
                <div className="relative">
                  <LazyImage
                    src={user.avatar} 
                    alt={user.name} 
                    className={cn(
                        "w-12 h-12 rounded-full object-cover border-2",
                        user.rank === 1 ? "border-[#ffd700] shadow-md shadow-[#ffd700]/20" : 
                        user.rank === 2 ? "border-[#e5e5ea]" : 
                        user.rank === 3 ? "border-[#ffc107]" : "border-[#e5e5ea]"
                    )} 
                  />
                  {user.rank <= 3 && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 border border-[#e5e5ea] shadow-sm">
                          <Crown size={12} className={cn("fill-current", user.rank === 1 ? "text-[#ffd700]" : user.rank === 2 ? "text-[#86868b]" : "text-[#ffc107]")} />
                      </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#1d1d1f] truncate text-[15px] group-hover:text-[#ffd700] transition-colors duration-200">
                      {user.name}
                  </div>
                  <div className="text-[#86868b] text-xs truncate font-medium">{user.handle}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-4 sm:col-span-4 text-right flex flex-col items-end justify-center">
                <div className={cn("font-semibold font-mono text-[15px]", user.profit >= 0 ? "text-[#34c759]" : "text-[#ff3b30]")}>
                  {user.profit > 0 ? '+' : ''}{formatCurrency(user.profit)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 w-12 bg-[#e5e5ea] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ffd700] rounded-full" style={{ width: `${user.winRate}%`}}></div>
                    </div>
                    <span className="text-[10px] text-[#86868b] font-semibold">{user.winRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] text-xs text-[#86868b]">
            Leaderboard updates every 5 minutes • Top 3 receive weekly NFT rewards
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;