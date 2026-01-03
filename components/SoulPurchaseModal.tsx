import React, { useState, useCallback, useMemo } from 'react';
import { X, Loader2, Wallet, CreditCard, Coins, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { 
  buySoulWithETH, 
  calculateSoulTokensFromFiat, 
  SOUL_TOKEN_CONFIG, 
  validateTradeAmount,
  getETHBalance,
  estimateGasForPurchase,
  getSoulPrice
} from '../services/tokenTradingImproved';
import { buySoulWithFiat } from '../services/tokenTrading';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { cn } from '../utils';
import FiatOnRampModal from './FiatOnRampModal';

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
  const { web3auth, provider } = useWeb3Auth();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>('0.001');
  const [currentEthPrice, setCurrentEthPrice] = useState<number>(2000);

  // Load ETH balance and price when modal opens
  React.useEffect(() => {
    if (isOpen && provider && isConnected) {
      loadWalletData();
    }
  }, [isOpen, provider, isConnected]);

  const loadWalletData = useCallback(async () => {
    if (!provider) return;
    
    try {
      // Load ETH balance
      const balanceInfo = await getETHBalance(provider);
      setEthBalance(balanceInfo.balance);
      
      // Load current ETH price
      const priceInfo = await getSoulPrice();
      setCurrentEthPrice(priceInfo.ethPriceUSD);
      
      // Estimate gas if amount is set
      if (amount && parseFloat(amount) > 0) {
        const ethAmount = paymentMethod === 'fiat' ? parseFloat(amount) / priceInfo.ethPriceUSD : parseFloat(amount);
        const gasInfo = await estimateGasForPurchase(provider, ethAmount);
        setGasEstimate(gasInfo.estimatedCost);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  }, [provider, amount, paymentMethod]);

  // Update gas estimate when amount changes
  React.useEffect(() => {
    if (provider && amount && parseFloat(amount) > 0) {
      const updateGasEstimate = async () => {
        try {
          const ethAmount = paymentMethod === 'fiat' ? parseFloat(amount) / currentEthPrice : parseFloat(amount);
          const gasInfo = await estimateGasForPurchase(provider, ethAmount);
          setGasEstimate(gasInfo.estimatedCost);
        } catch (error) {
          console.error('Failed to estimate gas:', error);
        }
      };
      updateGasEstimate();
    }
  }, [amount, paymentMethod, provider, currentEthPrice]);

  // Memoize calculations to prevent hooks violations
  const soulAmount = useMemo(() => {
    if (!amount) return 0;
    if (paymentMethod === 'fiat') {
      return calculateSoulTokensFromFiat(parseFloat(amount) || 0);
    } else {
      // For crypto, convert ETH to USD first, then to SOUL
      const usdAmount = (parseFloat(amount) || 0) * currentEthPrice;
      return calculateSoulTokensFromFiat(usdAmount);
    }
  }, [amount, paymentMethod, currentEthPrice]);

  const validation = useMemo(() => {
    if (!amount) return { valid: false };
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }

    // Check minimum/maximum based on payment method
    if (paymentMethod === 'fiat') {
      if (amountNum < SOUL_TOKEN_CONFIG.minTradeAmount) {
        return { valid: false, error: `Minimum purchase is $${SOUL_TOKEN_CONFIG.minTradeAmount}` };
      }
      if (amountNum > SOUL_TOKEN_CONFIG.maxTradeAmount) {
        return { valid: false, error: `Maximum purchase is $${SOUL_TOKEN_CONFIG.maxTradeAmount}` };
      }
    } else {
      // For crypto, check ETH balance and convert to USD for limits
      const usdAmount = amountNum * currentEthPrice;
      if (usdAmount < SOUL_TOKEN_CONFIG.minTradeAmount) {
        return { valid: false, error: `Minimum purchase is $${SOUL_TOKEN_CONFIG.minTradeAmount} (${(SOUL_TOKEN_CONFIG.minTradeAmount / currentEthPrice).toFixed(6)} ETH)` };
      }
      if (usdAmount > SOUL_TOKEN_CONFIG.maxTradeAmount) {
        return { valid: false, error: `Maximum purchase is $${SOUL_TOKEN_CONFIG.maxTradeAmount} (${(SOUL_TOKEN_CONFIG.maxTradeAmount / currentEthPrice).toFixed(6)} ETH)` };
      }
      
      // Check ETH balance
      if (ethBalance !== null) {
        const totalNeeded = amountNum + parseFloat(gasEstimate);
        if (ethBalance < totalNeeded) {
          return { valid: false, error: `Insufficient ETH balance. You need ${totalNeeded.toFixed(6)} ETH (including gas)` };
        }
      }
    }
    
    return { valid: true };
  }, [amount, paymentMethod, ethBalance, gasEstimate, currentEthPrice]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

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
        // Open fiat on-ramp modal instead of direct purchase
        setIsFiatModalOpen(true);
        return; // Don't process further, let the modal handle it
      } else {
        if (!isConnected || !currentChain || !provider) {
          throw new Error('Please connect your wallet to purchase with crypto');
        }
        
        // Use the improved ETH purchase function
        result = await buySoulWithETH(amountNum, provider);
      }

      if (result.success && result.tokensReceived) {
        // Update Soul balance in context and backend
        await updateSoulBalance(result.tokensReceived);
        showToast(
          `Successfully purchased ${result.tokensReceived.toFixed(2)} SOUL tokens! Transaction: ${result.transactionHash?.slice(0, 10)}...`, 
          'success'
        );
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
  }, [amount, paymentMethod, validation, isAuthenticated, isConnected, currentChain, provider, showToast, updateSoulBalance, onPurchaseSuccess, onClose]);

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
            <label className="text-sm font-medium text-[#1d1d1f]">
              Amount ({paymentMethod === 'fiat' ? 'USD' : 'ETH'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">
                {paymentMethod === 'fiat' ? '$' : 'Ξ'}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={paymentMethod === 'fiat' ? SOUL_TOKEN_CONFIG.minTradeAmount : (SOUL_TOKEN_CONFIG.minTradeAmount / currentEthPrice).toFixed(6)}
                max={paymentMethod === 'fiat' ? SOUL_TOKEN_CONFIG.maxTradeAmount : (SOUL_TOKEN_CONFIG.maxTradeAmount / currentEthPrice).toFixed(6)}
                step={paymentMethod === 'fiat' ? "0.01" : "0.000001"}
                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 pl-8 text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
              />
            </div>
            {validation.error && (
              <p className="text-xs text-[#ff3b30]">{validation.error}</p>
            )}
            
            {/* ETH Balance Display */}
            {paymentMethod === 'crypto' && ethBalance !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Available ETH:</span>
                <span className="text-[#1d1d1f] font-medium">{ethBalance.toFixed(6)} ETH</span>
              </div>
            )}
            
            {/* Gas Estimate */}
            {paymentMethod === 'crypto' && amount && parseFloat(amount) > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Estimated gas fee:</span>
                <span className="text-[#1d1d1f] font-medium">~{parseFloat(gasEstimate).toFixed(6)} ETH</span>
              </div>
            )}
            
            {/* Current ETH Price */}
            {paymentMethod === 'crypto' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">ETH Price:</span>
                <span className="text-[#1d1d1f] font-medium">${currentEthPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f]">Quick Select</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const displayAmount = paymentMethod === 'fiat' ? preset : (preset / currentEthPrice);
                const displayText = paymentMethod === 'fiat' ? `$${preset}` : `${displayAmount.toFixed(4)} ETH`;
                const isSelected = paymentMethod === 'fiat' 
                  ? amount === preset.toString()
                  : Math.abs(parseFloat(amount) - displayAmount) < 0.0001;
                
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(paymentMethod === 'fiat' ? preset.toString() : displayAmount.toFixed(6))}
                    className={cn(
                      "p-2 rounded-lg border border-[#e5e5ea] text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "bg-[#ffd700] border-[#ffd700] text-[#1d1d1f]"
                        : "bg-white hover:bg-[#fff9e6] hover:border-[#ffd700]/50 text-[#1d1d1f]"
                    )}
                  >
                    {displayText}
                  </button>
                );
              })}
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
              {paymentMethod === 'crypto' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#86868b]">ETH equivalent:</span>
                  <span className="text-[#1d1d1f] font-medium">
                    {(parseFloat(amount) || 0).toFixed(6)} ETH
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Platform fee ({SOUL_TOKEN_CONFIG.platformFeePercent}%):</span>
                <span className="text-[#1d1d1f] font-medium">
                  {paymentMethod === 'fiat' 
                    ? `$${(parseFloat(amount) * SOUL_TOKEN_CONFIG.platformFeePercent / 100).toFixed(2)}`
                    : `${((parseFloat(amount) || 0) * SOUL_TOKEN_CONFIG.platformFeePercent / 100).toFixed(6)} ETH`
                  }
                </span>
              </div>
              {paymentMethod === 'crypto' && (
                <div className="flex items-center justify-between text-xs border-t border-[#ffd700]/20 pt-2">
                  <span className="text-[#86868b]">Total cost (including gas):</span>
                  <span className="text-[#1d1d1f] font-semibold">
                    {((parseFloat(amount) || 0) + parseFloat(gasEstimate)).toFixed(6)} ETH
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Wallet Connection Warning */}
          {paymentMethod === 'crypto' && !isConnected && (
            <div className="bg-[#fff3cd] border border-[#ffeaa7] rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#856404]" />
              <p className="text-sm text-[#856404]">
                Please connect your wallet to purchase with ETH
              </p>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!amount || !validation.valid || isProcessing || !isAuthenticated || (paymentMethod === 'crypto' && !isConnected)}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97]",
              (!amount || !validation.valid || isProcessing || !isAuthenticated || (paymentMethod === 'crypto' && !isConnected)) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {paymentMethod === 'crypto' ? 'Processing Transaction...' : 'Processing...'}
              </>
            ) : paymentMethod === 'crypto' && !isConnected ? (
              <>
                <Wallet size={20} />
                Connect Wallet First
              </>
            ) : (
              <>
                <Coins size={20} />
                {paymentMethod === 'crypto' ? 'Buy with ETH' : 'Buy with Fiat'}
              </>
            )}
          </button>

          {!isAuthenticated && (
            <p className="text-xs text-center text-[#86868b]">
              Please sign in to purchase Soul tokens
            </p>
          )}

          {paymentMethod === 'crypto' && isConnected && (
            <p className="text-xs text-center text-[#86868b]">
              Transaction will be sent to your connected wallet for approval
            </p>
          )}
        </div>
      </div>

      {/* Fiat On-Ramp Modal */}
      <FiatOnRampModal
        isOpen={isFiatModalOpen}
        onClose={() => setIsFiatModalOpen(false)}
        onSuccess={async (soulAmount) => {
          await updateSoulBalance(soulAmount);
          showToast(`Successfully purchased ${soulAmount.toFixed(2)} SOUL tokens!`, 'success');
          onPurchaseSuccess?.(soulAmount);
          setIsFiatModalOpen(false);
          setAmount('');
          onClose();
        }}
        defaultAmount={parseFloat(amount) || 50}
      />
    </div>
  );
};

export default SoulPurchaseModal;

