import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWeb3Auth } from './Web3AuthContext';
import { User } from '../types';
import { usersApi } from '../services/api';
import { isContractOwner } from '../services/contractAdminService';

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
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Sync Web3Auth user with app user and check admin status
  useEffect(() => {
    const syncUserAndCheckAdmin = async () => {
      if (isConnected && web3AuthUser) {
        // First, check admin status if wallet is connected
        let adminStatus = false;
        if (walletAddress && provider) {
          try {
            const soulTokenAddress = import.meta.env.VITE_SOUL_TOKEN_SEPOLIA;
            if (soulTokenAddress) {
              adminStatus = await isContractOwner(walletAddress, provider, soulTokenAddress);
              setIsAdmin(adminStatus);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        }

        const appUser: User = {
          id: web3AuthUser.verifierId || walletAddress || 'user',
          name: web3AuthUser.name || 'Anonymous User',
          handle: web3AuthUser.email ? `@${web3AuthUser.email.split('@')[0]}` :
            walletAddress ? `@${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '@user',
          avatar: web3AuthUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress || 'default'}`,
          isVerified: !!web3AuthUser.email,
          walletAddressEth: walletAddress || undefined,
          sosTokenBalance: 0, // Will be fetched from API
          isAdmin: adminStatus,
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
        setIsAdmin(false);
        localStorage.removeItem('socialbet_auth');
      }
    };

    syncUserAndCheckAdmin();
  }, [isConnected, web3AuthUser, walletAddress, isLoading, provider]);

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
            try {
              const balance = await getBalance(walletAddress, provider);
              // Use on-chain balance if it's higher (more accurate)
              setSoulBalance(prev => {
                if (balance.balance > prev) {
                  localStorage.setItem(`soul_balance_${user.id}`, balance.balance.toString());
                  return balance.balance;
                }
                return prev;
              });
            } catch (balanceError: any) {
              // If contract not configured, that's okay - use API balance
              if (balanceError.message?.includes('contract address not configured')) {
                console.warn('Contract address not configured, using API balance only');
              } else {
                console.error('Failed to fetch on-chain balance:', balanceError);
              }
            }
          }
        } catch (error) {
          console.error('Failed to import soulContractService:', error);
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

  // Load saved auth immediately on mount (for mobile persistence and UI consistency)
  useEffect(() => {
    // Load saved auth immediately, regardless of Web3Auth loading state
    const savedAuth = localStorage.getItem('socialbet_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        // Restore user immediately for UI consistency
        setUser(authData.user);
        
        // Also try to restore Web3Auth session if it's available
        // This helps with mobile persistence
        if (authData.user && !isConnected && !isLoading) {
          // Web3Auth should restore session automatically, but we ensure user is set
          console.log('Restored saved auth from localStorage');
        }
      } catch (error) {
        console.error('Failed to load saved auth:', error);
        localStorage.removeItem('socialbet_auth');
      }
    }
  }, []); // Run only once on mount

  // Also restore when Web3Auth finishes loading (in case localStorage was cleared)
  useEffect(() => {
    if (!isLoading && !isConnected && !user) {
      const savedAuth = localStorage.getItem('socialbet_auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setUser(authData.user);
        } catch (error) {
          console.error('Failed to restore auth after Web3Auth load:', error);
        }
      }
    }
  }, [isLoading, isConnected, user]);

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
      const userId = user?.id;
      setUser(null);
      setSoulBalance(0); // Reset Soul balance on logout
      setIsAdmin(false); // Reset admin status on logout
      localStorage.removeItem('socialbet_auth');
      // Clear user-specific Soul balance from localStorage
      if (userId) {
        localStorage.removeItem(`soul_balance_${userId}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [web3AuthDisconnect, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user: user ? { ...user, isAdmin } : null,
        isAuthenticated: !!user,
        isConnecting: isConnecting || isLoading,
        connect,
        logout,
        walletAddress,
        soulBalance,
        updateSoulBalance,
        deductSoul,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
