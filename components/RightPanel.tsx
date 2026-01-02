import React, { useState, useMemo, memo, useCallback } from 'react';
import { Search, MoreHorizontal, TrendingUp, Sparkles, Coins } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';

interface RightPanelProps {
  onTradeClick?: () => void;
  onStakeClick?: () => void;
  onTokenSaleClick?: () => void;
}

const TrendingItem = ({ category, title, posts }: { category: string, title: string, posts: string }) => (
  <div className="py-3 px-4 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200 cursor-pointer relative">
    <div className="flex justify-between items-start">
      <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">{category} • Trending</div>
      <MoreHorizontal size={14} className="text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white" />
    </div>
    <div className="font-semibold text-sm text-[#1d1d1f] dark:text-white mt-0.5">{title}</div>
    <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">{posts} bets placed</div>
  </div>
);

const RightPanel = memo(({ onTradeClick, onStakeClick, onTokenSaleClick }: RightPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}"...`, 'info');
      // In production, this would trigger a search
    }
  }, [searchQuery, showToast]);

  return (
    <div className="w-full py-6 pl-4 pr-6">

      {/* Search */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl pb-3 z-10 transition-colors duration-300">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#86868b] dark:text-[#a1a1a6] group-focus-within:text-[#ffd700] transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 rounded-xl leading-5 bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-[#a1a1a6] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] focus:border-[#ffd700] transition-all duration-200 shadow-sm"
            placeholder="Search markets"
          />
        </form>
      </div>

      {/* SOUL Token Trading CTA */}
      {(onTradeClick || onStakeClick) && (
        <div className="mt-4 space-y-3">
          {onTradeClick && (
            <div className="bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-2xl p-5 shadow-lg shadow-[#ffd700]/20 border border-[#ffd700]/30">
              <div className="flex items-center gap-3 mb-3">
                <Coins size={24} className="text-[#1d1d1f]" />
                <h3 className="font-semibold text-[#1d1d1f]">Trade SOUL Tokens</h3>
              </div>
              <p className="text-sm text-[#1d1d1f]/80 mb-4">
                Buy or sell SOUL tokens with fiat or crypto. Support platform operations.
              </p>
              <button
                onClick={onTradeClick}
                className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
              >
                Start Trading
              </button>
            </div>
          )}
          {onStakeClick && (
            <div className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] rounded-2xl p-5 shadow-lg border border-[#e5e5ea]">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={24} className="text-[#ffd700]" />
                <h3 className="font-semibold text-white">Stake SOUL Tokens</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Earn rewards by staking your SOUL tokens. Support the platform and grow your holdings.
              </p>
              <button
                onClick={onStakeClick}
                className="w-full bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
              >
                Start Staking
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Predictions Section */}
      <div className="mt-4 bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
            <Sparkles className="text-[#ffd700]" size={18} />
            AI Predictions
          </h2>
        </div>
        <div className="px-4 pb-4 space-y-3">
          <div className="p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-[#ffd700]" />
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">Bitcoin Price</span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">AI predicts 75% chance BTC hits $100k by Q2 2024</p>
          </div>
          <div className="p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-[#ffd700]" />
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">Election Outcome</span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">AI suggests 68% probability of current trend continuing</p>
          </div>
        </div>
      </div>

      {/* Trending Box */}
      <div className="mt-4 bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <h2 className="px-4 pt-4 pb-2 text-lg font-semibold text-[#1d1d1f] dark:text-white">Trends for you</h2>

        <TrendingItem
          category="Politics"
          title="US Election 2024"
          posts="1.2M"
        />
        <TrendingItem
          category="Crypto"
          title="$SOL vs $ETH"
          posts="450K"
        />
        <TrendingItem
          category="Sports"
          title="Super Bowl LVIII"
          posts="125K"
        />
        <TrendingItem
          category="Technology"
          title="Sam Altman"
          posts="89K"
        />

        <div className="p-4 text-[#ffd700] text-sm hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] cursor-pointer transition-colors duration-200 font-medium">
          Show more
        </div>
      </div>

      {/* Who to follow */}
      <div className="mt-4 bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shadow-sm">
        <h2 className="px-4 pt-4 pb-2 text-lg font-semibold text-[#1d1d1f]">Who to follow</h2>

        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 hover:bg-[#f5f5f7] transition-colors duration-200 cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LazyImage src={`https://picsum.photos/id/${50 + i}/50/50`} className="w-10 h-10 rounded-full border-2 border-[#e5e5ea]" alt="avatar" />
              <div>
                <div className="font-semibold text-sm hover:underline text-[#1d1d1f]">Oracle {i}</div>
                <div className="text-[#86868b] text-xs">@oracle_{i}</div>
              </div>
            </div>
            <button className="bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm">
              Follow
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-[#86868b] px-4 leading-relaxed">
        Terms of Service • Privacy Policy • Cookie Policy • Accessibility • Ads info • More<br />
        © 2025 SoulCast, Inc.
      </div>
    </div>
  );
});

RightPanel.displayName = 'RightPanel';

export default RightPanel;
