import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: (chain: 'ethereum' | 'solana' | 'bsc', walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  currentChain: 'ethereum' | 'solana' | 'bsc' | null;
  walletAddress: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentChain, setCurrentChain] = useState<'ethereum' | 'solana' | 'bsc' | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load saved wallet connection from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('socialbet_wallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        setUser(walletData.user);
        setIsConnected(true);
        setCurrentChain(walletData.chain);
        setWalletAddress(walletData.address);
      } catch (error) {
        console.error('Failed to load saved wallet:', error);
        localStorage.removeItem('socialbet_wallet');
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setUser(null);
    setIsConnected(false);
    setCurrentChain(null);
    setWalletAddress(null);
    localStorage.removeItem('socialbet_wallet');
  }, []);

  const connectWallet = useCallback(async (chain: 'ethereum' | 'solana' | 'bsc', walletType: string) => {
    setIsConnecting(true);
    try {
      let address = '';
      
      if (chain === 'ethereum' || chain === 'bsc') {
        // EVM chain connection
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
          
          // Get chain ID to determine if it's Ethereum or BSC
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const isBSC = chainId === '0x38' || chainId === '0x61'; // BSC mainnet or testnet
          const actualChain = isBSC ? 'bsc' : 'ethereum';
          
          setCurrentChain(actualChain);
          setWalletAddress(address);
          
          // Create user object
          const newUser: User = {
            id: address,
            name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
            handle: `@${address.slice(0, 8)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
            isVerified: false,
            primaryChain: actualChain,
            walletAddressEth: actualChain === 'ethereum' ? address : undefined,
            walletAddressBsc: actualChain === 'bsc' ? address : undefined,
          };
          
          setUser(newUser);
          setIsConnected(true);
          
          // Save to localStorage
          localStorage.setItem('socialbet_wallet', JSON.stringify({
            user: newUser,
            chain: actualChain,
            address,
            walletType,
          }));
        } else {
          throw new Error('MetaMask or compatible wallet not found');
        }
      } else if (chain === 'solana') {
        // Check if Solana wallet is available
        const solanaWallet = (window as any).solana;
        if (!solanaWallet || !solanaWallet.isPhantom) {
          throw new Error('Phantom wallet is not installed. Please install Phantom to continue.');
        }
        
        // Request connection
        const response = await solanaWallet.connect();
        address = response.publicKey.toString();
        
        setCurrentChain('solana');
        setWalletAddress(address);
        
        // Create user object
        const newUser: User = {
          id: address,
          name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          handle: `@${address.slice(0, 8)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
          isVerified: false,
          primaryChain: 'solana',
          walletAddressSol: address,
        };
        
        setUser(newUser);
        setIsConnected(true);
        
        // Save to localStorage
        localStorage.setItem('socialbet_wallet', JSON.stringify({
          user: newUser,
          chain: 'solana',
          address,
          walletType,
        }));
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && isConnected && walletAddress) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts - reload to reconnect with new account
          window.location.reload();
        }
      };

      const handleChainChanged = () => {
        // Reload page on chain change
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isConnected, walletAddress, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        user,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        currentChain,
        walletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Extend Window interface for ethereum and solana
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

