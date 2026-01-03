import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Loader2, Info, Wallet, Sparkles, BrainCircuit, ChevronDown, ExternalLink, CheckCircle2, CreditCard } from 'lucide-react';
import { PredictionMarket, BetType } from '../types';
import { cn, formatCurrency } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { placeBet as placeBetOnChain } from '../services/predictionMarketService';
import { getEthereumBalance } from '../services/soulTokenService';
import { getBalance } from '../services/soulContractService';

interface BetModalProps {
  market: PredictionMarket | null;
  betType: BetType | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (marketId: string, amount: number, type: BetType, blockchain?: string) => Promise<void>;
}

const BetModalFixed: React.FC<BetModalProps> = ({ market, betType, isOpen, onClose, onPlaceBet }) => {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = useState<'ethereum' | 'solana' | 'bsc' | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showFiatModal, setShowFiatModal] = useState(false);

  const { provider, isConnected } = useWeb3Auth();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { balance } = useWallet();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      setSelectedBlockchain('ethereum');
    }
  }, [isOpen]);

  // Load wallet balance
  useEffect(() => {
    if (isConnected && selectedBlockchain) {
      setIsLoadingBalance(true);
      const loadBalance = async () => {
        try {
          let bal = 0;
          if (selectedBlockchain === 'ethereum') {
            bal = await getEthereumBalance(provider);
          } else {
            bal = await getBalance(provider, selectedBlockchain);
          }
          setWalletBalance(bal);
        } catch (error) {
          console.error('Failed to load balance:', error);
          setWalletBalance(0);
        } finally {
          setIsLoadingBalance(false);
        }
      };
      loadBalance();
    }
  }, [isConnected, selectedBlockchain, provider]);

  const handlePlaceBet = useCallback(async () => {
    if (!market || !betType || !amount) {
      setError('Please enter a bet amount');
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (walletBalance !== null && betAmount > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onPlaceBet(market.id, betAmount, betType, selectedBlockchain || undefined);
      showToast(`Bet placed successfully!`, 'success');
      onClose();
    } catch (error) {
      console.error('Failed to place bet:', error);
      setError('Failed to place bet. Please try again.');
      showToast('Failed to place bet', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [market, betType, amount, walletBalance, onPlaceBet, showToast, onClose, selectedBlockchain]);

  const potentialReturn = useMemo(() => {
    if (!market || !betType || !amount) return 0;
    const betAmount = parseFloat(amount) || 0;
    const odds = betType === 'YES' ? market.outcomeStats.noPercent / market.outcomeStats.yesPercent : market.outcomeStats.yesPercent / market.outcomeStats.noPercent;
    return betAmount * (1 + odds);
  }, [market, betType, amount]);

  if (!isOpen || !market || !betType) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5e5ea] dark:border-[#2c2c2e]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                betType === 'YES' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {betType === 'YES' ? 'YES' : 'NO'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">Place Bet</h2>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">on {market.question}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200 flex items-center justify-center"
            >
              <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
            </button>
          </div>

          {/* Market Info */}
          <div className="p-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Current Odds</span>
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {betType === 'YES' ? market.outcomeStats.yesPercent : market.outcomeStats.noPercent}% chance
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Pool Size</span>
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {formatCurrency(market.poolSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Potential Return</span>
              <span className="font-semibold text-[#ffd700]">
                {formatCurrency(potentialReturn)}
              </span>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="p-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
              Bet Amount (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                min="0"
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-[#86868b] dark:text-[#a1a1a6]">
                USD
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-3">
              {[10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  className="flex-1 py-2 px-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-lg text-sm font-medium text-[#1d1d1f] dark:text-white transition-colors duration-200"
                >
                  ${value}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Blockchain Selection */}
          <div className="p-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
              Blockchain
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ethereum', name: 'Ethereum', icon: '🔷' },
                { id: 'solana', name: 'Solana', icon: '🟣' },
                { id: 'bsc', name: 'BSC', icon: '🟡' }
              ].map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedBlockchain(chain.id as any)}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200",
                    selectedBlockchain === chain.id
                      ? "border-[#ffd700] bg-[#fff9e6] dark:bg-[#332d1a]"
                      : "border-[#e5e5ea] dark:border-[#2c2c2e] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]"
                  )}
                >
                  <div className="text-2xl mb-1">{chain.icon}</div>
                  <div className="text-xs font-medium text-[#1d1d1f] dark:text-white">{chain.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="p-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#86868b] dark:text-[#a1a1a6]" />
                <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Available Balance</span>
              </div>
              <div className="text-right">
                {isLoadingBalance ? (
                  <Loader2 size={16} className="animate-spin text-[#86868b] dark:text-[#a1a1a6]" />
                ) : (
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">
                    {walletBalance !== null ? formatCurrency(walletBalance) : 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            <button
              onClick={handlePlaceBet}
              disabled={isSubmitting || !isConnected || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 bg-[#ffd700] hover:bg-[#ffeb3b] disabled:bg-[#e5e5ea] disabled:text-[#86868b] text-[#1d1d1f] disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-200 active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Placing Bet...
                </div>
              ) : !isConnected ? (
                'Connect Wallet to Bet'
              ) : (
                `Place ${betType} Bet - ${amount || '0.00'} USD`
              )}
            </button>

            {!isConnected && (
              <button
                onClick={() => setShowFiatModal(true)}
                className="w-full mt-3 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                Buy Crypto with Fiat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fiat OnRamp Modal Placeholder */}
      {showFiatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-md w-full border border-[#e5e5ea] dark:border-[#2c2c2e] p-6">
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4">Buy Crypto</h3>
            <p className="text-[#86868b] dark:text-[#a1a1a6] mb-4">Fiat onramp integration would go here.</p>
            <button
              onClick={() => setShowFiatModal(false)}
              className="w-full py-2 bg-[#ffd700] text-[#1d1d1f] rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BetModalFixed;
