/**
 * Token Sale Component
 * Interface for public/private SOUL token sale
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Coins, Clock, TrendingUp, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { cn } from '../utils';
import './TokenSale.css';

interface TokenSaleProps {
  onClose?: () => void;
}

type SalePhase = 'not-started' | 'private' | 'public' | 'ended';

const TokenSale: React.FC<TokenSaleProps> = ({ onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const { provider, isConnected } = useWeb3Auth();
  const { showToast } = useToast();

  const [salePhase, setSalePhase] = useState<SalePhase>('public');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  // Sale configuration (would come from contract)
  const saleConfig = useMemo(() => ({
    tokenPrice: 0.05, // $0.05 per SOUL
    softCap: 500000, // $500K
    hardCap: 5000000, // $5M
    totalRaised: 1250000, // $1.25M (example)
    minPurchase: 10, // $10
    maxPurchase: 100000, // $100K
    startTime: Date.now() - 86400000, // Started 1 day ago
    endTime: Date.now() + 2592000000, // Ends in 30 days
    tokensForSale: 100000000, // 100M tokens
    tokensSold: 25000000, // 25M tokens sold
  }), []);

  // Calculate tokens user will receive
  const tokensToReceive = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return 0;
    return parseFloat(amount) / saleConfig.tokenPrice;
  }, [amount, saleConfig.tokenPrice]);

  // Calculate sale progress
  const saleProgress = useMemo(() => {
    return (saleConfig.totalRaised / saleConfig.hardCap) * 100;
  }, [saleConfig]);

  // Time remaining
  const timeRemaining = useMemo(() => {
    const remaining = saleConfig.endTime - Date.now();
    if (remaining <= 0) return 'Sale Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  }, [saleConfig.endTime]);

  // Validation
  const validation = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) {
      return { valid: false, error: 'Please enter an amount' };
    }
    
    const amountNum = parseFloat(amount);
    
    if (amountNum < saleConfig.minPurchase) {
      return { valid: false, error: `Minimum purchase is $${saleConfig.minPurchase}` };
    }
    
    if (amountNum > saleConfig.maxPurchase) {
      return { valid: false, error: `Maximum purchase is $${saleConfig.maxPurchase}` };
    }
    
    if (saleConfig.totalRaised + amountNum > saleConfig.hardCap) {
      return { valid: false, error: 'Purchase would exceed hard cap' };
    }
    
    return { valid: true };
  }, [amount, saleConfig]);

  const handlePurchase = useCallback(async () => {
    if (!isAuthenticated || !isConnected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!validation.valid) {
      showToast(validation.error || 'Invalid amount', 'error');
      return;
    }

    if (salePhase === 'private' && !isWhitelisted) {
      showToast('You are not whitelisted for private sale', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Interact with SoulTokenSale contract
      // const contract = new ethers.Contract(SALE_CONTRACT_ADDRESS, SALE_ABI, signer);
      // const tx = await contract.buyTokens(ethers.utils.parseEther(amount));
      // await tx.wait();

      // Mock for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast(`Successfully purchased ${tokensToReceive.toFixed(2)} SOUL tokens!`, 'success');
      setAmount('');
    } catch (error: any) {
      console.error('Purchase error:', error);
      showToast(error.message || 'Purchase failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, isConnected, validation, salePhase, isWhitelisted, amount, tokensToReceive, showToast]);

  const handlePresetAmount = useCallback((preset: number) => {
    setAmount(preset.toString());
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="token-sale">
        <div className="token-sale-empty">
          <AlertCircle size={48} className="text-[#86868b] mb-4" />
          <p className="text-lg font-semibold text-[#1d1d1f] mb-2">Connect Wallet to Participate</p>
          <p className="text-sm text-[#86868b]">Please connect your wallet to participate in the token sale</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-sale">
      <div className="token-sale-header">
        <div className="flex items-center gap-3">
          <Coins size={32} className="text-[#ffd700]" />
          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f]">SOUL Token Sale</h2>
            <p className="text-sm text-[#86868b]">
              {salePhase === 'private' ? 'Private Sale' : salePhase === 'public' ? 'Public Sale' : 'Sale Ended'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="token-sale-close"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Sale Status */}
      <div className="token-sale-status">
        <div className="token-sale-progress">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#1d1d1f]">Progress</span>
            <span className="text-sm font-semibold text-[#ffd700]">
              ${(saleConfig.totalRaised / 1000).toFixed(0)}K / ${(saleConfig.hardCap / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="token-sale-progress-bar">
            <div
              className="token-sale-progress-fill"
              style={{ width: `${Math.min(saleProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-[#86868b]">
            <span>Soft Cap: ${(saleConfig.softCap / 1000).toFixed(0)}K</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Sale Info Cards */}
        <div className="token-sale-info-grid">
          <div className="token-sale-info-card">
            <div className="text-xs text-[#86868b] mb-1">Token Price</div>
            <div className="text-lg font-semibold text-[#1d1d1f]">${saleConfig.tokenPrice}</div>
          </div>
          <div className="token-sale-info-card">
            <div className="text-xs text-[#86868b] mb-1">Tokens Sold</div>
            <div className="text-lg font-semibold text-[#1d1d1f]">
              {(saleConfig.tokensSold / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="token-sale-info-card">
            <div className="text-xs text-[#86868b] mb-1">Total Supply</div>
            <div className="text-lg font-semibold text-[#1d1d1f]">
              {(saleConfig.tokensForSale / 1000000).toFixed(0)}M
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Section */}
      {salePhase !== 'ended' && (
        <div className="token-sale-purchase">
          <div className="token-sale-purchase-header">
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Purchase SOUL Tokens</h3>
            {salePhase === 'private' && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                isWhitelisted
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}>
                {isWhitelisted ? (
                  <>
                    <CheckCircle size={14} />
                    Whitelisted
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Not Whitelisted
                  </>
                )}
              </div>
            )}
          </div>

          {/* Preset Amounts */}
          <div className="token-sale-presets">
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetAmount(preset)}
                className={cn(
                  "token-sale-preset-btn",
                  amount === preset.toString() && "active"
                )}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="token-sale-input">
            <label className="token-sale-label">Amount (USD)</label>
            <div className="token-sale-input-wrapper">
              <span className="token-sale-input-prefix">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={saleConfig.minPurchase}
                max={saleConfig.maxPurchase}
                step="0.01"
                disabled={isProcessing || (salePhase === 'private' && !isWhitelisted)}
                className="token-sale-input-field"
              />
            </div>
            {!validation.valid && validation.error && (
              <p className="token-sale-error">{validation.error}</p>
            )}
          </div>

          {/* Tokens to Receive */}
          {tokensToReceive > 0 && (
            <div className="token-sale-receive">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#86868b]">You will receive:</span>
                <span className="text-lg font-semibold text-[#ffd700]">
                  {tokensToReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOUL
                </span>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!validation.valid || isProcessing || (salePhase === 'private' && !isWhitelisted)}
            className="token-sale-purchase-btn"
          >
            {isProcessing ? (
              'Processing...'
            ) : salePhase === 'private' && !isWhitelisted ? (
              'Not Whitelisted'
            ) : (
              'Purchase SOUL Tokens'
            )}
          </button>

          {/* Limits */}
          <div className="token-sale-limits">
            <p className="text-xs text-[#86868b] text-center">
              Min: ${saleConfig.minPurchase} • Max: ${saleConfig.maxPurchase.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Sale Ended */}
      {salePhase === 'ended' && (
        <div className="token-sale-ended">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <p className="text-lg font-semibold text-[#1d1d1f] mb-2">Sale Completed</p>
          <p className="text-sm text-[#86868b]">
            The token sale has ended. Thank you for your participation!
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenSale;

