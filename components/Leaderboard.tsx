import React, { useState } from 'react';
import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, Medal, Crown } from 'lucide-react';
import { cn, formatCurrency } from '../utils';

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
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-slate-800">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Crown className="text-yellow-500 fill-yellow-500/20" /> Leaderboard
        </h1>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setTimeframe('weekly')}
              className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", timeframe === 'weekly' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
            >
              Weekly
            </button>
            <button 
              onClick={() => setTimeframe('alltime')}
              className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", timeframe === 'alltime' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
            >
              All Time
            </button>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {/* Header */}
        <div className="grid grid-cols-12 px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-6 sm:col-span-7 pl-2">Trader</div>
          <div className="col-span-4 sm:col-span-4 text-right">Net PnL</div>
        </div>

        {LEADERBOARD_DATA.map((user) => {
          let rankStyle = "text-slate-400 font-mono";
          let rowBg = "hover:bg-slate-900/40";
          let medal = null;

          if (user.rank === 1) {
             rankStyle = "text-yellow-400 font-black text-xl drop-shadow-sm";
             rowBg = "bg-gradient-to-r from-yellow-500/10 to-transparent hover:from-yellow-500/15";
             medal = <Medal className="w-6 h-6 text-yellow-500 fill-yellow-500/20 absolute -left-1 top-1/2 -translate-y-1/2" />;
          } else if (user.rank === 2) {
             rankStyle = "text-slate-300 font-black text-xl";
             rowBg = "bg-gradient-to-r from-slate-400/10 to-transparent hover:from-slate-400/15";
             medal = <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20 absolute -left-1 top-1/2 -translate-y-1/2" />;
          } else if (user.rank === 3) {
             rankStyle = "text-amber-700 font-black text-xl";
             rowBg = "bg-gradient-to-r from-amber-700/10 to-transparent hover:from-amber-700/15";
             medal = <Medal className="w-5 h-5 text-amber-700 fill-amber-700/20 absolute -left-1 top-1/2 -translate-y-1/2" />;
          }

          return (
            <div key={user.rank} className={cn("grid grid-cols-12 px-6 py-4 transition-all items-center group cursor-pointer animate-in slide-in-from-bottom-2 duration-500 border-l-2 border-transparent", rowBg)} style={{ animationDelay: `${user.rank * 50}ms`, borderLeftColor: user.rank === 1 ? '#eab308' : 'transparent'}}>
              
              {/* Rank */}
              <div className="col-span-2 sm:col-span-1 flex justify-center relative h-full">
                <span className={cn(rankStyle, "relative z-10")}>
                    {user.rank <= 3 ? user.rank : `#${user.rank}`}
                </span>
              </div>

              {/* User */}
              <div className="col-span-6 sm:col-span-7 flex items-center gap-4 pl-2">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className={cn(
                        "w-12 h-12 rounded-full object-cover border-2",
                        user.rank === 1 ? "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" : 
                        user.rank === 2 ? "border-slate-400" : 
                        user.rank === 3 ? "border-amber-700" : "border-slate-800"
                    )} 
                  />
                  {user.rank <= 3 && (
                      <div className="absolute -top-2 -right-2 bg-slate-950 rounded-full p-0.5 border border-slate-800 shadow-sm">
                          <Crown size={12} className={cn("fill-current", user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-slate-300" : "text-amber-700")} />
                      </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate text-[15px] group-hover:text-blue-400 transition-colors">
                      {user.name}
                  </div>
                  <div className="text-slate-500 text-xs truncate font-medium">{user.handle}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-4 sm:col-span-4 text-right flex flex-col items-end justify-center">
                <div className={cn("font-bold font-mono text-[15px]", user.profit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {user.profit > 0 ? '+' : ''}{formatCurrency(user.profit)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${user.winRate}%`}}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{user.winRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-500">
            Leaderboard updates every 5 minutes • Top 3 receive weekly NFT rewards
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;