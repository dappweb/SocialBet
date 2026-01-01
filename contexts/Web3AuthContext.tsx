import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

// Web3Auth Configuration
const WEB3AUTH_CLIENT_ID = 'BIOs17cxzZnl_s0Q9Z74auNpFKrkCZPn7Q8XeizkqVTxul4UiPoWOfaukQell95OALH7QPz0reeeYwZMhiO5VIA';

const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155 as const,
    chainId: '0x1', // Ethereum Mainnet
    rpcTarget: 'https://rpc.ankr.com/eth',
    displayName: 'Ethereum Mainnet',
    blockExplorerUrl: 'https://etherscan.io',
    ticker: 'ETH',
    tickerName: 'Ethereum',
};

interface Web3AuthUser {
    email?: string;
    name?: string;
    profileImage?: string;
    verifier?: string;
    verifierId?: string;
    aggregateVerifier?: string;
    idToken?: string;
}

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

    // Initialize Web3Auth
    useEffect(() => {
        const init = async () => {
            try {
                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });

                const web3authInstance = new Web3Auth({
                    clientId: WEB3AUTH_CLIENT_ID,
                    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
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

                await web3authInstance.init();

                setWeb3auth(web3authInstance);

                // Check if already connected
                if (web3authInstance.connected && web3authInstance.provider) {
                    setProvider(web3authInstance.provider);
                    try {
                        const userInfo = await web3authInstance.getUserInfo();
                        setUser(userInfo as Web3AuthUser);
                    } catch (e) {
                        console.log('No user info available');
                    }

                    // Get wallet address
                    try {
                        const accounts = await web3authInstance.provider.request({ method: 'eth_accounts' }) as string[];
                        if (accounts && accounts.length > 0) {
                            setWalletAddress(accounts[0]);
                        }
                    } catch (e) {
                        console.log('No accounts available');
                    }
                }
            } catch (error) {
                console.error('Web3Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const connect = useCallback(async () => {
        if (!web3auth) {
            console.error('Web3Auth not initialized');
            return;
        }

        try {
            const web3authProvider = await web3auth.connect();
            setProvider(web3authProvider);

            if (web3authProvider) {
                try {
                    const userInfo = await web3auth.getUserInfo();
                    setUser(userInfo as Web3AuthUser);
                } catch (e) {
                    console.log('No user info available');
                }

                // Get wallet address
                try {
                    const accounts = await web3authProvider.request({ method: 'eth_accounts' }) as string[];
                    if (accounts && accounts.length > 0) {
                        setWalletAddress(accounts[0]);
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
            return userInfo as Web3AuthUser;
        } catch (error) {
            console.error('Get user info error:', error);
            return null;
        }
    }, [web3auth]);

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
