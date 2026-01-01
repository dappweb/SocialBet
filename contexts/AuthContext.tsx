import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWeb3Auth } from './Web3AuthContext';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  logout: () => Promise<void>;
  walletAddress: string | null;
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
  // Safely get Web3Auth context - handle case where it might not be available
  let web3AuthContext;
  try {
    web3AuthContext = useWeb3Auth();
  } catch (error) {
    console.warn('Web3Auth not available, continuing without wallet connection:', error);
    web3AuthContext = {
      user: null,
      isConnected: false,
      isLoading: false,
      walletAddress: null,
      connect: async () => { throw new Error('Web3Auth not initialized'); },
      disconnect: async () => {},
    };
  }

  const {
    user: web3AuthUser,
    isConnected,
    isLoading,
    walletAddress,
    connect: web3AuthConnect,
    disconnect: web3AuthDisconnect
  } = web3AuthContext;

  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
      };
      setUser(appUser);

      // Save to localStorage for persistence display
      localStorage.setItem('socialbet_auth', JSON.stringify({
        user: appUser,
        provider: web3AuthUser.verifier || 'web3auth',
      }));
    } else if (!isConnected && !isLoading) {
      setUser(null);
      localStorage.removeItem('socialbet_auth');
    }
  }, [isConnected, web3AuthUser, walletAddress, isLoading]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
