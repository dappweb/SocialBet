import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ChevronDown, Loader2, Coins } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { cn, formatCurrency } from '../utils';
import SoulPurchaseModal from './SoulPurchaseModal';

const WalletBalance: React.FC = () => {
  const { isConnected, walletAddress, currentChain } = useWallet();
  const { isAuthenticated, soulBalance } = useAuth();
  const { provider } = useWeb3Auth();
  const [balance, setBalance] = useState<number | null>(null);
  const [onChainSoulBalance, setOnChainSoulBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !currentChain) return;
    
    setIsLoading(true);
    try {
      // Fetch native token balance (ETH/BNB/SOL)
      // This would query the blockchain for native token balance
      // For now, using a placeholder - in production, use ethers/web3.js
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock balances based on chain (replace with actual blockchain queries)
      const mockBalances: Record<string, number> = {
        ethereum: 1.24,
        bsc: 2.5,
        solana: 5.8,
      };
      
      setBalance(mockBalances[currentChain] || 0);
      
      // Fetch SOUL token balance from blockchain if provider is available
      if (provider && currentChain === 'ethereum') {
        try {
          const { getBalance } = await import('../services/soulContractService');
          const soulBalanceResult = await getBalance(walletAddress, provider);
          setOnChainSoulBalance(soulBalanceResult.balance);
        } catch (error: any) {
          // If contract not configured, that's okay
          if (error.message?.includes('contract address not configured')) {
            console.warn('SOUL contract not configured, skipping on-chain balance');
          } else {
            console.error('Failed to fetch on-chain SOUL balance:', error);
          }
          // Keep using API balance
        }
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, currentChain, provider]);

  useEffect(() => {
    if (isConnected && walletAddress && currentChain) {
      fetchBalance();
    } else {
      setBalance(null);
      setOnChainSoulBalance(null);
    }
  }, [isConnected, walletAddress, currentChain, fetchBalance]);

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

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#e5e5ea] space-y-3">
          {/* Soul Balance */}
          <div className="bg-[#fff9e6] border border-[#ffd700]/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-[#ffd700]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Soul Balance</span>
              </div>
              <span className="text-lg font-bold text-[#1d1d1f]">
                {soulBalance.toFixed(2)} SOUL
              </span>
            </div>
            {onChainSoulBalance !== null && Math.abs(onChainSoulBalance - soulBalance) > 0.01 && (
              <div className="text-xs text-[#86868b] mb-2">
                API: {soulBalance.toFixed(2)} SOUL (syncing...)
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[#86868b]">
                Required to create prediction markets
              </p>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="text-xs font-semibold text-[#1d1d1f] bg-[#ffd700] hover:bg-[#ffeb3b] px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                Buy Soul
              </button>
            </div>
          </div>

          {balance !== null && (
            <>
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
            </>
          )}
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

      <SoulPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseSuccess={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default WalletBalance;

