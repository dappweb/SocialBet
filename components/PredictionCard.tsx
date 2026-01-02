import React, { memo } from 'react';
import { MessageCircle, Share2, BarChart2, MoreHorizontal, CheckCircle2, TrendingUp } from 'lucide-react';
import { PredictionMarket } from '../types';
import { cn, formatNumber, formatCurrency } from '../utils';
import AIPredictionBadge from './AIPredictionBadge';
import LazyImage from './LazyImage';

interface PredictionCardProps {
  market: PredictionMarket;
  onBet: (market: PredictionMarket, type: 'YES' | 'NO') => void;
}

const PredictionCard: React.FC<PredictionCardProps> = memo(({ market, onBet }) => {
  const yesPercentage = Math.round(market.outcomeStats.yesPercent);
  const noPercentage = Math.round(market.outcomeStats.noPercent);

  return (
    <div className="border-b border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-black hover:bg-[#fafafa] dark:hover:bg-[#1c1c1e] transition-all duration-200 cursor-pointer group relative overflow-hidden">
      <div className="p-5 flex gap-4">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <LazyImage
            src={market.creator.avatar} 
            alt={market.creator.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-[#e5e5ea] dark:border-[#38383a] group-hover:border-[#ffd700]/30 transition-all duration-200"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-semibold text-[#1d1d1f] dark:text-white truncate text-[15px] hover:underline decoration-[#86868b] dark:decoration-[#a1a1a6] underline-offset-2">
                {market.creator.name}
              </span>
              {market.creator.isVerified && (
                <CheckCircle2 size={16} className="text-[#ffd700] fill-[#fff9e6] dark:fill-[#332d1a]" />
              )}
              <span className="text-[#86868b] dark:text-[#a1a1a6] text-[14px] truncate">{market.creator.handle}</span>
              <span className="text-[#c7c7cc] dark:text-[#636366] text-[10px] align-middle">•</span>
              <span className="text-[#86868b] dark:text-[#a1a1a6] text-[14px]">2h</span>
            </div>
            <button className="text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white p-2 -mr-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Question */}
          <div className="mb-4">
             {market.isHot && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fff9e6] dark:bg-[#332d1a] border border-[#ffd700]/30 text-[11px] font-semibold text-[#ffc107] mb-2 tracking-wide uppercase shadow-sm">
                <TrendingUp size={12} strokeWidth={2.5} /> Trending
              </div>
             )}
             {/* AI Prediction Badge */}
             <AIPredictionBadge market={market} />
            <h2 className="text-[17px] leading-snug text-[#1d1d1f] dark:text-white font-semibold pr-4 group-hover:text-[#ffd700] transition-colors duration-200">
              {market.question}
            </h2>
            
            {/* Market Image if available */}
            {market.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#1c1c1e] shadow-sm">
                    <LazyImage 
                      src={market.image} 
                      alt="Market" 
                      className="w-full h-auto max-h-[300px] object-cover hover:scale-[1.02] transition-transform duration-300" 
                    />
                </div>
            )}

            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#38383a] hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] hover:border-[#ffd700]/30 transition-colors duration-200">
                {market.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#38383a]">
                Ends {new Date(market.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Chart/Visual Bar */}
          <div className="mb-4 relative h-12 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl overflow-hidden flex font-mono text-sm font-semibold select-none border border-[#e5e5ea] dark:border-[#38383a] shadow-sm">
            {/* YES Bar */}
            <div 
              className="relative h-full bg-gradient-to-r from-[#34c759]/20 to-[#34c759]/30 dark:from-[#30d158]/20 dark:to-[#30d158]/30 text-[#1d1d1f] dark:text-white flex items-center px-4 transition-all duration-300 group/bar hover:from-[#34c759]/30 hover:to-[#34c759]/40 dark:hover:from-[#30d158]/30 dark:hover:to-[#30d158]/40"
              style={{ width: `${yesPercentage}%` }}
            >
              <div className="flex flex-col leading-none z-10">
                <span className="text-[10px] text-[#34c759] dark:text-[#30d158] font-sans font-semibold uppercase tracking-wider mb-0.5">Yes</span>
                <span className="text-base font-bold">{yesPercentage}%</span>
              </div>
            </div>
            
            {/* NO Bar */}
            <div 
              className="relative h-full bg-gradient-to-l from-[#ff3b30]/20 to-[#ff3b30]/30 dark:from-[#ff453a]/20 dark:to-[#ff453a]/30 text-[#1d1d1f] dark:text-white flex items-center justify-end px-4 ml-auto transition-all duration-300 group/bar hover:from-[#ff3b30]/30 hover:to-[#ff3b30]/40 dark:hover:from-[#ff453a]/30 dark:hover:to-[#ff453a]/40"
              style={{ width: `${noPercentage}%` }}
            >
               <div className="flex flex-col items-end leading-none z-10">
                <span className="text-[10px] text-[#ff3b30] dark:text-[#ff453a] font-sans font-semibold uppercase tracking-wider mb-0.5">No</span>
                <span className="text-base font-bold">{noPercentage}%</span>
              </div>
            </div>

            {/* Center Separation Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#e5e5ea] dark:bg-[#38383a] -translate-x-1/2"></div>
            
            {/* Center VS Badge */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1c1c1e] border-2 border-[#e5e5ea] dark:border-[#38383a] rounded-full w-7 h-7 flex items-center justify-center text-[9px] font-bold text-[#86868b] dark:text-[#a1a1a6] shadow-sm z-20">
                VS
             </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onBet(market, 'YES'); }}
              className="relative overflow-hidden flex flex-col items-center justify-center py-3 rounded-xl bg-[#34c759]/10 hover:bg-[#34c759]/15 border border-[#34c759]/20 hover:border-[#34c759]/40 transition-all duration-200 group/btn active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              <span className="text-[#34c759] font-semibold group-hover/btn:scale-105 transition-transform relative z-10">Bet YES</span>
              <span className="text-xs text-[#34c759]/70 font-mono relative z-10 mt-0.5">Price: {Math.floor(market.outcomeStats.yesPrice * 100)}¢</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBet(market, 'NO'); }}
              className="relative overflow-hidden flex flex-col items-center justify-center py-3 rounded-xl bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 border border-[#ff3b30]/20 hover:border-[#ff3b30]/40 transition-all duration-200 group/btn active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              <span className="text-[#ff3b30] font-semibold group-hover/btn:scale-105 transition-transform relative z-10">Bet NO</span>
              <span className="text-xs text-[#ff3b30]/70 font-mono relative z-10 mt-0.5">Price: {Math.floor(market.outcomeStats.noPrice * 100)}¢</span>
            </button>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-[#86868b] dark:text-[#a1a1a6] text-sm pl-1">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 group/icon">
                <MessageCircle size={18} className="group-hover/icon:scale-110 transition-transform" />
                <span className="text-xs font-medium">{formatNumber(market.comments)}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 group/icon">
                <BarChart2 size={18} className="group-hover/icon:scale-110 transition-transform" />
                <span className="text-xs font-medium">{formatCurrency(market.poolSize)}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 group/icon">
                <Share2 size={18} className="group-hover/icon:scale-110 transition-transform" />
              </button>
            </div>
            
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium px-2.5 py-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg border border-[#e5e5ea] dark:border-[#38383a]">
               Vol: {formatNumber(market.volume)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

PredictionCard.displayName = 'PredictionCard';

export default PredictionCard;
