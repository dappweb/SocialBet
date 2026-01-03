/**
 * Test Component for ETH Purchase Functionality
 * This component provides a simple interface to test the ETH to SOUL purchase feature
 */

import React, { useState, useEffect } from 'react';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  buySoulWithETH, 
  getETHBalance, 
  getSoulPrice, 
  estimateGasForPurchase,
  validateTradeAmount 
} from '../services/tokenTradingImproved';
import { Wallet, Coins, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const TestETHPurchase: React.FC = () => {
  const { provider, isConnected, connect } = useWeb3Auth();
  const { isAuthenticated, soulBalance, updateSoulBalance } = useAuth();
  const { showToast } = useToast();
  
  const [ethAmount, setEthAmount] = useState('0.001');
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(2000);
  const [gasEstimate, setGasEstimate] = useState<string>('0.001');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string>('');

  // Load wallet data when connected
  useEffect(() => {
    if (provider && isConnected) {
      loadWalletData();
    }
  }, [provider, isConnected]);

  // Update gas estimate when amount changes
  useEffect(() => {
    if (provider && ethAmount && parseFloat(ethAmount) > 0) {
      updateGasEstimate();
    }
  }, [ethAmount, provider]);

  const loadWalletData = async () => {
    if (!provider) return;
    
    setIsLoading(true);
    try {
      // Load ETH balance
      const balanceInfo = await getETHBalance(provider);
      setEthBalance(balanceInfo.balance);
      
      // Load current ETH price
      const priceInfo = await getSoulPrice();
      setEthPrice(priceInfo.ethPriceUSD);
      
      console.log('Wallet data loaded:', {
        ethBalance: balanceInfo.balance,
        ethPrice: priceInfo.ethPriceUSD
      });
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      showToast('Failed to load wallet data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGasEstimate = async () => {
    if (!provider) return;
    
    try {
      const gasInfo = await estimateGasForPurchase(provider, parseFloat(ethAmount));
      setGasEstimate(gasInfo.estimatedCost);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
    }
  };

  const handlePurchase = async () => {
    if (!provider || !isConnected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in first', 'error');
      return;
    }

    const amount = parseFloat(ethAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid ETH amount', 'error');
      return;
    }

    // Validate amount
    const validation = await validateTradeAmount(amount, 'crypto');
    if (!validation.valid) {
      showToast(validation.error || 'Invalid amount', 'error');
      return;
    }

    setIsPurchasing(true);
    try {
      console.log(`Attempting to purchase SOUL with ${amount} ETH`);
      
      const result = await buySoulWithETH(amount, provider);
      
      if (result.success && result.tokensReceived) {
        // Update Soul balance
        await updateSoulBalance(result.tokensReceived);
        
        setLastTxHash(result.transactionHash || '');
        showToast(
          `Successfully purchased ${result.tokensReceived.toFixed(2)} SOUL tokens!`, 
          'success'
        );
        
        // Reload wallet data to show updated balance
        await loadWalletData();
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      showToast(error.message || 'Purchase failed', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const calculateSoulTokens = () => {
    const amount = parseFloat(ethAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    
    const usdAmount = amount * ethPrice;
    return usdAmount / 0.05; // $0.05 per SOUL
  };

  const calculateTotalCost = () => {
    const amount = parseFloat(ethAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    
    return amount + parseFloat(gasEstimate);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Test ETH Purchase</h2>
        <p className="text-[#86868b]">Test the ETH to SOUL token purchase functionality</p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-[#f5f5f7] rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Wallet size={20} className={isConnected ? "text-green-500" : "text-[#86868b]"} />
          <span className="font-medium">
            Wallet: {isConnected ? 'Connected' : 'Not Connected'}
          </span>
          {!isConnected && (
            <button
              onClick={connect}
              className="ml-auto px-3 py-1 bg-[#ffd700] text-[#1d1d1f] rounded-lg text-sm font-medium"
            >
              Connect
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className={isAuthenticated ? "text-green-500" : "text-[#86868b]"} />
          <span className="font-medium">
            Auth: {isAuthenticated ? 'Signed In' : 'Not Signed In'}
          </span>
        </div>
      </div>

      {/* Wallet Info */}
      {isConnected && (
        <div className="mb-6 p-4 bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl">
          <h3 className="font-semibold text-[#1d1d1f] mb-3">Wallet Information</h3>
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm text-[#86868b]">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#86868b]">ETH Balance:</span>
                <span className="font-medium">{ethBalance?.toFixed(6) || '0.000000'} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">SOUL Balance:</span>
                <span className="font-medium">{soulBalance.toFixed(2)} SOUL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">ETH Price:</span>
                <span className="font-medium">${ethPrice.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Form */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
            ETH Amount to Spend
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">
              Ξ
            </span>
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.001"
              min="0.000001"
              step="0.000001"
              className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 pl-8 text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-2">
          {['0.001', '0.005', '0.01', '0.05'].map((amount) => (
            <button
              key={amount}
              onClick={() => setEthAmount(amount)}
              className={`p-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                ethAmount === amount
                  ? 'bg-[#ffd700] border-[#ffd700] text-[#1d1d1f]'
                  : 'bg-white border-[#e5e5ea] hover:bg-[#fff9e6] hover:border-[#ffd700]/50 text-[#1d1d1f]'
              }`}
            >
              {amount} ETH
            </button>
          ))}
        </div>

        {/* Purchase Preview */}
        {parseFloat(ethAmount) > 0 && (
          <div className="p-4 bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">SOUL Tokens:</span>
              <span className="font-medium">{calculateSoulTokens().toFixed(2)} SOUL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">USD Value:</span>
              <span className="font-medium">${(parseFloat(ethAmount) * ethPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Gas Estimate:</span>
              <span className="font-medium">{parseFloat(gasEstimate).toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#ffd700]/20 pt-2">
              <span className="text-[#86868b]">Total Cost:</span>
              <span className="font-semibold">{calculateTotalCost().toFixed(6)} ETH</span>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={!isConnected || !isAuthenticated || isPurchasing || parseFloat(ethAmount) <= 0}
        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
          !isConnected || !isAuthenticated || isPurchasing || parseFloat(ethAmount) <= 0
            ? 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'
            : 'bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] active:scale-[0.97]'
        }`}
      >
        {isPurchasing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing Transaction...
          </>
        ) : (
          <>
            <Coins size={20} />
            Purchase SOUL with ETH
          </>
        )}
      </button>

      {/* Last Transaction */}
      {lastTxHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">Last Transaction</span>
          </div>
          <p className="text-xs text-green-600 font-mono break-all">
            {lastTxHash}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Testing Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Connect your wallet (make sure you're on a testnet)</li>
              <li>Sign in to the application</li>
              <li>Enter an ETH amount to spend</li>
              <li>Click "Purchase SOUL with ETH"</li>
              <li>Approve the transaction in your wallet</li>
              <li>Wait for confirmation and check your SOUL balance</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestETHPurchase;