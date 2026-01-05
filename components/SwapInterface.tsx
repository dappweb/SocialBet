import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Wallet, Settings, Info, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '../utils';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SwapInterface: React.FC = () => {
  const { isConnected, currentChain, connectWallet } = useWallet();
  const { showToast } = useToast();
  
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(320); // 1 BNB = 320 SOUL (Mock)

  // Mock balances
  const [bnbBalance, setBnbBalance] = useState(2.5);
  const [soulBalance, setSoulBalance] = useState(1500);

  useEffect(() => {
    if (payAmount) {
      const amount = parseFloat(payAmount);
      if (!isNaN(amount)) {
        setReceiveAmount((amount * exchangeRate).toFixed(2));
      } else {
        setReceiveAmount('');
      }
    } else {
      setReceiveAmount('');
    }
  }, [payAmount, exchangeRate]);

  const handleSwap = async () => {
    if (!isConnected) {
      // Trigger wallet connection for BSC
      try {
        await connectWallet('bsc', 'metamask');
      } catch (error) {
        showToast('Please connect your wallet first', 'error');
      }
      return;
    }

    if (!payAmount || parseFloat(payAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (parseFloat(payAmount) > bnbBalance) {
      showToast('Insufficient BNB balance', 'error');
      return;
    }

    setIsSwapping(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSwapping(false);
      setBnbBalance(prev => prev - parseFloat(payAmount));
      setSoulBalance(prev => prev + parseFloat(receiveAmount));
      setPayAmount('');
      setReceiveAmount('');
      showToast('Swap successful! View on BscScan', 'success');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl border border-[#e5e5ea] dark:border-[#2c2c2e] overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
          <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-white">Swap</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full text-[#86868b] transition-colors">
              <RefreshCw size={18} />
            </button>
            <button className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full text-[#86868b] transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Swap Form */}
        <div className="p-4 space-y-2">
          {/* From Token */}
          <div className="bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-2xl p-4 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#86868b]">Pay</span>
              <span className="text-sm text-[#86868b]">Balance: {bnbBalance.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-bold text-[#1d1d1f] dark:text-white outline-none placeholder-[#86868b]"
              />
              <button className="flex items-center gap-2 bg-white dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-[#f3ba2f] flex items-center justify-center text-white text-xs font-bold">
                  BNB
                </div>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">BNB</span>
                <ArrowDownUp size={14} className="text-[#86868b]" />
              </button>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center -my-4 relative z-10">
            <div className="bg-white dark:bg-[#1c1c1e] p-2 rounded-xl border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-sm">
              <ArrowDownUp size={20} className="text-[#86868b]" />
            </div>
          </div>

          {/* To Token */}
          <div className="bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-2xl p-4 pt-6 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#86868b]">Receive</span>
              <span className="text-sm text-[#86868b]">Balance: {soulBalance.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={receiveAmount}
                readOnly
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-bold text-[#1d1d1f] dark:text-white outline-none placeholder-[#86868b]"
              />
              <button className="flex items-center gap-2 bg-white dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform">
                <div className="w-6 h-6 rounded-full bg-[#ffd700] flex items-center justify-center text-black text-xs font-bold">
                  S
                </div>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">SOUL</span>
                <ArrowDownUp size={14} className="text-[#86868b]" />
              </button>
            </div>
          </div>
        </div>

        {/* Info & Route */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-[#86868b] mb-4 bg-[#f5f5f7] dark:bg-[#0a0a0a] p-3 rounded-xl">
            <div className="flex items-center gap-1">
              <Info size={14} />
              <span>Rate</span>
            </div>
            <div className="font-medium text-[#1d1d1f] dark:text-white">
              1 BNB ≈ {exchangeRate} SOUL
            </div>
          </div>

          <button
            onClick={handleSwap}
            disabled={isSwapping}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg transition-all duration-200",
              !isConnected
                ? "bg-[#ffd700] text-[#1d1d1f] hover:bg-[#ffeb3b]"
                : payAmount && parseFloat(payAmount) <= bnbBalance
                  ? "bg-[#ffd700] text-[#1d1d1f] hover:bg-[#ffeb3b] shadow-lg shadow-[#ffd700]/20"
                  : "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] cursor-not-allowed"
            )}
          >
            {!isConnected ? 'Connect Wallet' : isSwapping ? 'Swapping...' : 'Swap'}
          </button>
        </div>

        {/* BSC Ecosystem Footer */}
        <div className="p-4 bg-[#f0b90b]/10 border-t border-[#f0b90b]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></div>
              <span className="text-xs font-medium text-[#d9a507] dark:text-[#f0b90b]">BSC Mainnet</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#d9a507] dark:text-[#f0b90b] cursor-pointer hover:underline">
              <span>View on PancakeSwap</span>
              <ExternalLink size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;
