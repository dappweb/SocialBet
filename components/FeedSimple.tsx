import React, { useState, useMemo, useCallback } from 'react';
import { Activity, TrendingUp, Trophy, Sparkles, MessageCircle, Share2, X, Gift, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { PredictionMarket, BetType } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import MarketResolutionModal from './MarketResolutionModal';
import BetModal from './BetModal';
import CreateMarketModal from './CreateMarketModal';
import CountdownTimer from './CountdownTimer';
import { marketsApi, betsApi } from '../services/api';

interface FeedProps {
  markets: PredictionMarket[];
}

type TabType = 'foryou' | 'following' | 'crypto' | 'sports';

const FeedSimple: React.FC<FeedProps> = ({ markets: initialMarkets = [] }) => {
  const [markets, setMarkets] = useState<PredictionMarket[]>(initialMarkets);
  const [activeTab, setActiveTab] = useState<TabType>('foryou');
  const [showBanner, setShowBanner] = useState(true);
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { connect, isLoading } = useWeb3Auth();
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);

  // Modal states
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isCreateMarketOpen, setIsCreateMarketOpen] = useState(false);
  const [selectedBetMarket, setSelectedBetMarket] = useState<PredictionMarket | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null);

  const handleCreateMarket = () => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    setIsCreateMarketOpen(true);
  };

  const handleConnectWallet = async () => {
    if (isLoading) {
      showToast('Web3Auth is initializing, please wait...', 'info');
      return;
    }
    try {
      showToast('Opening wallet connection...', 'info');
      await connect();
      showToast('Wallet connected successfully!', 'success');
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      showToast(error.message || 'Failed to connect wallet. Please try again.', 'error');
    }
  };

  const handlePlaceBet = useCallback(async (marketId: string, amount: number, type: BetType, blockchain?: string) => {
    try {
      await betsApi.place({
        marketId,
        amount,
        betType: type,
        priceAtBet: 0.5, // Default price, will be calculated by backend
        blockchain
      });
      showToast(`Successfully placed ${type} bet of ${amount} SOUL!`, 'success');
    } catch (error: any) {
      console.error('Bet error:', error);
      throw error;
    }
  }, [showToast]);

  const handleCreateNewMarket = useCallback(async (marketData: any) => {
    try {
      await marketsApi.create(marketData);
      showToast('Market created successfully!', 'success');
    } catch (error: any) {
      console.error('Create market error:', error);
      throw error;
    }
  }, [showToast]);

  const filteredMarkets = useMemo(() => {
    switch (activeTab) {
      case 'foryou':
        return markets;
      case 'crypto':
        return markets.filter(m => m.category === 'Crypto');
      case 'sports':
        return markets.filter(m => m.category === 'Sports');
      case 'following':
        return markets.slice(0, 5); // Mock following
      default:
        return markets;
    }
  }, [markets, activeTab]);

  const handleBet = (market: PredictionMarket, type: 'YES' | 'NO') => {
    if (!isAuthenticated) {
      showToast('Connect your wallet to place a bet.', 'warning');
      return;
    }
    setSelectedBetMarket(market);
    setSelectedBetType(type);
    setIsBetModalOpen(true);
  };

  const TabButton: React.FC<{ id: TabType; label: string; icon?: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] transition-colors duration-200",
        activeTab === id
          ? "border-b-2 border-[#ffd700] text-[#1d1d1f] dark:text-white font-semibold text-sm"
          : "text-[#86868b] dark:text-[#a1a1a6] font-medium text-sm"
      )}
    >
      {icon}
      {label}
    </button>
  );

  const MarketCard: React.FC<{ market: PredictionMarket }> = ({ market }) => {
    const isExpired = new Date(market.endDate) < new Date();
    const isCreator = user && typeof market.creator === 'object' && market.creator.id === user.id;
    const canResolve = (isCreator || (user as any)?.isAdmin) && isExpired && !(market as any).isResolved;
    
    // Get blockchain info (default to ETH if not specified)
    const blockchain = (market as any).blockchain || 'ethereum';
    const chainInfo: Record<string, { label: string; color: string; bg: string }> = {
      ethereum: { label: 'ETH', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      solana: { label: 'SOL', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      bsc: { label: 'BSC', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    };
    const chain = chainInfo[blockchain] || chainInfo.ethereum;

    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-2xl p-5 hover:shadow-lg hover:border-[#ffd700]/30 transition-all duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-full flex items-center justify-center font-bold text-[#1d1d1f] shadow-md text-lg">
              {market.creator.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1d1d1f] dark:text-white truncate">
                  {market.creator.name}
                </span>
                {market.creator.id !== 'ai' && (
                  <div className="w-4 h-4 bg-[#ffd700] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-[#1d1d1f] font-bold">✓</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                @{market.creator.handle}
              </span>
            </div>
          </div>
          {/* Chain + Countdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", chain.bg, chain.color)}>
              {chain.label}
            </span>
            <CountdownTimer endDate={market.endDate} compact />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-3 leading-snug">
          {market.question}
        </h3>

        {/* Category Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6] text-xs font-medium rounded-lg">
            {market.category}
          </span>
          {market.creator.id === 'ai' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-lg">
              <Sparkles size={10} />
              AI
            </span>
          )}
          {market.volume > 100 && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-lg">
              🔥 Hot
            </span>
          )}
        </div>

        {/* Probability Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-600">{market.outcomeStats.yesPercent}% Yes</span>
            <span className="text-sm font-semibold text-red-500">{market.outcomeStats.noPercent}% No</span>
          </div>
          <div className="h-2 bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${market.outcomeStats.yesPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-[#86868b] dark:text-[#a1a1a6]">
            <span>Pool: ${(market.poolSize / 1000).toFixed(1)}k</span>
            <span>{market.volume} participants</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleBet(market, 'YES'); }}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            Yes · ${(market.outcomeStats.yesPrice || 0.5).toFixed(2)}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleBet(market, 'NO'); }}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
          >
            No · ${(market.outcomeStats.noPrice || 0.5).toFixed(2)}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50">
          <div className="flex items-center gap-3 text-[#86868b] dark:text-[#a1a1a6]">
            <button className="flex items-center gap-1 text-xs hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              <Activity size={14} />
              <span>{market.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              <MessageCircle size={14} />
              <span>{Math.floor(market.volume * 0.3)}</span>
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              <Share2 size={14} />
            </button>
          </div>
          {canResolve && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedMarket(market); setIsResolutionOpen(true); }}
              className="px-3 py-1.5 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] text-xs font-semibold rounded-lg transition-colors duration-200"
            >
              Resolve
            </button>
          )}
        </div>
      </div>
    )
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-20 md:pb-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Activity Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-[#ffd700] via-[#ffeb3b] to-[#ffd700] px-4 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center shrink-0">
                <Gift size={16} className="text-[#1d1d1f]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1d1d1f] truncate">
                  🎉 限时活动: 参与预测赢取 1,000 SOUL 空投!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1d1d1f] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors">
                <span>了解详情</span>
                <ChevronRight size={12} />
              </button>
              <button 
                onClick={() => setShowBanner(false)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <X size={16} className="text-[#1d1d1f]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Sticky below TopNavBar */}
      <div className={cn(
        "sticky z-20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e]",
        showBanner ? "top-[64px]" : "top-[64px]"
      )}>
        <div className="flex overflow-x-auto no-scrollbar">
          <TabButton id="foryou" label="For You" icon={<TrendingUp size={16} />} />
          <TabButton id="crypto" label="Crypto" />
          <TabButton id="sports" label="Sports" />
          <TabButton id="following" label="Following" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#86868b] dark:text-[#a1a1a6]">
            <Activity size={48} className="mb-4 opacity-50" />
            <p>No markets found in this category.</p>
          </div>
        )}
      </div>

      <MarketResolutionModal
        market={selectedMarket}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        onResolved={() => {
          if (selectedMarket) {
            setMarkets(prev => prev.map(m => m.id === selectedMarket.id ? { ...m, isResolved: true } as PredictionMarket : m));
          }
        }}
      />

      {/* Bet Modal */}
      <BetModal
        market={selectedBetMarket}
        betType={selectedBetType}
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onPlaceBet={handlePlaceBet}
      />

      {/* Create Market Modal */}
      <CreateMarketModal
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        onCreate={handleCreateNewMarket}
      />
    </div>
  );
};

export default FeedSimple;
