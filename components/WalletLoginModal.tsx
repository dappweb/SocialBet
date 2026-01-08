import React, { useState } from 'react';
import { X, Wallet, Loader2, ExternalLink, Check } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { cn } from '../utils';

interface WalletLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVM_WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Connect using MetaMask' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔷', description: 'Connect using Coinbase Wallet' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Connect using WalletConnect' },
];

const SOLANA_WALLETS = [
  { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Connect using Phantom' },
  { id: 'solflare', name: 'Solflare', icon: '🔥', description: 'Connect using Solflare' },
  { id: 'backpack', name: 'Backpack', icon: '🎒', description: 'Connect using Backpack' },
  { id: 'glow', name: 'Glow', icon: '✨', description: 'Connect using Glow' },
];

const WalletLoginModal: React.FC<WalletLoginModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting } = useWallet();
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'solana' | 'bsc' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleConnect = async (chain: 'ethereum' | 'solana' | 'bsc', walletType: string) => {
    setError(null);
    setConnectingWallet(walletType);
    try {
      await connectWallet(chain, walletType);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleEVMConnect = async (walletType: string) => {
    if (walletType === 'metamask') {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }
      if (!window.ethereum.isMetaMask) {
        setError('Please use MetaMask wallet to connect.');
        return;
      }
      await handleConnect(selectedChain || 'ethereum', walletType);
    } else if (walletType === 'coinbase') {
      if (typeof window.ethereum === 'undefined') {
        setError('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
        return;
      }
      await handleConnect(selectedChain || 'ethereum', walletType);
    } else if (walletType === 'walletconnect') {
      // WalletConnect would need additional setup
      setError('WalletConnect integration coming soon');
    }
  };

  const handleSolanaConnect = async (walletType: string) => {
    if (walletType === 'phantom') {
      if (typeof (window as any).solana === 'undefined' || !(window as any).solana.isPhantom) {
        setError('Phantom wallet is not installed. Please install Phantom to continue.');
        return;
      }
      await handleConnect('solana', walletType);
    } else {
      // Other Solana wallets would need wallet adapter
      setError(`${walletType} wallet integration coming soon`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Wallet className="text-[#ffd700]" size={20} />
            Connect Wallet
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
            disabled={isConnecting}
          >
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

        {/* Chain Selection */}
        {!selectedChain && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#86868b] text-center">
              Choose a blockchain to connect your wallet
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedChain('ethereum')}
                className="p-4 border-2 border-[#e5e5ea] rounded-xl hover:border-[#ffd700] hover:bg-[#fff9e6] transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">⟠</div>
                <div className="text-sm font-semibold text-[#1d1d1f]">Ethereum</div>
              </button>

              <button
                onClick={() => setSelectedChain('bsc')}
                className="p-4 border-2 border-[#e5e5ea] rounded-xl hover:border-[#f3ba2f] hover:bg-[#fff9e6] transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">🟡</div>
                <div className="text-sm font-semibold text-[#1d1d1f]">BNB Chain</div>
              </button>

              <button
                onClick={() => setSelectedChain('solana')}
                className="p-4 border-2 border-[#e5e5ea] rounded-xl hover:border-[#ffd700] hover:bg-[#fff9e6] transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">◎</div>
                <div className="text-sm font-semibold text-[#1d1d1f]">Solana</div>
              </button>
            </div>
          </div>
        )}

        {/* Wallet Selection */}
        {selectedChain && (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setSelectedChain(null)}
              className="text-sm text-[#ffd700] hover:text-[#ffc107] flex items-center gap-1 mb-2 transition-colors duration-200"
            >
              ← Back to chain selection
            </button>

            <div className="space-y-2">
              {(selectedChain === 'ethereum' || selectedChain === 'bsc') ? (
                <>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">
                    {selectedChain === 'ethereum' ? 'Ethereum' : 'BSC'} Wallets
                  </h4>
                  {EVM_WALLETS.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleEVMConnect(wallet.id)}
                      disabled={isConnecting || connectingWallet === wallet.id}
                      className={cn(
                        "w-full p-4 border-2 rounded-xl transition-all duration-200 text-left flex items-center gap-3",
                        connectingWallet === wallet.id
                          ? "border-[#ffd700] bg-[#fff9e6]"
                          : "border-[#e5e5ea] hover:border-[#ffd700] hover:bg-[#fff9e6]",
                        isConnecting && connectingWallet !== wallet.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1d1d1f]">{wallet.name}</div>
                        <div className="text-xs text-[#86868b]">{wallet.description}</div>
                      </div>
                      {connectingWallet === wallet.id ? (
                        <Loader2 size={20} className="animate-spin text-[#ffd700]" />
                      ) : (
                        <ExternalLink size={16} className="text-[#86868b]" />
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3">
                    Solana Wallets
                  </h4>
                  {SOLANA_WALLETS.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleSolanaConnect(wallet.id)}
                      disabled={isConnecting || connectingWallet === wallet.id}
                      className={cn(
                        "w-full p-4 border-2 rounded-xl transition-all duration-200 text-left flex items-center gap-3",
                        connectingWallet === wallet.id
                          ? "border-[#ffd700] bg-[#fff9e6]"
                          : "border-[#e5e5ea] hover:border-[#ffd700] hover:bg-[#fff9e6]",
                        isConnecting && connectingWallet !== wallet.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1d1d1f]">{wallet.name}</div>
                        <div className="text-xs text-[#86868b]">{wallet.description}</div>
                      </div>
                      {connectingWallet === wallet.id ? (
                        <Loader2 size={20} className="animate-spin text-[#ffd700]" />
                      ) : (
                        <ExternalLink size={16} className="text-[#86868b]" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl p-3 text-sm text-[#ff3b30] relative">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {error}
                  {error.includes('not installed') && (
                    <div className="mt-2">
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ffd700] hover:text-[#ffc107] underline text-xs"
                      >
                        Install MetaMask →
                      </a>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 p-1 hover:bg-[#ff3b30]/20 rounded-full transition-colors duration-200 -mt-1"
                  aria-label="Close error"
                >
                  <X size={14} className="text-[#ff3b30]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f5f5f7] border-t border-[#e5e5ea]">
          <p className="text-xs text-[#86868b] text-center">
            By connecting, you agree to KOL Market's Terms of Service and Privacy Policy
          </p>
          {error && error.includes('Phantom') && (
            <div className="mt-2 text-center">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffd700] hover:text-[#ffc107] underline text-xs"
              >
                Install Phantom →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletLoginModal;

