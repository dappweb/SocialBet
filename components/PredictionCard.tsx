import React from 'react';
import { MessageCircle, Share2, BarChart2, MoreHorizontal, CheckCircle2, TrendingUp } from 'lucide-react';
import { PredictionMarket } from '../types';
import { cn, formatNumber, formatCurrency } from '../utils';

interface PredictionCardProps {
  market: PredictionMarket;
  onBet: (market: PredictionMarket, type: 'YES' | 'NO') => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ market, onBet }) => {
  const yesPercentage = Math.round(market.outcomeStats.yesPercent);
  const noPercentage = Math.round(market.outcomeStats.noPercent);

  return (
    <div className="border-b border-slate-800 hover:bg-slate-900/30 transition-all cursor-pointer group animate-in fade-in duration-500">
      <div className="p-5 flex gap-4">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <img 
            src={market.creator.avatar} 
            alt={market.creator.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-900 ring-1 ring-slate-800"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-slate-100 truncate text-[15px] hover:underline decoration-slate-400 underline-offset-2">
                {market.creator.name}
              </span>
              {market.creator.isVerified && (
                <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10" />
              )}
              <span className="text-slate-500 text-[14px] truncate">{market.creator.handle}</span>
              <span className="text-slate-600 text-[10px] align-middle">•</span>
              <span className="text-slate-500 text-[14px]">2h</span>
            </div>
            <button className="text-slate-500 hover:text-blue-500 p-2 -mr-2 rounded-full hover:bg-blue-500/10 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Question */}
          <div className="mb-4">
             {market.isHot && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 mb-2 tracking-wide uppercase">
                <TrendingUp size={12} strokeWidth={3} /> Trending
              </div>
             )}
            <h2 className="text-[17px] leading-snug text-slate-100 font-semibold pr-4">
              {market.question}
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50">
                {market.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50">
                Ends {new Date(market.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Chart/Visual Bar */}
          <div className="mb-4 relative h-10 bg-slate-800 rounded-lg overflow-hidden flex font-mono text-sm font-bold select-none ring-1 ring-slate-700/50">
            {/* YES Bar */}
            <div 
              className="relative h-full bg-gradient-to-r from-emerald-900/40 to-emerald-500/20 text-emerald-400 flex items-center px-4 transition-all duration-500 group/bar hover:bg-emerald-500/30"
              style={{ width: `${yesPercentage}%` }}
            >
              <div className="flex flex-col leading-none z-10">
                <span className="text-[10px] text-emerald-500/70 font-sans font-bold uppercase tracking-wider mb-0.5">Yes</span>
                <span className="text-lg">{yesPercentage}%</span>
              </div>
            </div>
            
            {/* NO Bar */}
            <div 
              className="relative h-full bg-gradient-to-l from-rose-900/40 to-rose-500/20 text-rose-400 flex items-center justify-end px-4 ml-auto transition-all duration-500 group/bar hover:bg-rose-500/30"
              style={{ width: `${noPercentage}%` }}
            >
               <div className="flex flex-col items-end leading-none z-10">
                <span className="text-[10px] text-rose-500/70 font-sans font-bold uppercase tracking-wider mb-0.5">No</span>
                <span className="text-lg">{noPercentage}%</span>
              </div>
            </div>

            {/* Center Separation Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-700/50 -translate-x-1/2"></div>
            
            {/* Center VS Badge */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-[9px] font-black text-slate-500 shadow-sm z-20">
                VS
             </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onBet(market, 'YES'); }}
              className="relative overflow-hidden flex flex-col items-center justify-center py-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group/btn active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <span className="text-emerald-400 font-bold group-hover/btn:scale-105 transition-transform relative z-10">Bet YES</span>
              <span className="text-xs text-emerald-500/60 font-mono relative z-10 mt-0.5">Price: {Math.floor(market.outcomeStats.yesPrice * 100)}¢</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBet(market, 'NO'); }}
              className="relative overflow-hidden flex flex-col items-center justify-center py-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all group/btn active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              <span className="text-rose-400 font-bold group-hover/btn:scale-105 transition-transform relative z-10">Bet NO</span>
              <span className="text-xs text-rose-500/60 font-mono relative z-10 mt-0.5">Price: {Math.floor(market.outcomeStats.noPrice * 100)}¢</span>
            </button>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-slate-500 text-sm pl-1">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group/icon">
                <MessageCircle size={18} className="group-hover/icon:scale-110 transition-transform" />
                <span className="text-xs font-medium">{formatNumber(market.comments)}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-400 transition-colors group/icon">
                <BarChart2 size={18} className="group-hover/icon:scale-110 transition-transform" />
                <span className="text-xs font-medium">{formatCurrency(market.poolSize)}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group/icon">
                <Share2 size={18} className="group-hover/icon:scale-110 transition-transform" />
              </button>
            </div>
            
            <span className="text-xs text-slate-500/80 font-medium px-2 py-1 bg-slate-900/50 rounded border border-slate-800/50">
               Vol: {formatNumber(market.volume)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;