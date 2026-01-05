import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

// Web3Auth Configuration
const WEB3AUTH_CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'BIOs17cxzZnl_s0Q9Z74auNpFKrkCZPn7Q8XeizkqVTxul4UiPoWOfaukQell95OALH7QPz0reeeYwZMhiO5VIA';

// Get chain configuration from environment or use defaults
const getChainConfig = () => {
    const defaultChain = import.meta.env.VITE_DEFAULT_CHAIN || 'sepolia'; // Default to Sepolia testnet

    // Sepolia Testnet Configuration (Default)
    if (defaultChain === 'sepolia') {
        return {
            chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
            chainId: '0xaa36a7', // Sepolia chain ID (11155111 in decimal)
            rpcTarget: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
            displayName: 'Sepolia Testnet',
            blockExplorerUrl: 'https://sepolia.etherscan.io',
            ticker: 'ETH',
            tickerName: 'Ethereum',
        };
    }

    // Moon Island Testnet Configuration
    if (defaultChain === 'moonisland') {
        return {
            chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
            chainId: import.meta.env.VITE_MOON_ISLAND_CHAIN_ID || '0x123456', // Update with actual chain ID
            rpcTarget: import.meta.env.VITE_MOON_ISLAND_RPC_URL || 'https://rpc.moonisland.eth',
            displayName: 'Moon Island Testnet',
            blockExplorerUrl: import.meta.env.VITE_MOON_ISLAND_BLOCK_EXPLORER || 'https://explorer.moonisland.eth',
            ticker: 'ETH',
            tickerName: 'Ethereum',
        };
    }

    // Ethereum Mainnet
    if (defaultChain === 'mainnet') {
        return {
            chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
            chainId: '0x1', // Ethereum Mainnet
            rpcTarget: import.meta.env.VITE_ETH_MAINNET_RPC_URL || 'https://rpc.ankr.com/eth',
            displayName: 'Ethereum Mainnet',
            blockExplorerUrl: 'https://etherscan.io',
            ticker: 'ETH',
            tickerName: 'Ethereum',
        };
    }

    // BSC Mainnet
    if (defaultChain === 'bsc') {
        return {
            chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
            chainId: '0x38', // 56
            rpcTarget: 'https://bsc-dataseed.binance.org/',
            displayName: 'Binance Smart Chain',
            blockExplorerUrl: 'https://bscscan.com',
            ticker: 'BNB',
            tickerName: 'Binance Coin',
        };
    }

    // BSC Testnet
    if (defaultChain === 'bsc-testnet') {
        return {
            chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
            chainId: '0x61', // 97
            rpcTarget: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            displayName: 'BSC Testnet',
            blockExplorerUrl: 'https://testnet.bscscan.com',
            ticker: 'tBNB',
            tickerName: 'Binance Coin',
        };
    }

    // Default: Sepolia Testnet
    return {
        chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
        chainId: '0xaa36a7', // Sepolia chain ID
        rpcTarget: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
        displayName: 'Sepolia Testnet',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        ticker: 'ETH',
        tickerName: 'Ethereum',
    };
};

const chainConfig = getChainConfig();

interface Web3AuthUser {
    email?: string;
    name?: string;
    profileImage?: string;
    picture?: string; // Some providers use 'picture' instead of 'profileImage'
    avatar_url?: string; // Some providers use 'avatar_url'
    verifier?: string;
    verifierId?: string;
    aggregateVerifier?: string;
    idToken?: string;
}

// Helper function to extract profile image from user info
const getProfileImage = (userInfo: any): string | undefined => {
    return userInfo?.profileImage || userInfo?.picture || userInfo?.avatar_url;
};

interface Web3AuthContextType {
    web3auth: Web3Auth | null;
    provider: IProvider | null;
    user: Web3AuthUser | null;
    isLoading: boolean;
    isConnected: boolean;
    walletAddress: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    getUserInfo: () => Promise<Web3AuthUser | null>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
    const context = useContext(Web3AuthContext);
    if (!context) {
        throw new Error('useWeb3Auth must be used within Web3AuthProvider');
    }
    return context;
};

interface Web3AuthProviderProps {
    children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [user, setUser] = useState<Web3AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Initialize Web3Auth - non-blocking
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                console.log('[Web3Auth] Starting initialization...');
                console.log('[Web3Auth] Client ID:', WEB3AUTH_CLIENT_ID.substring(0, 10) + '...');

                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });
                console.log('[Web3Auth] Private key provider created');

                // Get Web3Auth network from environment or use default
                const web3AuthNetwork = (import.meta.env.VITE_WEB3AUTH_NETWORK || 'sapphire_devnet').toUpperCase() as keyof typeof WEB3AUTH_NETWORK;
                const network = WEB3AUTH_NETWORK[web3AuthNetwork] || WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;
                console.log('[Web3Auth] Network:', web3AuthNetwork, network);

                const web3authInstance = new Web3Auth({
                    clientId: WEB3AUTH_CLIENT_ID,
                    web3AuthNetwork: network,
                    privateKeyProvider,
                    uiConfig: {
                        appName: 'SocialBet',
                        mode: 'light',
                        loginMethodsOrder: ['google', 'twitter', 'discord', 'github'],
                        defaultLanguage: 'en',
                        theme: {
                            primary: '#ffd700',
                        },
                    },
                });
                console.log('[Web3Auth] Instance created, calling init()...');

                await web3authInstance.init();
                console.log('[Web3Auth] init() completed successfully');

                if (!mounted) return;

                setWeb3auth(web3authInstance);
                console.log('[Web3Auth] web3auth state set successfully');

                // Check if already connected (restore session)
                if (web3authInstance.connected && web3authInstance.provider) {
                    setProvider(web3authInstance.provider);
                    try {
                        const userInfo = await web3authInstance.getUserInfo();
                        if (mounted) {
                            // Normalize profile image field
                            const normalizedUser = {
                                ...userInfo,
                                profileImage: getProfileImage(userInfo),
                            } as Web3AuthUser;
                            setUser(normalizedUser);
                            console.log('Web3Auth session restored');
                        }
                    } catch (e) {
                        console.log('No user info available, but session exists');
                        // Even if getUserInfo fails, we have a provider, so mark as connected
                        // This helps with mobile persistence
                    }

                    // Get wallet address
                    try {
                        const accounts = await web3authInstance.provider.request({ method: 'eth_accounts' }) as string[];
                        if (accounts && accounts.length > 0 && mounted) {
                            setWalletAddress(accounts[0]);
                            console.log('Wallet address restored:', accounts[0]);
                        }
                    } catch (e) {
                        console.log('No accounts available, but provider exists');
                        // Try to get address from provider directly for mobile compatibility
                        try {
                            if (web3authInstance.provider && typeof web3authInstance.provider.request === 'function') {
                                const ethAccounts = await web3authInstance.provider.request({ method: 'eth_accounts' });
                                if (ethAccounts && ethAccounts.length > 0 && mounted) {
                                    setWalletAddress(ethAccounts[0]);
                                }
                            }
                        } catch (err) {
                            console.log('Could not retrieve accounts from provider');
                        }
                    }
                } else {
                    // Not connected - check if we have saved auth in localStorage for mobile
                    // This helps restore state on mobile even if Web3Auth session expired
                    try {
                        const savedAuth = localStorage.getItem('socialbet_auth');
                        if (savedAuth && mounted) {
                            console.log('Web3Auth not connected, but saved auth found in localStorage');
                            // AuthContext will handle restoring the user from localStorage
                        }
                    } catch (e) {
                        console.log('Could not check localStorage for saved auth');
                    }
                }
            } catch (error) {
                console.warn('Web3Auth initialization error (non-blocking):', error);
                // Don't block app rendering if Web3Auth fails - just log and continue
                if (mounted) {
                    setWeb3auth(null);
                    setProvider(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        // Initialize with timeout to prevent blocking
        const timeoutId = setTimeout(() => {
            if (mounted) {
                setIsLoading(false);
            }
        }, 5000); // Max 5 seconds for initialization

        init().finally(() => {
            clearTimeout(timeoutId);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    const connect = useCallback(async () => {
        if (!web3auth) {
            console.error('Web3Auth not initialized');
            throw new Error('Web3Auth is not initialized. Please wait a moment and try again.');
        }

        try {
            console.log('Opening Web3Auth modal...');
            const web3authProvider = await web3auth.connect();
            setProvider(web3authProvider);

            if (web3authProvider) {
                try {
                    const userInfo = await web3auth.getUserInfo();
                    // Normalize profile image field
                    const normalizedUser = {
                        ...userInfo,
                        profileImage: getProfileImage(userInfo),
                    } as Web3AuthUser;
                    setUser(normalizedUser);
                    console.log('Web3Auth connected successfully');
                } catch (e) {
                    console.log('No user info available');
                }

                // Get wallet address
                try {
                    const accounts = await web3authProvider.request({ method: 'eth_accounts' }) as string[];
                    if (accounts && accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        console.log('Wallet address:', accounts[0]);
                    }
                } catch (e) {
                    console.log('No accounts available');
                }
            }
        } catch (error) {
            console.error('Web3Auth connect error:', error);
            throw error;
        }
    }, [web3auth]);

    const disconnect = useCallback(async () => {
        if (!web3auth) {
            console.error('Web3Auth not initialized');
            return;
        }

        try {
            await web3auth.logout();
            setProvider(null);
            setUser(null);
            setWalletAddress(null);
        } catch (error) {
            console.error('Web3Auth disconnect error:', error);
            throw error;
        }
    }, [web3auth]);

    const getUserInfo = useCallback(async () => {
        if (!web3auth) {
            return null;
        }

        try {
            const userInfo = await web3auth.getUserInfo();
            // Normalize profile image field
            const normalizedUser = {
                ...userInfo,
                profileImage: getProfileImage(userInfo),
            } as Web3AuthUser;
            return normalizedUser;
        } catch (error) {
            console.error('Get user info error:', error);
            return null;
        }
    }, [web3auth]);

    // Always provide a valid context, even if initialization failed
    // This prevents errors from propagating and breaking the app
    return (
        <Web3AuthContext.Provider
            value={{
                web3auth,
                provider,
                user,
                isLoading,
                isConnected: !!provider,
                walletAddress,
                connect,
                disconnect,
                getUserInfo,
            }}
        >
            {children}
        </Web3AuthContext.Provider>
    );
};
