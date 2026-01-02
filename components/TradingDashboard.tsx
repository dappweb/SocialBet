import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, XCircle, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { betsApi, Bet } from '../services/api';
import { cn, formatCurrency } from '../utils';
import { PredictionMarket } from '../types';

interface TradingDashboardProps {
  markets: PredictionMarket[];
  onRefresh?: () => void;
}

type PositionStatus = 'open' | 'won' | 'lost' | 'pending';
type FilterType = 'all' | 'open' | 'won' | 'lost' | 'pending';

interface Position extends Bet {
  currentPrice: number;
  shares: number;
  invested: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  market?: PredictionMarket;
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({ markets, onRefresh }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Fetch user's bets/positions
  const fetchPositions = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPositions([]);
      return;
    }

    setIsLoading(true);
    try {
      const bets = await betsApi.getByUser(user.id);
      
      // Transform bets into positions with current market data
      const positionsWithMarketData: Position[] = bets.map((bet) => {
        const market = markets.find(m => m.id === bet.marketId);
        const currentPrice = bet.betType === 'YES' 
          ? (market?.outcomeStats.yesPrice || bet.priceAtBet)
          : (market?.outcomeStats.noPrice || bet.priceAtBet);
        
        // Calculate position metrics
        const shares = bet.amount / bet.priceAtBet;
        const invested = bet.amount;
        const currentValue = shares * currentPrice;
        const unrealizedPnl = currentValue - invested;
        const unrealizedPnlPercent = (unrealizedPnl / invested) * 100;

        return {
          ...bet,
          currentPrice,
          shares,
          invested,
          currentValue,
          unrealizedPnl,
          unrealizedPnlPercent,
          market,
        };
      });

      setPositions(positionsWithMarketData);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      showToast('Failed to load trading positions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, markets, showToast]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    const openPositions = positions.filter(p => p.status === 'pending' || p.status === 'confirmed');
    const totalInvested = openPositions.reduce((sum, p) => sum + p.invested, 0);
    const totalCurrentValue = openPositions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalPnl = totalCurrentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const wonBets = positions.filter(p => p.status === 'won');
    const lostBets = positions.filter(p => p.status === 'lost');
    const winRate = positions.length > 0 
      ? (wonBets.length / (wonBets.length + lostBets.length)) * 100 
      : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      openPositions: openPositions.length,
      winRate,
      totalBets: positions.length,
    };
  }, [positions]);

  // Filter positions
  const filteredPositions = useMemo(() => {
    if (filter === 'all') return positions;
    return positions.filter(p => {
      if (filter === 'open') return p.status === 'pending' || p.status === 'confirmed';
      return p.status === filter;
    });
  }, [positions, filter]);

  const handleClosePosition = useCallback(async (position: Position) => {
    // In production, this would:
    // 1. Call smart contract to sell shares
    // 2. Update position status
    // 3. Refresh positions
    showToast('Position closing feature coming soon', 'info');
  }, [showToast]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-8 text-center">
        <p className="text-[#86868b]">Please sign in to view your trading dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e5e5ea] rounded-xl p-4">
          <div className="text-xs text-[#86868b] mb-1">Total Invested</div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(portfolioStats.totalInvested)}</div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-xl p-4">
          <div className="text-xs text-[#86868b] mb-1">Current Value</div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(portfolioStats.totalCurrentValue)}</div>
        </div>
        <div className={cn(
          "bg-white border rounded-xl p-4",
          portfolioStats.totalPnl >= 0 ? "border-[#34c759]/30" : "border-[#ff3b30]/30"
        )}>
          <div className="text-xs text-[#86868b] mb-1">Total P&L</div>
          <div className={cn(
            "text-2xl font-bold flex items-center gap-1",
            portfolioStats.totalPnl >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"
          )}>
            {portfolioStats.totalPnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {formatCurrency(Math.abs(portfolioStats.totalPnl))}
            <span className="text-sm">({portfolioStats.totalPnlPercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-xl p-4">
          <div className="text-xs text-[#86868b] mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{portfolioStats.winRate.toFixed(1)}%</div>
          <div className="text-xs text-[#86868b] mt-1">{portfolioStats.totalBets} total bets</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'open', 'won', 'lost', 'pending'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                filter === filterType
                  ? "bg-[#ffd700] text-[#1d1d1f]"
                  : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e5e5ea]"
              )}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={fetchPositions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] text-sm font-medium transition-all duration-200"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Positions List */}
      <div className="bg-white border border-[#e5e5ea] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#86868b]">Loading positions...</div>
        ) : filteredPositions.length === 0 ? (
          <div className="p-8 text-center text-[#86868b]">
            <p>No positions found</p>
            <p className="text-xs mt-2">Start trading to see your positions here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5ea]">
            {filteredPositions.map((position) => (
              <div
                key={position.id}
                className="p-4 hover:bg-[#f5f5f7] transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedPosition(position)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        position.betType === 'YES' 
                          ? "bg-[#34c759]/10 text-[#34c759]"
                          : "bg-[#ff3b30]/10 text-[#ff3b30]"
                      )}>
                        {position.betType}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        position.status === 'won' && "bg-[#34c759]/10 text-[#34c759]",
                        position.status === 'lost' && "bg-[#ff3b30]/10 text-[#ff3b30]",
                        position.status === 'pending' && "bg-[#ff9500]/10 text-[#ff9500]",
                        position.status === 'confirmed' && "bg-[#007AFF]/10 text-[#007AFF]"
                      )}>
                        {position.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1d1d1f] line-clamp-1 mb-1">
                      {position.marketQuestion || position.market?.question || 'Market'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#86868b]">
                      <span>Invested: <span className="font-semibold text-[#1d1d1f]">{formatCurrency(position.invested)}</span></span>
                      <span>Shares: <span className="font-semibold text-[#1d1d1f]">{position.shares.toFixed(4)}</span></span>
                      <span>Entry: <span className="font-semibold text-[#1d1d1f]">{(position.priceAtBet * 100).toFixed(2)}¢</span></span>
                      <span>Current: <span className="font-semibold text-[#1d1d1f]">{(position.currentPrice * 100).toFixed(2)}¢</span></span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={cn(
                      "text-lg font-bold mb-1",
                      position.unrealizedPnl >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"
                    )}>
                      {position.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
                    </div>
                    <div className={cn(
                      "text-xs",
                      position.unrealizedPnlPercent >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"
                    )}>
                      {position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%
                    </div>
                    {(position.status === 'pending' || position.status === 'confirmed') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClosePosition(position);
                        }}
                        className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Position Detail Modal */}
      {selectedPosition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedPosition(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#e5e5ea]">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                {selectedPosition.marketQuestion || selectedPosition.market?.question}
              </h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-semibold",
                  selectedPosition.betType === 'YES' 
                    ? "bg-[#34c759]/10 text-[#34c759]"
                    : "bg-[#ff3b30]/10 text-[#ff3b30]"
                )}>
                  {selectedPosition.betType}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-semibold",
                  selectedPosition.status === 'won' && "bg-[#34c759]/10 text-[#34c759]",
                  selectedPosition.status === 'lost' && "bg-[#ff3b30]/10 text-[#ff3b30]",
                  selectedPosition.status === 'pending' && "bg-[#ff9500]/10 text-[#ff9500]"
                )}>
                  {selectedPosition.status}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#86868b] mb-1">Invested Amount</div>
                  <div className="text-lg font-semibold text-[#1d1d1f]">{formatCurrency(selectedPosition.invested)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868b] mb-1">Current Value</div>
                  <div className="text-lg font-semibold text-[#1d1d1f]">{formatCurrency(selectedPosition.currentValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868b] mb-1">Shares</div>
                  <div className="text-lg font-semibold text-[#1d1d1f]">{selectedPosition.shares.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868b] mb-1">Entry Price</div>
                  <div className="text-lg font-semibold text-[#1d1d1f]">{(selectedPosition.priceAtBet * 100).toFixed(2)}¢</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868b] mb-1">Current Price</div>
                  <div className="text-lg font-semibold text-[#1d1d1f]">{(selectedPosition.currentPrice * 100).toFixed(2)}¢</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868b] mb-1">P&L</div>
                  <div className={cn(
                    "text-lg font-semibold",
                    selectedPosition.unrealizedPnl >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"
                  )}>
                    {selectedPosition.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(selectedPosition.unrealizedPnl)}
                    <span className="text-sm ml-1">({selectedPosition.unrealizedPnlPercent >= 0 ? '+' : ''}{selectedPosition.unrealizedPnlPercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
              {selectedPosition.blockchain && (
                <div className="pt-4 border-t border-[#e5e5ea]">
                  <div className="text-xs text-[#86868b] mb-1">Blockchain</div>
                  <div className="text-sm font-semibold text-[#1d1d1f] capitalize">{selectedPosition.blockchain}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingDashboard;

