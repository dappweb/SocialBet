import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { resolveMarket } from '../services/predictionMarketService';
import { PredictionMarket } from '../types';
import { cn } from '../utils';

interface MarketResolutionModalProps {
  market: PredictionMarket | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: () => void;
}

const MarketResolutionModal: React.FC<MarketResolutionModalProps> = ({
  market,
  isOpen,
  onClose,
  onResolved,
}) => {
  const { provider } = useWeb3Auth();
  const { isConnected, currentChain } = useWallet();
  const { showToast } = useToast();
  const { isAdmin, user } = useAuth();
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | 'INVALID' | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !market) return null;

  const canResolve = isAdmin || (user && market.creator && typeof market.creator === 'object' && 'id' in market.creator && market.creator.id === user.id);
  const isExpired = new Date(market.endDate) < new Date();

  const handleResolve = async () => {
    if (!selectedOutcome) {
      setError('Please select an outcome');
      return;
    }

    if (!isConnected || currentChain !== 'ethereum') {
      setError('Please connect your wallet to Ethereum network');
      showToast('Please connect your wallet to Ethereum network', 'error');
      return;
    }

    if (!provider) {
      setError('Web3Auth provider not available');
      showToast('Web3Auth provider not available', 'error');
      return;
    }

    const contractAddress = import.meta.env.VITE_PREDICTION_MARKET_SEPOLIA;
    if (!contractAddress) {
      setError('Prediction market contract not configured');
      showToast('Prediction market contract not configured', 'error');
      return;
    }

    const marketId = typeof market.id === 'string' ? parseInt(market.id) : market.id;
    if (isNaN(marketId)) {
      setError('Invalid market ID');
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      const result = await resolveMarket(provider, contractAddress, marketId, selectedOutcome);

      if (!result.success) {
        throw new Error(result.error || 'Failed to resolve market');
      }

      showToast(`Market resolved as ${selectedOutcome}!`, 'success');
      onResolved?.();
      onClose();
    } catch (err: any) {
      console.error('Error resolving market:', err);
      const errorMessage = err.message || 'Failed to resolve market';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsResolving(false);
    }
  };

  if (!canResolve) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Resolve Market</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full">
              <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
            </button>
          </div>
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-[#ff3b30] mb-4" />
            <p className="text-[#86868b] dark:text-[#a1a1a6]">
              Only the market creator or an administrator can resolve this market.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isExpired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Resolve Market</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full">
              <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
            </button>
          </div>
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-[#ff9800] mb-4" />
            <p className="text-[#86868b] dark:text-[#a1a1a6]">
              This market has not expired yet. You can only resolve markets after their end date.
            </p>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-2">
              End date: {new Date(market.endDate).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Resolve Market</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full">
            <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mb-4">{market.question}</p>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
            End date: {new Date(market.endDate).toLocaleString()}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedOutcome('YES')}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
              selectedOutcome === 'YES'
                ? "border-[#34c759] bg-[#34c759]/10"
                : "border-[#e5e5ea] dark:border-[#38383a] hover:border-[#34c759]/50"
            )}
          >
            <CheckCircle2 size={24} className={selectedOutcome === 'YES' ? "text-[#34c759]" : "text-[#86868b] dark:text-[#a1a1a6]"} />
            <div className="flex-1 text-left">
              <div className="font-semibold text-[#1d1d1f] dark:text-white">YES</div>
              <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">The outcome occurred</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedOutcome('NO')}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
              selectedOutcome === 'NO'
                ? "border-[#ff3b30] bg-[#ff3b30]/10"
                : "border-[#e5e5ea] dark:border-[#38383a] hover:border-[#ff3b30]/50"
            )}
          >
            <XCircle size={24} className={selectedOutcome === 'NO' ? "text-[#ff3b30]" : "text-[#86868b] dark:text-[#a1a1a6]"} />
            <div className="flex-1 text-left">
              <div className="font-semibold text-[#1d1d1f] dark:text-white">NO</div>
              <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">The outcome did not occur</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedOutcome('INVALID')}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
              selectedOutcome === 'INVALID'
                ? "border-[#ff9800] bg-[#ff9800]/10"
                : "border-[#e5e5ea] dark:border-[#38383a] hover:border-[#ff9800]/50"
            )}
          >
            <AlertCircle size={24} className={selectedOutcome === 'INVALID' ? "text-[#ff9800]" : "text-[#86868b] dark:text-[#a1a1a6]"} />
            <div className="flex-1 text-left">
              <div className="font-semibold text-[#1d1d1f] dark:text-white">INVALID</div>
              <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Market is invalid or unclear</div>
            </div>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/30 rounded-xl text-sm text-[#ff3b30]">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isResolving}
            className="flex-1 py-3 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!selectedOutcome || isResolving || !isConnected}
            className={cn(
              "flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200",
              selectedOutcome === 'YES' && "bg-[#34c759] hover:bg-[#30d158]",
              selectedOutcome === 'NO' && "bg-[#ff3b30] hover:bg-[#ff453a]",
              selectedOutcome === 'INVALID' && "bg-[#ff9800] hover:bg-[#ffa726]",
              (!selectedOutcome || isResolving || !isConnected) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isResolving ? (
              <>
                <Loader2 size={16} className="animate-spin inline mr-2" />
                Resolving...
              </>
            ) : (
              'Resolve Market'
            )}
          </button>
        </div>

        {!isConnected && (
          <p className="mt-3 text-xs text-center text-[#86868b] dark:text-[#a1a1a6]">
            Please connect your wallet to resolve the market
          </p>
        )}
      </div>
    </div>
  );
};

export default MarketResolutionModal;

