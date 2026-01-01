import React, { useState, useCallback, useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, DollarSign, Coins, Info } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useToast } from '../contexts/ToastContext';
import { operationsApi } from '../services/api';
import { calculatePlatformFee } from '../services/tokenTrading';

interface SoulTokenTradingProps {
  onClose?: () => void;
}

type TradeType = 'buy' | 'sell';

const SoulTokenTrading: React.FC<SoulTokenTradingProps> = ({ onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const { web3auth, provider, isConnected } = useWeb3Auth();
  const { showToast } = useToast();

  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'fiat' | 'crypto'>('fiat');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock SOUL token price (in USD)
  const soulPriceUSD = 0.05; // $0.05 per SOUL token
  const soulPriceETH = 0.000025; // ETH per SOUL (assuming ETH = $2000)

  // Calculate SOUL tokens based on input
  const soulTokens = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return 0;
    
    if (currency === 'fiat') {
      return parseFloat(amount) / soulPriceUSD;
    } else {
      // If buying with ETH
      return parseFloat(amount) / soulPriceETH;
    }
  }, [amount, currency]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return 0;
    return parseFloat(amount);
  }, [amount]);

  // Platform fee (2.5% for operational funding)
  const platformFee = useMemo(() => {
    return totalCost * 0.025; // 2.5% goes to platform operations
  }, [totalCost]);

  // User receives (after platform fee)
  const userReceives = useMemo(() => {
    if (tradeType === 'buy') {
      return soulTokens;
    } else {
      // When selling, user receives fiat/crypto minus platform fee
      return totalCost - platformFee;
    }
  }, [tradeType, soulTokens, totalCost, platformFee]);

  const handleTrade = useCallback(async () => {
    if (!isAuthenticated || !isConnected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      if (tradeType === 'buy') {
        if (currency === 'fiat') {
          // Use Web3Auth Wallet Services for fiat on-ramp
          await handleBuyWithFiat();
        } else {
          // Buy with ETH
          await handleBuyWithCrypto();
        }
      } else {
        // Sell SOUL tokens
        await handleSellTokens();
      }
    } catch (error: any) {
      console.error('Trading error:', error);
      showToast(error.message || 'Trading failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [tradeType, currency, amount, isAuthenticated, isConnected]);

  const handleBuyWithFiat = useCallback(async () => {
    // Integrate with Web3Auth Wallet Services for fiat on-ramp
    // This would open the Web3Auth buy crypto modal
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    // Note: Web3Auth Wallet Services integration would go here
    // For now, we'll show a message
    showToast('Fiat on-ramp integration coming soon. Please use crypto for now.', 'info');
    
    // TODO: Integrate Web3Auth Wallet Services
    // const walletServices = new WalletServices({ web3auth });
    // await walletServices.showBuyCrypto({
    //   amount: parseFloat(amount),
    //   currency: 'USD',
    //   token: 'ETH'
    // });
  }, [web3auth, amount, showToast]);

  const handleBuyWithCrypto = useCallback(async () => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    // Calculate ETH amount needed
    const ethAmount = parseFloat(amount) * soulPriceETH;
    const usdAmount = parseFloat(amount);
    const feeAmount = calculatePlatformFee(usdAmount);
    
    // TODO: Implement smart contract interaction to buy SOUL tokens
    // This would interact with a DEX or token sale contract
    
    showToast(`Buying ${soulTokens.toFixed(2)} SOUL tokens with ${ethAmount.toFixed(6)} ETH...`, 'info');
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-record transaction for operations
    try {
      await operationsApi.createTransaction({
        transactionType: 'trade_fee',
        amount: feeAmount,
        currency: 'USD',
        description: `Platform fee from SOUL token purchase: ${soulTokens.toFixed(2)} SOUL`,
        category: 'operations',
        status: 'completed',
        userId: user?.id,
      });
    } catch (error) {
      console.error('Failed to record transaction:', error);
      // Don't fail the trade if recording fails
    }
    
    showToast(`Successfully purchased ${soulTokens.toFixed(2)} SOUL tokens!`, 'success');
    
    if (onClose) {
      setTimeout(onClose, 1500);
    }
  }, [provider, amount, soulPriceETH, soulTokens, showToast, onClose]);

  const handleSellTokens = useCallback(async () => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const usdAmount = parseFloat(amount) * soulPriceUSD;
    const feeAmount = calculatePlatformFee(usdAmount);

    // TODO: Implement smart contract interaction to sell SOUL tokens
    // This would interact with a DEX or token sale contract
    
    showToast(`Selling ${soulTokens.toFixed(2)} SOUL tokens...`, 'info');
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Auto-record transaction for operations
    try {
      await operationsApi.createTransaction({
        transactionType: 'trade_fee',
        amount: feeAmount,
        currency: 'USD',
        description: `Platform fee from SOUL token sale: ${soulTokens.toFixed(2)} SOUL`,
        category: 'operations',
        status: 'completed',
        userId: user?.id,
      });
    } catch (error) {
      console.error('Failed to record transaction:', error);
      // Don't fail the trade if recording fails
    }
    
    showToast(`Successfully sold ${soulTokens.toFixed(2)} SOUL tokens!`, 'success');
    
    if (onClose) {
      setTimeout(onClose, 1500);
    }
  }, [provider, soulTokens, amount, soulPriceUSD, showToast, onClose]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#86868b] mb-4">Please connect your wallet to trade SOUL tokens</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Coins className="text-[#ffd700]" size={28} />
            Trade SOUL Tokens
          </h2>
          <p className="text-sm text-[#86868b] mt-1">
            Buy or sell SOUL tokens to support platform operations
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Trade Type Selector */}
      <div className="flex gap-2 mb-6 bg-[#f5f5f7] p-1 rounded-xl">
        <button
          onClick={() => setTradeType('buy')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200",
            tradeType === 'buy'
              ? "bg-[#ffd700] text-[#1d1d1f] shadow-sm"
              : "text-[#86868b] hover:text-[#1d1d1f]"
          )}
        >
          <TrendingUp size={18} className="inline mr-2" />
          Buy SOUL
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200",
            tradeType === 'sell'
              ? "bg-[#ffd700] text-[#1d1d1f] shadow-sm"
              : "text-[#86868b] hover:text-[#1d1d1f]"
          )}
        >
          <TrendingDown size={18} className="inline mr-2" />
          Sell SOUL
        </button>
      </div>

      {/* Currency Selector (only for buy) */}
      {tradeType === 'buy' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrency('fiat')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200",
              currency === 'fiat'
                ? "bg-[#fff9e6] border-2 border-[#ffd700] text-[#1d1d1f]"
                : "bg-white border-2 border-[#e5e5ea] text-[#86868b] hover:border-[#ffd700]"
            )}
          >
            <DollarSign size={16} className="inline mr-2" />
            Buy with Fiat
          </button>
          <button
            onClick={() => setCurrency('crypto')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200",
              currency === 'crypto'
                ? "bg-[#fff9e6] border-2 border-[#ffd700] text-[#1d1d1f]"
                : "bg-white border-2 border-[#e5e5ea] text-[#86868b] hover:border-[#ffd700]"
            )}
          >
            <Coins size={16} className="inline mr-2" />
            Buy with ETH
          </button>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
          {tradeType === 'buy' 
            ? `Amount to Spend (${currency === 'fiat' ? 'USD' : 'ETH'})`
            : 'Amount of SOUL to Sell'
          }
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={tradeType === 'buy' ? `Enter ${currency === 'fiat' ? 'USD' : 'ETH'} amount` : 'Enter SOUL amount'}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#e5e5ea] focus:border-[#ffd700] focus:outline-none text-[#1d1d1f] text-lg"
            min="0"
            step="0.01"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">
            {tradeType === 'buy' ? (currency === 'fiat' ? 'USD' : 'ETH') : 'SOUL'}
          </span>
        </div>
      </div>

      {/* Trade Summary */}
      {amount && parseFloat(amount) > 0 && (
        <div className="bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <Info size={18} />
            Trade Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#86868b]">SOUL Price:</span>
              <span className="font-medium text-[#1d1d1f]">
                ${soulPriceUSD.toFixed(4)} / SOUL
              </span>
            </div>
            {tradeType === 'buy' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">You'll Receive:</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {soulTokens.toFixed(2)} SOUL
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#86868b] pt-2 border-t border-[#ffd700]/20">
                  <span>Platform Fee (2.5%):</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#86868b]">You'll Receive:</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    ${userReceives.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#86868b] pt-2 border-t border-[#ffd700]/20">
                  <span>Platform Fee (2.5%):</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Operational Funding Info */}
      <div className="bg-[#f5f5f7] rounded-xl p-4 mb-6">
        <p className="text-xs text-[#86868b] leading-relaxed">
          <strong className="text-[#1d1d1f]">Platform Operations Funding:</strong> A portion of trading fees (2.5%) 
          goes to platform operations, ensuring sustainable growth and development of Soulcast.
        </p>
      </div>

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200",
          "bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-md shadow-[#ffd700]/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95"
        )}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </span>
        ) : (
          `${tradeType === 'buy' ? 'Buy' : 'Sell'} SOUL Tokens`
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-[#86868b] text-center mt-4">
        Trading involves risk. Please trade responsibly.
      </p>
    </div>
  );
};

export default SoulTokenTrading;

