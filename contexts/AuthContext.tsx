import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  connectSocial: (provider: 'google' | 'twitter' | 'discord' | 'github') => Promise<void>;
  linkWallet: () => Promise<void>;
  linkSocial: (provider: 'google' | 'twitter' | 'discord' | 'github') => Promise<void>;
  logout: () => void;
  authMethod: 'wallet' | 'social' | null;
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
  const { user: walletUser, isConnected: isWalletConnected, connectWallet, disconnectWallet } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'wallet' | 'social' | null>(null);

  // Sync wallet user with auth user
  useEffect(() => {
    if (isWalletConnected && walletUser) {
      setUser(walletUser);
      setAuthMethod('wallet');
    } else if (!isWalletConnected && authMethod === 'wallet') {
      setUser(null);
      setAuthMethod(null);
    }
  }, [isWalletConnected, walletUser, authMethod]);

  // Load saved social auth from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('socialbet_auth');
    if (savedAuth && !isWalletConnected) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
        setAuthMethod('social');
      } catch (error) {
        console.error('Failed to load saved auth:', error);
        localStorage.removeItem('socialbet_auth');
      }
    }
  }, [isWalletConnected]);

  const connectSocial = async (provider: 'google' | 'twitter' | 'discord' | 'github') => {
    setIsConnecting(true);
    try {
      // Mock OAuth flow - In production, this would redirect to OAuth provider
      // For now, we'll simulate the OAuth callback
      
      // Simulate OAuth redirect
      const mockOAuthData = {
        google: {
          id: 'google_123456',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        },
        twitter: {
          id: 'twitter_123456',
          name: 'John Doe',
          username: '@johndoe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=twitter',
        },
        discord: {
          id: 'discord_123456',
          name: 'John Doe',
          username: 'johndoe#1234',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=discord',
        },
        github: {
          id: 'github_123456',
          name: 'John Doe',
          username: 'johndoe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github',
        },
      };

      const oauthData = mockOAuthData[provider];
      
      // Create user object from OAuth data
      const newUser: User = {
        id: oauthData.id,
        name: oauthData.name,
        handle: provider === 'twitter' ? oauthData.username : 
                provider === 'discord' ? oauthData.username :
                provider === 'github' ? `@${oauthData.username}` :
                `@${oauthData.email?.split('@')[0]}`,
        avatar: oauthData.avatar,
        isVerified: false,
      };

      setUser(newUser);
      setAuthMethod('social');

      // Save to localStorage
      localStorage.setItem('socialbet_auth', JSON.stringify({
        user: newUser,
        provider,
      }));

      // In production, you would:
      // 1. Redirect to OAuth provider
      // 2. Handle OAuth callback
      // 3. Exchange code for access token
      // 4. Fetch user profile from provider API
      // 5. Create/link user account
      
    } catch (error: any) {
      console.error('Social login error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const linkWallet = async () => {
    // This would open wallet connection modal
    // For now, we'll just use the existing wallet connection
    if (!isWalletConnected) {
      throw new Error('Please connect a wallet first');
    }
    
    // Link wallet to existing social account
    if (user && authMethod === 'social' && walletUser) {
      const linkedUser: User = {
        ...user,
        walletAddressEth: walletUser.walletAddressEth,
        walletAddressSol: walletUser.walletAddressSol,
        walletAddressBsc: walletUser.walletAddressBsc,
        primaryChain: walletUser.primaryChain,
      };
      setUser(linkedUser);
      localStorage.setItem('socialbet_auth', JSON.stringify({
        user: linkedUser,
        provider: 'social',
        walletLinked: true,
      }));
    }
  };

  const linkSocial = async (provider: 'google' | 'twitter' | 'discord' | 'github') => {
    // Link social account to existing wallet
    if (!isWalletConnected || !walletUser) {
      throw new Error('Please connect a wallet first');
    }
    
    await connectSocial(provider);
    
    // Link social to wallet user
    if (user && walletUser) {
      const linkedUser: User = {
        ...walletUser,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
      };
      setUser(linkedUser);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthMethod(null);
    localStorage.removeItem('socialbet_auth');
    if (isWalletConnected) {
      disconnectWallet();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isConnecting,
        connectSocial,
        linkWallet,
        linkSocial,
        logout,
        authMethod,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

