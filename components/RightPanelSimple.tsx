import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ArrowRightLeft,
  Gift,
  Vote,
  Flame,
  Users,
  FileText,
  Crown,
  Coins,
  BarChart3,
  Trophy,
  Zap
} from 'lucide-react';
import { cn } from '../utils';

interface RightPanelSimpleProps {
  onTradeClick?: () => void;
  onStakeClick?: () => void;
  onTokenSaleClick?: () => void;
  onNavigate?: (view: string) => void;
}

const RightPanelSimple: React.FC<RightPanelSimpleProps> = ({
  onTradeClick,
  onStakeClick,
  onTokenSaleClick,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'search' | 'tokens'>('trending');

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'tokens', label: 'Tokens', icon: Wallet },
  ];

  const trendingItems = [
    { title: 'Bitcoin reaches $100k', change: '+12.5%', positive: true, volume: '$2.3M' },
    { title: 'Ethereum upgrade successful', change: '+8.2%', positive: true, volume: '$1.8M' },
    { title: 'Solana network congestion', change: '-5.1%', positive: false, volume: '$980K' },
    { title: 'Cardano partnership announced', change: '+15.3%', positive: true, volume: '$1.2M' },
  ];

  const topKOLs = [
    { name: 'Vitalik Fan', handle: '@vitalik_eth', accuracy: 92, avatar: 'V', trend: '+3%' },
    { name: 'CryptoKing', handle: '@crypto_king', accuracy: 89, avatar: 'C', trend: '+1%' },
    { name: 'SportsCenter AI', handle: '@sports_bot', accuracy: 85, avatar: 'S', trend: '-2%' },
  ];

  const platformStats = {
    tvl: '$2.5M',
    markets: '1,234',
    users: '12.5K',
    volume24h: '$580K',
  };

  const soulPrice = {
    price: 0.85,
    change: 5.2,
    positive: true,
  };

  const TrendingItem: React.FC<{
    title: string;
    change: string;
    positive: boolean;
    volume: string;
  }> = ({ title, change, positive, volume }) => (
    <div className="p-3 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-[#1d1d1f] dark:text-white text-sm leading-tight">
          {title}
        </h4>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          positive ? "text-green-600" : "text-red-600"
        )}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#86868b] dark:text-[#a1a1a6]">
        <Activity size={12} />
        <span>{volume} volume</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Features Section - Quick Access */}
      <div className="p-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => onNavigate?.('swap')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <ArrowRightLeft size={18} className="text-blue-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">Swap</span>
          </button>
          <button
            onClick={() => onNavigate?.('airdrop')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Gift size={18} className="text-purple-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">空投</span>
          </button>
          <button
            onClick={() => onNavigate?.('red-envelope')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Sparkles size={18} className="text-red-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">红包</span>
          </button>
          <button
            onClick={() => onNavigate?.('referral')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Users size={18} className="text-pink-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">推荐</span>
          </button>
          <button
            onClick={() => onNavigate?.('dao')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Vote size={18} className="text-green-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">DAO</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-1.5">
          <button
            onClick={() => onNavigate?.('lp-mining')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Flame size={18} className="text-orange-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">LP挖矿</span>
          </button>
          <button
            onClick={() => onNavigate?.('ambassador')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Crown size={18} className="text-yellow-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">大使</span>
          </button>
          <button
            onClick={() => onNavigate?.('buyback-burn')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <Coins size={18} className="text-amber-600" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">回购</span>
          </button>
          <button
            onClick={() => onNavigate?.('whitepaper')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors"
          >
            <FileText size={18} className="text-gray-500" />
            <span className="text-[9px] font-medium text-[#86868b] dark:text-[#a1a1a6]">文档</span>
          </button>
        </div>
      </div>

      {/* Platform Stats + SOUL Price */}
      <div className="p-3 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <div className="bg-gradient-to-r from-[#ffd700]/10 to-[#ffeb3b]/10 dark:from-[#ffd700]/5 dark:to-[#ffeb3b]/5 rounded-xl p-3 mb-3 border border-[#ffd700]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ffd700] rounded-lg flex items-center justify-center">
                <Coins size={16} className="text-[#1d1d1f]" />
              </div>
              <div>
                <div className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">SOUL Price</div>
                <div className="font-bold text-[#1d1d1f] dark:text-white">${soulPrice.price.toFixed(2)}</div>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-0.5 text-sm font-semibold",
              soulPrice.positive ? "text-green-500" : "text-red-500"
            )}>
              {soulPrice.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {soulPrice.positive ? '+' : ''}{soulPrice.change}%
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg p-2 text-center">
            <div className="text-[9px] text-[#86868b] dark:text-[#a1a1a6]">TVL</div>
            <div className="font-bold text-[#1d1d1f] dark:text-white text-xs">{platformStats.tvl}</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg p-2 text-center">
            <div className="text-[9px] text-[#86868b] dark:text-[#a1a1a6]">24h</div>
            <div className="font-bold text-[#1d1d1f] dark:text-white text-xs">{platformStats.volume24h}</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg p-2 text-center">
            <div className="text-[9px] text-[#86868b] dark:text-[#a1a1a6]">Markets</div>
            <div className="font-bold text-[#1d1d1f] dark:text-white text-xs">{platformStats.markets}</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg p-2 text-center">
            <div className="text-[9px] text-[#86868b] dark:text-[#a1a1a6]">Users</div>
            <div className="font-bold text-[#1d1d1f] dark:text-white text-xs">{platformStats.users}</div>
          </div>
        </div>
      </div>

      {/* Top KOLs */}
      <div className="p-3 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white text-xs flex items-center gap-1">
            <Trophy size={12} className="text-[#ffd700]" />
            Top KOLs
          </h3>
          <button className="text-[10px] text-[#ffd700] font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-1.5">
          {topKOLs.map((kol, index) => (
            <div key={index} className="flex items-center gap-2 p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] rounded-lg transition-colors cursor-pointer">
              <span className="text-[10px] font-bold text-[#ffd700] w-4">#{index + 1}</span>
              <div className="w-6 h-6 bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-full flex items-center justify-center font-bold text-[#1d1d1f] text-[10px]">
                {kol.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1d1d1f] dark:text-white text-xs truncate">{kol.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-green-500">{kol.accuracy}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? "text-[#ffd700] border-b-2 border-[#ffd700]"
                : "text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white"
            )}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'trending' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Trending Markets</h3>
              <Sparkles size={16} className="text-[#ffd700]" />
            </div>
            {trendingItems.map((item, index) => (
              <TrendingItem key={index} {...item} />
            ))}
            <button className="w-full py-2 text-center text-sm text-[#ffd700] font-medium hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] rounded-lg transition-colors duration-200">
              Show more
            </button>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6]" />
              <input
                type="text"
                placeholder="Search markets..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-[#a1a1a6] focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
              />
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg">
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Search for markets, users, or topics</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1d1d1f] dark:text-white">SOUL Token</h3>
            
            {/* SOUL Token Actions */}
            <div className="space-y-2">
              <button
                onClick={onTradeClick}
                className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Trade SOUL
              </button>
              <button
                onClick={onStakeClick}
                className="w-full py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white font-semibold rounded-xl hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] transition-colors duration-200"
              >
                Stake SOUL
              </button>
              <button
                onClick={onTokenSaleClick}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Buy SOUL
              </button>
            </div>

            {/* Token Stats */}
            <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Current Price</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">$0.85</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">24h Change</span>
                <span className="font-semibold text-green-600">+5.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Market Cap</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">$8.5M</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanelSimple;
