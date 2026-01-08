import React, { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, ArrowRightLeft, Send, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

interface WalletBalanceProps {
  onBuyClick?: () => void;
  onSwapClick?: () => void;
  onSendClick?: () => void;
}

const WalletBalanceSimple: React.FC<WalletBalanceProps> = ({
  onBuyClick,
  onSwapClick,
  onSendClick,
}) => {
  const { isAuthenticated } = useAuth();
  const { isConnected, walletAddress } = useWallet();
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [showTransactions, setShowTransactions] = useState(true);

  const mockBalances = [
    { symbol: 'ETH', balance: '2.45', value: '$4,890', change: '+2.3%', positive: true, icon: '⟠' },
    { symbol: 'SOL', balance: '125.8', value: '$8,806', change: '+5.1%', positive: true, icon: '◎' },
    { symbol: 'SOUL', balance: '10,000', value: '$8,500', change: '+12.5%', positive: true, icon: '🔮' },
  ];

  const recentTransactions = [
    { type: 'buy', token: 'SOUL', amount: '100', time: '1h ago', status: 'completed' },
    { type: 'sell', token: 'ETH', amount: '0.5', time: '3h ago', status: 'completed' },
    { type: 'swap', from: 'SOL', to: 'SOUL', amount: '50', time: '1d ago', status: 'completed' },
  ];

  const totalValue = mockBalances.reduce((sum, balance) => {
    const value = parseFloat(balance.value.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0);

  const displayedBalances = showAllTokens ? mockBalances : mockBalances.slice(0, 2);

  if (!isAuthenticated && !isConnected) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl p-4 m-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-[#ffd700]" />
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white">My Wallet</h3>
        </div>
        <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mb-4">
          Connect wallet to view your assets
        </p>
        <button className="w-full py-2.5 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-all duration-200 shadow-sm">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl p-4 m-4">
      {/* Header with Total Value */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-[#ffd700]" />
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white">My Wallet</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
          <TrendingUp size={14} />
          +8.2%
        </div>
      </div>

      {/* Total Value */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
          ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Total Balance</div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={onBuyClick}
          className="flex flex-col items-center gap-1.5 p-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-xl transition-colors"
        >
          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
            <Plus size={16} className="text-green-600" />
          </div>
          <span className="text-xs font-medium text-[#1d1d1f] dark:text-white">Buy</span>
        </button>
        <button
          onClick={onSwapClick}
          className="flex flex-col items-center gap-1.5 p-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-xl transition-colors"
        >
          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
            <ArrowRightLeft size={16} className="text-blue-600" />
          </div>
          <span className="text-xs font-medium text-[#1d1d1f] dark:text-white">Swap</span>
        </button>
        <button
          onClick={onSendClick}
          className="flex flex-col items-center gap-1.5 p-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-xl transition-colors"
        >
          <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Send size={16} className="text-purple-600" />
          </div>
          <span className="text-xs font-medium text-[#1d1d1f] dark:text-white">Send</span>
        </button>
      </div>

      {/* Token Balances */}
      <div className="space-y-2 mb-3">
        {displayedBalances.map((balance, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2.5 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#ffd700]/20 to-[#ffeb3b]/20 rounded-full flex items-center justify-center text-lg">
                {balance.icon}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1d1d1f] dark:text-white">
                  {balance.symbol}
                </div>
                <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  {balance.balance}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm text-[#1d1d1f] dark:text-white">
                {balance.value}
              </div>
              <div className={cn(
                "flex items-center justify-end gap-0.5 text-xs font-medium",
                balance.positive ? "text-green-600" : "text-red-500"
              )}>
                {balance.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {balance.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {mockBalances.length > 2 && (
        <button
          onClick={() => setShowAllTokens(!showAllTokens)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
        >
          {showAllTokens ? (
            <>Show Less <ChevronUp size={14} /></>
          ) : (
            <>Show All ({mockBalances.length}) <ChevronDown size={14} /></>
          )}
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-[#e5e5ea] dark:border-[#2c2c2e] my-3" />

      {/* Recent Transactions */}
      <div>
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#86868b]" />
            <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">Recent</span>
          </div>
          {showTransactions ? (
            <ChevronUp size={14} className="text-[#86868b]" />
          ) : (
            <ChevronDown size={14} className="text-[#86868b]" />
          )}
        </button>

        {showTransactions && (
          <div className="space-y-2">
            {recentTransactions.map((tx, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-2 px-1"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    tx.type === 'buy' && "bg-green-500/10 text-green-600",
                    tx.type === 'sell' && "bg-red-500/10 text-red-500",
                    tx.type === 'swap' && "bg-blue-500/10 text-blue-600"
                  )}>
                    {tx.type === 'buy' && <Plus size={12} />}
                    {tx.type === 'sell' && <ArrowUpRight size={12} />}
                    {tx.type === 'swap' && <ArrowRightLeft size={12} />}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1d1d1f] dark:text-white capitalize">
                      {tx.type === 'swap' ? `${tx.from} → ${tx.to}` : `${tx.type} ${tx.token}`}
                    </div>
                    <div className="text-[10px] text-[#86868b]">{tx.time}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-[#1d1d1f] dark:text-white">
                  {tx.type === 'buy' ? '+' : tx.type === 'sell' ? '-' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletBalanceSimple;
