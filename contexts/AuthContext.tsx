import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWeb3Auth } from './Web3AuthContext';
import { User } from '../types';
import { usersApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  logout: () => Promise<void>;
  walletAddress: string | null;
  soulBalance: number;
  updateSoulBalance: (amount: number) => void;
  deductSoul: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Get Web3Auth context - it should always be available from Web3AuthProvider
  // If Web3Auth fails to initialize, the provider will still provide a valid context
  const {
    user: web3AuthUser,
    isConnected,
    isLoading,
    walletAddress,
    connect: web3AuthConnect,
    disconnect: web3AuthDisconnect,
    provider
  } = useWeb3Auth();

  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [soulBalance, setSoulBalance] = useState<number>(0);

  // Sync Web3Auth user with app user
  useEffect(() => {
    if (isConnected && web3AuthUser) {
      const appUser: User = {
        id: web3AuthUser.verifierId || walletAddress || 'user',
        name: web3AuthUser.name || 'Anonymous User',
        handle: web3AuthUser.email ? `@${web3AuthUser.email.split('@')[0]}` :
          walletAddress ? `@${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '@user',
        avatar: web3AuthUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress || 'default'}`,
        isVerified: !!web3AuthUser.email,
        walletAddressEth: walletAddress || undefined,
        sosTokenBalance: 0, // Will be fetched from API
      };
      setUser(appUser);

      // Save to localStorage for persistence display
      localStorage.setItem('socialbet_auth', JSON.stringify({
        user: appUser,
        provider: web3AuthUser.verifier || 'web3auth',
      }));
    } else if (!isConnected && !isLoading) {
      setUser(null);
      setSoulBalance(0);
      localStorage.removeItem('socialbet_auth');
    }
  }, [isConnected, web3AuthUser, walletAddress, isLoading]);

  // Load and sync Soul balance from both API and on-chain
  useEffect(() => {
    if (user?.id && walletAddress) {
      // Load from localStorage first for immediate display
      const savedBalance = localStorage.getItem(`soul_balance_${user.id}`);
      if (savedBalance) {
        setSoulBalance(parseFloat(savedBalance) || 0);
      }

      // Fetch from API
      const fetchSoulBalance = async () => {
        try {
          const userData = await usersApi.getById(user.id);
          if (userData.sosTokenBalance !== undefined) {
            setSoulBalance(userData.sosTokenBalance);
            localStorage.setItem(`soul_balance_${user.id}`, userData.sosTokenBalance.toString());
          }
        } catch (error) {
          console.error('Failed to fetch Soul balance from API:', error);
        }
      };
      
      // Also try to fetch on-chain balance if provider is available
      const fetchOnChainBalance = async () => {
        try {
          const { getBalance } = await import('../services/soulContractService');
          if (provider && walletAddress) {
            const balance = await getBalance(walletAddress, provider);
            // Use on-chain balance if it's higher (more accurate)
            setSoulBalance(prev => {
              if (balance.balance > prev) {
                localStorage.setItem(`soul_balance_${user.id}`, balance.balance.toString());
                return balance.balance;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Failed to fetch on-chain balance:', error);
          // Fallback to API balance
        }
      };
      
      fetchSoulBalance();
      if (isConnected && provider) {
        fetchOnChainBalance();
      }
    }
  }, [user, walletAddress, isConnected, provider]);

  const updateSoulBalance = useCallback(async (amount: number) => {
    if (!user?.id) return;
    
    try {
      // Update backend
      const result = await usersApi.addSoul(user.id, amount);
      setSoulBalance(result.newBalance);
      localStorage.setItem(`soul_balance_${user.id}`, result.newBalance.toString());
    } catch (error) {
      console.error('Failed to update Soul balance:', error);
      // Fallback to local update
      setSoulBalance(prev => {
        const newBalance = Math.max(0, prev + amount);
        localStorage.setItem(`soul_balance_${user.id}`, newBalance.toString());
        return newBalance;
      });
    }
  }, [user]);

  const deductSoul = useCallback(async (amount: number): Promise<boolean> => {
    if (soulBalance < amount || !user?.id) {
      return false;
    }
    
    try {
      // The backend will deduct Soul when creating market
      // We update locally for immediate UI feedback
      setSoulBalance(prev => {
        const newBalance = Math.max(0, prev - amount);
        localStorage.setItem(`soul_balance_${user.id}`, newBalance.toString());
        return newBalance;
      });
      
      // Fetch updated balance from backend after market creation
      // (This will be done by the market creation API)
      return true;
    } catch (error) {
      console.error('Failed to deduct Soul:', error);
      return false;
    }
  }, [soulBalance, user]);

  // Load saved auth on mount (for UI consistency before Web3Auth initializes)
  useEffect(() => {
    if (isLoading) {
      const savedAuth = localStorage.getItem('socialbet_auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setUser(authData.user);
        } catch (error) {
          console.error('Failed to load saved auth:', error);
        }
      }
    }
  }, [isLoading]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await web3AuthConnect();
    } catch (error) {
      console.error('Connect error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [web3AuthConnect]);

  const logout = useCallback(async () => {
    try {
      await web3AuthDisconnect();
      setUser(null);
      localStorage.removeItem('socialbet_auth');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [web3AuthDisconnect]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isConnecting: isConnecting || isLoading,
        connect,
        logout,
        walletAddress,
        soulBalance,
        updateSoulBalance,
        deductSoul,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
