import React, { useState, useCallback } from 'react';
import { X, Loader2, Wallet, CreditCard, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { buySoulWithFiat, buySoulWithETH, calculateSoulTokensFromFiat, SOUL_TOKEN_CONFIG, validateTradeAmount } from '../services/tokenTrading';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { cn } from '../utils';

interface SoulPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (soulAmount: number) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

const SoulPurchaseModal: React.FC<SoulPurchaseModalProps> = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const { user, isAuthenticated, updateSoulBalance } = useAuth();
  const { isConnected, currentChain } = useWallet();
  const { showToast } = useToast();
  const { web3auth } = useWeb3Auth();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [isProcessing, setIsProcessing] = useState(false);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const soulAmount = amount ? calculateSoulTokensFromFiat(parseFloat(amount) || 0) : 0;
  const validation = amount ? validateTradeAmount(parseFloat(amount), paymentMethod) : { valid: false };

  const handlePresetAmount = useCallback((preset: number) => {
    setAmount(preset.toString());
  }, []);

  const handlePurchase = useCallback(async () => {
    if (!amount || !validation.valid) {
      showToast(validation.error || 'Please enter a valid amount', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in to purchase Soul tokens', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      let result;
      const amountNum = parseFloat(amount);

      if (paymentMethod === 'fiat') {
        if (!web3auth) {
          throw new Error('Web3Auth not initialized');
        }
        result = await buySoulWithFiat(amountNum, web3auth);
      } else {
        if (!isConnected || !currentChain) {
          throw new Error('Please connect your wallet to purchase with crypto');
        }
        // For crypto, convert USD to ETH first
        const ethAmount = amountNum / 2000; // Assuming ETH = $2000
        // This would need the actual provider from wallet context
        result = await buySoulWithETH(ethAmount, {} as any);
      }

      if (result.success && result.tokensReceived) {
        // Update Soul balance in context and backend
        await updateSoulBalance(result.tokensReceived);
        showToast(`Successfully purchased ${result.tokensReceived.toFixed(2)} SOUL tokens!`, 'success');
        onPurchaseSuccess?.(result.tokensReceived);
        setAmount('');
        onClose();
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      showToast(error.message || 'Failed to purchase Soul tokens. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, paymentMethod, validation, isAuthenticated, isConnected, currentChain, web3auth, showToast, onPurchaseSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff9e6] flex items-center justify-center">
              <Coins className="text-[#ffd700]" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f]">Purchase Soul Tokens</h3>
              <p className="text-xs text-[#86868b]">${SOUL_TOKEN_CONFIG.priceUSD.toFixed(4)} per SOUL</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f]">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('fiat')}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                  paymentMethod === 'fiat'
                    ? "border-[#ffd700] bg-[#fff9e6]"
                    : "border-[#e5e5ea] bg-white hover:border-[#ffd700]/50"
                )}
              >
                <CreditCard size={18} className={paymentMethod === 'fiat' ? "text-[#ffd700]" : "text-[#86868b]"} />
                <span className="font-medium text-sm">Fiat (USD)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                disabled={!isConnected}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                  paymentMethod === 'crypto'
                    ? "border-[#ffd700] bg-[#fff9e6]"
                    : "border-[#e5e5ea] bg-white hover:border-[#ffd700]/50",
                  !isConnected && "opacity-50 cursor-not-allowed"
                )}
              >
                <Wallet size={18} className={paymentMethod === 'crypto' ? "text-[#ffd700]" : "text-[#86868b]"} />
                <span className="font-medium text-sm">Crypto</span>
              </button>
            </div>
            {paymentMethod === 'crypto' && !isConnected && (
              <p className="text-xs text-[#86868b]">Connect your wallet to purchase with crypto</p>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f]">Amount ({paymentMethod === 'fiat' ? 'USD' : 'ETH'})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">
                {paymentMethod === 'fiat' ? '$' : 'Ξ'}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={SOUL_TOKEN_CONFIG.minTradeAmount}
                max={SOUL_TOKEN_CONFIG.maxTradeAmount}
                step="0.01"
                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 pl-8 text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
              />
            </div>
            {validation.error && (
              <p className="text-xs text-[#ff3b30]">{validation.error}</p>
            )}
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f]">Quick Select</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetAmount(preset)}
                  className={cn(
                    "p-2 rounded-lg border border-[#e5e5ea] text-sm font-medium transition-all duration-200",
                    amount === preset.toString()
                      ? "bg-[#ffd700] border-[#ffd700] text-[#1d1d1f]"
                      : "bg-white hover:bg-[#fff9e6] hover:border-[#ffd700]/50 text-[#1d1d1f]"
                  )}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Soul Tokens Preview */}
          {soulAmount > 0 && (
            <div className="bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b]">You will receive:</span>
                <span className="text-lg font-bold text-[#1d1d1f]">
                  {soulAmount.toFixed(2)} SOUL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Price per SOUL:</span>
                <span className="text-[#1d1d1f] font-medium">
                  ${SOUL_TOKEN_CONFIG.priceUSD.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Platform fee ({SOUL_TOKEN_CONFIG.platformFeePercent}%):</span>
                <span className="text-[#1d1d1f] font-medium">
                  ${(parseFloat(amount) * SOUL_TOKEN_CONFIG.platformFeePercent / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!amount || !validation.valid || isProcessing || !isAuthenticated}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97]",
              (!amount || !validation.valid || isProcessing || !isAuthenticated) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Coins size={20} />
                Purchase SOUL
              </>
            )}
          </button>

          {!isAuthenticated && (
            <p className="text-xs text-center text-[#86868b]">
              Please sign in to purchase Soul tokens
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoulPurchaseModal;

