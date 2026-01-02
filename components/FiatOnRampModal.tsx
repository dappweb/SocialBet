import React, { useState, useCallback, useMemo } from 'react';
import { X, Loader2, CreditCard, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { buyCryptoWithFiat, getAvailableProviders, FiatOnRampConfig } from '../services/fiatOnRampService';
import { calculateSoulTokensFromFiat } from '../services/tokenTrading';
import { cn } from '../utils';

interface FiatOnRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (soulAmount: number) => void;
  defaultAmount?: number;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const FiatOnRampModal: React.FC<FiatOnRampModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultAmount = 50,
}) => {
  const { web3auth, walletAddress } = useWeb3Auth();
  const { walletAddress: walletAddr } = useWallet();
  const { showToast } = useToast();
  
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [selectedProvider, setSelectedProvider] = useState<'web3auth' | 'moonpay' | 'transak' | 'ramp'>('web3auth');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProviders = useMemo(() => getAvailableProviders(), []);
  const userWalletAddress = walletAddress || walletAddr;

  // Calculate SOUL tokens
  const soulTokens = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum > 0 ? calculateSoulTokensFromFiat(amountNum) : 0;
  }, [amount]);

  // Early return
  if (!isOpen) return null;

  const handlePresetAmount = useCallback((preset: number) => {
    setAmount(preset.toString());
    setError(null);
  }, []);

  const handlePurchase = useCallback(async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum < 10) {
      setError('Minimum purchase amount is $10 USD');
      return;
    }
    
    if (amountNum > 10000) {
      setError('Maximum purchase amount is $10,000 USD');
      return;
    }

    if (!userWalletAddress) {
      setError('Please connect your wallet first');
      showToast('Please connect your wallet to purchase crypto', 'warning');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const config: FiatOnRampConfig = {
        amount: amountNum,
        currency: 'USD',
        targetToken: 'ETH',
        walletAddress: userWalletAddress,
      };

      const result = await buyCryptoWithFiat(config, web3auth || undefined, selectedProvider);

      if (result.success) {
        showToast(
          `Fiat on-ramp initiated! You will receive approximately ${soulTokens.toFixed(2)} SOUL tokens.`,
          'success'
        );
        onSuccess?.(soulTokens);
        // Don't close modal immediately - let user see the external window
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to initiate fiat on-ramp');
      }
    } catch (err: any) {
      console.error('Fiat on-ramp error:', err);
      const errorMessage = err.message || 'Failed to process fiat purchase. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, selectedProvider, userWalletAddress, web3auth, soulTokens, showToast, onSuccess, onClose]);

  const providerInfo = {
    web3auth: {
      name: 'Web3Auth',
      description: 'Built-in secure on-ramp',
      icon: '🔐',
    },
    moonpay: {
      name: 'MoonPay',
      description: 'Credit card & bank transfer',
      icon: '🌙',
    },
    transak: {
      name: 'Transak',
      description: 'Global payment methods',
      icon: '💳',
    },
    ramp: {
      name: 'Ramp',
      description: 'Fast & secure',
      icon: '⚡',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea] dark:border-[#38383a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff9e6] dark:bg-[#332d1a] flex items-center justify-center">
              <CreditCard className="text-[#ffd700]" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Buy Crypto with Fiat</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Purchase SOUL tokens with USD</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6] font-semibold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                min="10"
                max="10000"
                step="0.01"
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] focus:border-[#ffd700] transition-all duration-200"
                autoFocus
              />
            </div>
            
            {/* Preset Amounts */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => handlePresetAmount(val)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                    amount === val.toString()
                      ? "bg-[#ffd700] text-[#1d1d1f]"
                      : "bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] hover:border hover:border-[#ffd700]/30 text-[#1d1d1f] dark:text-white"
                  )}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] dark:text-white">Payment Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {availableProviders.map((provider) => {
                const info = providerInfo[provider as keyof typeof providerInfo];
                if (!info) return null;
                
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setSelectedProvider(provider as any)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all duration-200 text-left",
                      selectedProvider === provider
                        ? "border-[#ffd700] bg-[#fff9e6] dark:bg-[#332d1a]"
                        : "border-[#e5e5ea] dark:border-[#38383a] hover:border-[#ffd700]/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{info.icon}</span>
                      <span className="font-semibold text-sm text-[#1d1d1f] dark:text-white">{info.name}</span>
                    </div>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SOUL Tokens Preview */}
          {soulTokens > 0 && (
            <div className="bg-[#fff9e6] dark:bg-[#332d1a] border border-[#ffd700]/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b] dark:text-[#a1a1a6]">You will receive:</span>
                <span className="text-lg font-bold text-[#1d1d1f] dark:text-white">
                  {soulTokens.toFixed(2)} SOUL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b] dark:text-[#a1a1a6]">Price per SOUL:</span>
                <span className="text-[#1d1d1f] dark:text-white font-medium">$0.05</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={18} className="text-[#ff3b30] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#ff3b30] flex-1">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-[#007aff]/10 border border-[#007aff]/30 rounded-xl p-3 flex items-start gap-2">
            <ExternalLink size={18} className="text-[#007aff] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[#007aff] font-medium mb-1">How it works:</p>
              <p className="text-xs text-[#007aff]/80">
                A new window will open where you can complete your purchase. After buying ETH, you can use it to purchase SOUL tokens.
              </p>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!amount || parseFloat(amount) < 10 || isProcessing || !userWalletAddress}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97]",
              (!amount || parseFloat(amount) < 10 || isProcessing || !userWalletAddress) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Buy with {providerInfo[selectedProvider]?.name || 'Fiat'}
              </>
            )}
          </button>

          {!userWalletAddress && (
            <p className="text-xs text-center text-[#86868b] dark:text-[#a1a1a6]">
              Please connect your wallet to purchase crypto
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiatOnRampModal;

