import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Loader2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { cn, formatCurrency } from '../utils';

const WalletBalance: React.FC = () => {
  const { isConnected, walletAddress, currentChain } = useWallet();
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isConnected && walletAddress && currentChain) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [isConnected, walletAddress, currentChain]);

  const fetchBalance = async () => {
    if (!walletAddress || !currentChain) return;
    
    setIsLoading(true);
    try {
      // Mock balance fetch - In production, this would query the blockchain
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock balances based on chain
      const mockBalances: Record<string, number> = {
        ethereum: 1.24,
        bsc: 2.5,
        solana: 5.8,
      };
      
      setBalance(mockBalances[currentChain] || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected && !isAuthenticated) {
    return null;
  }

  const getTokenSymbol = () => {
    switch (currentChain) {
      case 'ethereum':
        return 'ETH';
      case 'bsc':
        return 'BNB';
      case 'solana':
        return 'SOL';
      default:
        return 'ETH';
    }
  };

  const getUSDBalance = () => {
    if (!balance) return 0;
    // Mock conversion rates
    const rates: Record<string, number> = {
      ethereum: 2500,
      bsc: 300,
      solana: 100,
    };
    return balance * (rates[currentChain || 'ethereum'] || 1);
  };

  return (
    <div className="bg-white border border-[#e5e5ea] rounded-xl p-4 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fff9e6] flex items-center justify-center">
            <Wallet className="text-[#ffd700]" size={20} />
          </div>
          <div className="text-left">
            <div className="text-xs text-[#86868b]">Wallet Balance</div>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#86868b]" />
                <span className="text-sm font-semibold text-[#1d1d1f]">Loading...</span>
              </div>
            ) : balance !== null ? (
              <div className="text-sm font-semibold text-[#1d1d1f]">
                {balance.toFixed(4)} {getTokenSymbol()}
              </div>
            ) : (
              <div className="text-sm font-semibold text-[#86868b]">Not available</div>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-[#86868b] transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && balance !== null && (
        <div className="mt-4 pt-4 border-t border-[#e5e5ea] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#86868b]">USD Value</span>
            <span className="font-semibold text-[#1d1d1f]">
              ${formatCurrency(getUSDBalance())}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#86868b]">Network</span>
            <span className="font-semibold text-[#1d1d1f] capitalize">
              {currentChain}
            </span>
          </div>
          {walletAddress && (
            <div className="pt-2">
              <div className="text-xs text-[#86868b] mb-1">Address</div>
              <div className="text-xs font-mono text-[#1d1d1f] break-all">
                {walletAddress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletBalance;

