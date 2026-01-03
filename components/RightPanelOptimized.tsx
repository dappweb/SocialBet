import React, { useState, useMemo, memo, useCallback } from 'react';
import { Search, MoreHorizontal, TrendingUp, Sparkles, Coins, Users, Clock, Zap, Award, Flame, Target } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';

interface RightPanelOptimizedProps {
  onTradeClick?: () => void;
  onStakeClick?: () => void;
  onTokenSaleClick?: () => void;
}

const TrendingItem = ({ 
  category, 
  title, 
  posts, 
  change, 
  isHot = false 
}: { 
  category: string; 
  title: string; 
  posts: string; 
  change?: string;
  isHot?: boolean;
}) => (
  <div className={cn(
    "py-3 px-4 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200 cursor-pointer relative",
    isHot && "bg-[#ffd700]/5 dark:bg-[#ffd700]/10"
  )}>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">{category}</span>
          {isHot && <Flame size={12} className="text-[#ff3b30]" />}
          {change && <span className="text-xs text-[#34c759] font-medium">{change}</span>}
        </div>
        <div className="font-semibold text-sm text-[#1d1d1f] dark:text-white mt-0.5 line-clamp-2">{title}</div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">{posts} bets</div>
      </div>
      <MoreHorizontal size={14} className="text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white ml-2 flex-shrink-0" />
    </div>
  </div>
);

const LeaderboardItem = ({ rank, name, avatar, winnings, trend }: {
  rank: number;
  name: string;
  avatar: string;
  winnings: string;
  trend: 'up' | 'down' | 'same';
}) => (
  <div className="flex items-center gap-3 py-2 px-3 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors duration-200 cursor-pointer">
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
      rank === 1 ? "bg-[#ffd700] text-[#1d1d1f]" :
      rank === 2 ? "bg-[#c0c0c0] text-[#1d1d1f]" :
      rank === 3 ? "bg-[#cd7f32] text-white" :
      "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b]"
    )}>
      {rank}
    </div>
    <LazyImage src={avatar} className="w-8 h-8 rounded-full" alt={name} />
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm text-[#1d1d1f] dark:text-white truncate">{name}</div>
      <div className="text-xs text-[#ffd700] font-medium">{winnings}</div>
    </div>
    {trend === 'up' && <TrendingUp size={12} className="text-[#34c759]" />}
    {trend === 'down' && <TrendingUp size={12} className="text-[#ff3b30] rotate-180" />}
  </div>
);

const RightPanelOptimized = memo(({ onTradeClick, onStakeClick, onTokenSaleClick }: RightPanelOptimizedProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'search' | 'tokens' | 'trending' | 'leaderboard' | 'ai'>('search');
  const { showToast } = useToast();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}"...`, 'info');
    }
  }, [searchQuery, showToast]);

  // Mock data for enhanced features
  const topTraders = useMemo(() => [
    { rank: 1, name: 'CryptoKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king', winnings: '$125,430', trend: 'up' as const },
    { rank: 2, name: 'OracleMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oracle', winnings: '$89,250', trend: 'up' as const },
    { rank: 3, name: 'BetWhale', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=whale', winnings: '$67,890', trend: 'down' as const },
    { rank: 4, name: 'LuckyTrader', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucky', winnings: '$45,120', trend: 'up' as const },
    { rank: 5, name: 'SharpMind', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sharp', winnings: '$32,450', trend: 'same' as const },
  ], []);

  const enhancedTrends = useMemo(() => [
    { category: 'Crypto', title: 'Bitcoin ETF Approval Odds', posts: '2.3M', change: '+15%', isHot: true },
    { category: 'Politics', title: 'US Election 2024 Winner', posts: '1.8M', change: '+8%', isHot: true },
    { category: 'Sports', title: 'Super Bowl LVIII Champion', posts: '450K', change: '+3%', isHot: false },
    { category: 'Tech', title: 'GPT-5 Release Timeline', posts: '320K', change: '+12%', isHot: false },
    { category: 'Crypto', title: 'Ethereum Shanghai Upgrade', posts: '280K', change: '-2%', isHot: false },
    { category: 'Pop Culture', title: 'Taylor Swift New Album', posts: '125K', change: '+5%', isHot: false },
  ], []);

  return (
    <div className="w-full py-6 pl-4 pr-6 space-y-4">
      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'tokens', label: 'Tokens', icon: Coins },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'leaderboard', label: 'Top', icon: Award },
          { id: 'ai', label: 'AI', icon: Sparkles },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors duration-200",
              activeSection === id 
                ? "bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white shadow-sm" 
                : "text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white"
            )}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Search Section */}
      {activeSection === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#86868b] dark:text-[#a1a1a6] group-focus-within:text-[#ffd700] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-[#a1a1a6] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] focus:border-[#ffd700] transition-all duration-200"
              placeholder="Search markets, users, topics..."
            />
          </form>
          
          {/* Quick Search Suggestions */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] px-2">Popular Searches</div>
            {['Bitcoin', 'Election 2024', 'Super Bowl', 'GPT-5', 'Solana'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="w-full text-left px-3 py-2 text-sm text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors duration-200"
              >
                🔍 {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tokens Section */}
      {activeSection === 'tokens' && (
        <div className="space-y-4">
          {/* SOUL Token Trading CTA */}
          {(onTradeClick || onStakeClick) && (
            <div className="space-y-3">
              {onTradeClick && (
                <div className="bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-2xl p-4 shadow-lg shadow-[#ffd700]/20 border border-[#ffd700]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Coins size={20} className="text-[#1d1d1f]" />
                    <h3 className="font-semibold text-[#1d1d1f] text-sm">Trade SOUL</h3>
                  </div>
                  <p className="text-xs text-[#1d1d1f]/80 mb-3">
                    Buy/sell SOUL tokens
                  </p>
                  <button
                    onClick={onTradeClick}
                    className="w-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200"
                  >
                    Trade Now
                  </button>
                </div>
              )}
              {onStakeClick && (
                <div className="bg-gradient-to-br from-[#1d1d1f] to-[#2d2d2f] rounded-2xl p-4 shadow-lg border border-[#e5e5ea]">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles size={20} className="text-[#ffd700]" />
                    <h3 className="font-semibold text-white text-sm">Stake SOUL</h3>
                  </div>
                  <p className="text-xs text-white/80 mb-3">
                    Earn up to 15% APY
                  </p>
                  <button
                    onClick={onStakeClick}
                    className="w-full bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200"
                  >
                    Start Staking
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Token Stats */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-2xl p-4">
            <h3 className="font-semibold text-[#1d1d1f] dark:text-white text-sm mb-3">SOUL Token Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Price</span>
                <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">$0.85</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">24h Change</span>
                <span className="text-sm font-medium text-[#34c759]">+5.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Market Cap</span>
                <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">$8.5M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">24h Volume</span>
                <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">$1.2M</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Section */}
      {activeSection === 'trending' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <TrendingUp className="text-[#ffd700]" size={16} />
              Trending Markets
            </h2>
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Last 24h</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {enhancedTrends.map((trend, index) => (
              <TrendingItem key={index} {...trend} />
            ))}
          </div>
          <div className="p-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
            <button className="w-full text-center text-[#ffd700] text-sm hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] py-2 rounded-lg transition-colors duration-200 font-medium">
              View All Trends
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      {activeSection === 'leaderboard' && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <Award className="text-[#ffd700]" size={16} />
              Top Traders
            </h2>
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">This Week</span>
          </div>
          <div className="px-4 pb-4 space-y-1">
            {topTraders.map((trader) => (
              <LeaderboardItem key={trader.rank} {...trader} />
            ))}
          </div>
          <div className="p-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
            <button className="w-full text-center text-[#ffd700] text-sm hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] py-2 rounded-lg transition-colors duration-200 font-medium">
              View Full Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* AI Predictions Section */}
      {activeSection === 'ai' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Sparkles className="text-[#ffd700]" size={16} />
                AI Predictions
              </h2>
              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Updated 5m ago</span>
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div className="p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-[#ffd700]" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">Bitcoin</span>
                  <span className="px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">75%</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">BTC hits $100k by Q2 2024</p>
              </div>
              <div className="p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-[#ffd700]" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">Election</span>
                  <span className="px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">68%</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Current trend continues</p>
              </div>
              <div className="p-3 bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl border border-[#ffd700]/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-[#ffd700]" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">ETH Gas</span>
                  <span className="px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] rounded-full text-xs font-medium">82%</span>
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Gas fees drop below 10 gwei</p>
              </div>
            </div>
          </div>

          {/* AI Chat Button */}
          <button className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] hover:from-[#ffeb3b] hover:to-[#ffd700] text-[#1d1d1f] font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Chat with AI Assistant
          </button>
        </div>
      )}
    </div>
  );
});

RightPanelOptimized.displayName = 'RightPanelOptimized';

export default RightPanelOptimized;
