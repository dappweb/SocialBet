import React from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../utils';

const WalletBalanceSimple: React.FC = () => {
  const mockBalances = [
    { symbol: 'ETH', balance: '2.45', value: '$4,890', change: '+2.3%', positive: true },
    { symbol: 'SOL', balance: '125.8', value: '$8,806', change: '+5.1%', positive: true },
    { symbol: 'SOUL', balance: '10,000', value: '$8,500', change: '+12.5%', positive: true },
  ];

  const totalValue = mockBalances.reduce((sum, balance) => {
    const value = parseFloat(balance.value.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-[#ffd700]" />
          <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Wallet Balance</h3>
        </div>
        <TrendingUp size={16} className="text-green-600" />
      </div>

      {/* Total Value */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
          ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-sm text-green-600 font-medium">+8.2% today</div>
      </div>

      {/* Balances */}
      <div className="space-y-3">
        {mockBalances.map((balance, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#1d1d1f]">
                  {balance.symbol.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-[#1d1d1f] dark:text-white">
                  {balance.symbol}
                </div>
                <div className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                  {balance.balance} tokens
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-[#1d1d1f] dark:text-white">
                {balance.value}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                balance.positive ? "text-green-600" : "text-red-600"
              )}>
                {balance.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {balance.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-medium rounded-lg transition-colors duration-200">
        Manage Wallet
      </button>
    </div>
  );
};

export default WalletBalanceSimple;
