/**
 * SOUL Token Balance Component
 * Displays SOUL token balance across multiple chains (Ethereum/Sepolia and Solana)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  getTotalBalance, 
  TokenBalance, 
  getEthereumStakeInfo,
  getSolanaStakeInfo,
  StakeInfo,
  SOUL_TOKEN_CONFIG 
} from '../services/soulTokenService';
import { Connection, PublicKey } from '@solana/web3.js';
import './SoulTokenBalance.css';

interface SoulTokenBalanceProps {
  showStaking?: boolean;
  compact?: boolean;
}

const SoulTokenBalance: React.FC<SoulTokenBalanceProps> = ({ 
  showStaking = false,
  compact = false 
}) => {
  const { user, soulBalance } = useAuth();
  const { web3auth, provider, isConnected } = useWeb3Auth();
  const { solanaWallet, solanaConnection } = useWallet();

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stakeInfo, setStakeInfo] = useState<{ ethereum?: StakeInfo; solana?: StakeInfo }>({});

  // Get addresses
  const ethereumAddress = useMemo(() => {
    if (provider && isConnected) {
      // Will be fetched from provider
      return null;
    }
    return null;
  }, [provider, isConnected]);

  const solanaAddress = useMemo(() => {
    if (solanaWallet?.publicKey) {
      return solanaWallet.publicKey.toString();
    }
    return null;
  }, [solanaWallet]);

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get Ethereum address from provider
        let ethAddress = null;
        if (provider && isConnected) {
          try {
            const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
            if (accounts && accounts.length > 0) {
              ethAddress = accounts[0];
            }
          } catch (error) {
            console.error('Error getting Ethereum address:', error);
          }
        }

        // Get Solana connection
        let connection: Connection | null = null;
        if (solanaConnection) {
          connection = solanaConnection;
        } else if (solanaAddress) {
          // Create connection if not available
          connection = new Connection(
            process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
            'confirmed'
          );
        }

        const result = await getTotalBalance(
          ethAddress,
          solanaAddress,
          provider || null,
          connection
        );

        setBalances(result.balances);
        setTotalBalance(result.total);

        // Fetch staking info if enabled
        if (showStaking) {
          const [ethStake, solStake] = await Promise.all([
            ethAddress && provider
              ? getEthereumStakeInfo(ethAddress, provider).catch(() => undefined)
              : Promise.resolve(undefined),
            solanaAddress && connection
              ? getSolanaStakeInfo(solanaAddress, connection).catch(() => undefined)
              : Promise.resolve(undefined),
          ]);

          setStakeInfo({
            ethereum: ethStake,
            solana: solStake,
          });
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();

    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [user, provider, isConnected, solanaAddress, solanaConnection, showStaking]);

  if (compact) {
    return (
      <div className="soul-token-balance-compact">
        <div className="soul-token-icon">💎</div>
        <div className="soul-token-info">
          <div className="soul-token-label">SOUL</div>
          {isLoading ? (
            <div className="soul-token-amount loading">...</div>
          ) : (
            <div className="soul-token-amount">
              {totalBalance > 0 ? totalBalance.toFixed(2) : soulBalance.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="soul-token-balance">
      <div className="soul-token-balance-header">
        <h3>SOUL Token Balance</h3>
        <div className="soul-token-total">
          <span className="soul-token-total-label">Total:</span>
          <span className="soul-token-total-amount">
            {isLoading ? (
              <span className="loading">Loading...</span>
            ) : (
              <>
                {totalBalance > 0 ? totalBalance.toFixed(4) : soulBalance.toFixed(4)} SOUL
              </>
            )}
          </span>
        </div>
      </div>

      <div className="soul-token-balance-chains">
        {balances.length === 0 && !isLoading && (
          <div className="soul-token-no-balance">
            <p>No SOUL tokens found on connected chains.</p>
            <p className="soul-token-hint">Connect your wallet to view balances.</p>
          </div>
        )}

        {balances.map((balance, index) => (
          <div key={index} className="soul-token-chain-balance">
            <div className="soul-token-chain-header">
              <div className="soul-token-chain-info">
                <span className="soul-token-chain-name">
                  {balance.chain === 'ethereum' ? '🔷' : '🟣'} {balance.chain.toUpperCase()}
                </span>
                <span className="soul-token-chain-network">{balance.network}</span>
              </div>
              <div className="soul-token-chain-amount">
                {balance.formatted} SOUL
              </div>
            </div>
            {showStaking && balance.chain === 'ethereum' && stakeInfo.ethereum && (
              <div className="soul-token-staking-info">
                <div className="soul-token-staking-item">
                  <span>Staked:</span>
                  <span>{stakeInfo.ethereum.stakedAmount.toFixed(4)} SOUL</span>
                </div>
                <div className="soul-token-staking-item">
                  <span>Rewards:</span>
                  <span>{stakeInfo.ethereum.pendingRewards.toFixed(4)} SOUL</span>
                </div>
              </div>
            )}
            {showStaking && balance.chain === 'solana' && stakeInfo.solana && (
              <div className="soul-token-staking-info">
                <div className="soul-token-staking-item">
                  <span>Staked:</span>
                  <span>{stakeInfo.solana.stakedAmount.toFixed(4)} SOUL</span>
                </div>
                <div className="soul-token-staking-item">
                  <span>Rewards:</span>
                  <span>{stakeInfo.solana.pendingRewards.toFixed(4)} SOUL</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLoading && balances.length === 0 && (
        <div className="soul-token-loading">
          <div className="soul-token-spinner"></div>
          <p>Loading balances...</p>
        </div>
      )}
    </div>
  );
};

export default SoulTokenBalance;

