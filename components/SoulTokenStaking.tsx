/**
 * SOUL Token Staking Component
 * Allows users to stake SOUL tokens on both Ethereum/Sepolia and Solana
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { Connection } from '@solana/web3.js';
import { 
  stake,
  unstake,
  claimRewards,
  getStakeInfo,
  StakeInfo as ContractStakeInfo,
} from '../services/soulContractService';
import { getSolanaStakeInfo } from '../services/soulTokenService';
import SoulTokenBalance from './SoulTokenBalance';
import './SoulTokenStaking.css';

type ChainType = 'ethereum' | 'solana';
type ActionType = 'stake' | 'unstake' | 'claim';

interface SoulTokenStakingProps {
  onClose?: () => void;
}

// Interface for component state (using numbers for easy calculation)
interface ComponentStakeInfo {
  stakedAmount: number;
  stakedAt: number;
  pendingRewards: number;
  lastClaim: number;
}

const SoulTokenStaking: React.FC<SoulTokenStakingProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { provider, isConnected } = useWeb3Auth();
  const { currentChain, walletAddress } = useWallet();
  const { showToast } = useToast();

  // Solana connection (devnet for now)
  const solanaConnection = React.useMemo(() => {
    if (currentChain === 'solana') {
      return new Connection('https://api.devnet.solana.com', 'confirmed');
    }
    return null;
  }, [currentChain]);

  const isSolanaConnected = currentChain === 'solana' && walletAddress;

  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [action, setAction] = useState<ActionType>('stake');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<{ ethereum?: ComponentStakeInfo; solana?: ComponentStakeInfo }>({});

  // Get available chains
  const availableChains = useMemo(() => {
    const chains: ChainType[] = [];
    if (provider && isConnected) {
      chains.push('ethereum');
    }
    if (isSolanaConnected && solanaConnection) {
      chains.push('solana');
    }
    return chains;
  }, [provider, isConnected, isSolanaConnected, solanaConnection]);

  // Fetch stake info
  const fetchStakeInfo = useCallback(async () => {
    if (!user) return;

    try {
      // Get Ethereum address
      let ethAddress = null;
      if (provider && isConnected) {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          ethAddress = accounts[0];
        }
      }

      const [ethStakeData, solStakeData] = await Promise.all([
        ethAddress && provider
          ? getStakeInfo(ethAddress, provider).catch(() => undefined)
          : Promise.resolve(undefined),
        isSolanaConnected && solanaConnection && walletAddress
          ? getSolanaStakeInfo(walletAddress, solanaConnection).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);

      // Convert contract string data to numbers for component
      const ethStake: ComponentStakeInfo | undefined = ethStakeData ? {
        stakedAmount: parseFloat(ethStakeData.stakedAmount),
        stakedAt: parseFloat(ethStakeData.stakedAt),
        pendingRewards: parseFloat(ethStakeData.pendingRewards),
        lastClaim: parseFloat(ethStakeData.lastClaim),
      } : undefined;

      // Solana service returns numbers directly, matching ComponentStakeInfo
      const solStake: ComponentStakeInfo | undefined = solStakeData;

      setStakeInfo({
        ethereum: ethStake,
        solana: solStake,
      });
    } catch (error) {
      console.error('Error fetching stake info:', error);
    }
  }, [user, provider, isConnected, isSolanaConnected, solanaConnection, walletAddress]);

  // Initial fetch
  React.useEffect(() => {
    fetchStakeInfo();
    const interval = setInterval(fetchStakeInfo, 30000);
    return () => clearInterval(interval);
  }, [fetchStakeInfo]);

  const handleStake = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedChain === 'ethereum') {
        if (!provider) {
          throw new Error('Ethereum wallet not connected');
        }

        const { txHash } = await stake(parseFloat(amount), provider);
        showToast(`Staking transaction submitted: ${txHash.slice(0, 10)}...`, 'info');
        showToast('Successfully staked SOUL tokens!', 'success');
        await fetchStakeInfo();
      } else {
        // Solana staking - requires deployed Solana program
        if (!isSolanaConnected || !solanaConnection) {
          throw new Error('Solana wallet not connected');
        }
        // Solana staking program not yet deployed
        showToast('Solana staking requires the staking program to be deployed. Coming soon!', 'info');
      }

      setAmount('');
    } catch (error: any) {
      console.error('Staking error:', error);
      showToast(error.message || 'Failed to stake tokens', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, selectedChain, provider, isSolanaConnected, solanaConnection, showToast, fetchStakeInfo]);

  const handleUnstake = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const currentStake = selectedChain === 'ethereum' 
      ? stakeInfo.ethereum?.stakedAmount || 0
      : stakeInfo.solana?.stakedAmount || 0;

    if (parseFloat(amount) > currentStake) {
      showToast('Cannot unstake more than staked amount', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedChain === 'ethereum') {
        if (!provider) {
          throw new Error('Ethereum wallet not connected');
        }

        const { txHash } = await unstake(parseFloat(amount), provider);
        showToast(`Unstaking transaction submitted: ${txHash.slice(0, 10)}...`, 'info');
        showToast('Successfully unstaked SOUL tokens!', 'success');
        await fetchStakeInfo();
      } else {
        // Solana unstaking - requires deployed Solana program
        if (!isSolanaConnected || !solanaConnection) {
          throw new Error('Solana wallet not connected');
        }
        showToast('Solana unstaking requires the staking program to be deployed. Coming soon!', 'info');
      }
      setAmount('');
    } catch (error: any) {
      console.error('Unstaking error:', error);
      showToast(error.message || 'Failed to unstake tokens', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, selectedChain, stakeInfo, provider, isSolanaConnected, solanaConnection, showToast, fetchStakeInfo]);

  const handleClaimRewards = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (selectedChain === 'ethereum') {
        if (!provider) throw new Error('Wallet not connected');
        const { txHash, rewards } = await claimRewards(provider);
        showToast(`Claim transaction submitted: ${txHash.slice(0, 10)}...`, 'info');
        showToast(`Successfully claimed ${rewards} SOUL!`, 'success');
        await fetchStakeInfo();
      } else {
        // Solana claim rewards - requires deployed Solana program
        if (!isSolanaConnected || !solanaConnection) {
          throw new Error('Solana wallet not connected');
        }
        showToast('Solana claim rewards requires the staking program to be deployed. Coming soon!', 'info');
      }
    } catch (error: any) {
      console.error('Claim rewards error:', error);
      showToast(error.message || 'Failed to claim rewards', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedChain, provider, isSolanaConnected, solanaConnection, showToast, fetchStakeInfo]);

  const currentStakeInfo = selectedChain === 'ethereum' 
    ? stakeInfo.ethereum 
    : stakeInfo.solana;

  if (availableChains.length === 0) {
    return (
      <div className="soul-token-staking">
        <div className="soul-token-staking-empty">
          <p>Please connect a wallet to stake SOUL tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="soul-token-staking">
      <div className="soul-token-staking-header">
        <h2>Stake SOUL Tokens</h2>
        {onClose && (
          <button className="soul-token-staking-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {/* Balance Display */}
      <div className="soul-token-staking-balance">
        <SoulTokenBalance showStaking compact />
      </div>

      {/* Chain Selection */}
      {availableChains.length > 1 && (
        <div className="soul-token-staking-chains">
          {availableChains.map((chain) => (
            <button
              key={chain}
              className={`soul-token-staking-chain ${selectedChain === chain ? 'active' : ''}`}
              onClick={() => setSelectedChain(chain)}
            >
              {chain === 'ethereum' ? '🔷 Ethereum' : '🟣 Solana'}
            </button>
          ))}
        </div>
      )}

      {/* Action Selection */}
      <div className="soul-token-staking-actions">
        <button
          className={`soul-token-staking-action ${action === 'stake' ? 'active' : ''}`}
          onClick={() => setAction('stake')}
        >
          Stake
        </button>
        <button
          className={`soul-token-staking-action ${action === 'unstake' ? 'active' : ''}`}
          onClick={() => setAction('unstake')}
          disabled={!currentStakeInfo || currentStakeInfo.stakedAmount === 0}
        >
          Unstake
        </button>
        <button
          className={`soul-token-staking-action ${action === 'claim' ? 'active' : ''}`}
          onClick={() => setAction('claim')}
          disabled={!currentStakeInfo || currentStakeInfo.pendingRewards === 0}
        >
          Claim Rewards
        </button>
      </div>

      {/* Stake Info */}
      {currentStakeInfo && (
        <div className="soul-token-staking-info">
          <div className="soul-token-staking-info-item">
            <span>Staked:</span>
            <span>{currentStakeInfo.stakedAmount.toFixed(4)} SOUL</span>
          </div>
          <div className="soul-token-staking-info-item">
            <span>Pending Rewards:</span>
            <span>{currentStakeInfo.pendingRewards.toFixed(4)} SOUL</span>
          </div>
        </div>
      )}

      {/* Amount Input (for stake/unstake) */}
      {(action === 'stake' || action === 'unstake') && (
        <div className="soul-token-staking-input">
          <label>
            Amount ({action === 'stake' ? 'to stake' : 'to unstake'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isProcessing}
          />
          {action === 'unstake' && currentStakeInfo && (
            <button
              className="soul-token-staking-max"
              onClick={() => setAmount(currentStakeInfo.stakedAmount.toString())}
            >
              Max
            </button>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="soul-token-staking-submit">
        <button
          className="soul-token-staking-submit-btn"
          onClick={
            action === 'stake' 
              ? handleStake 
              : action === 'unstake' 
              ? handleUnstake 
              : handleClaimRewards
          }
          disabled={isProcessing || (action !== 'claim' && !amount)}
        >
          {isProcessing ? 'Processing...' : 
           action === 'stake' ? 'Stake Tokens' :
           action === 'unstake' ? 'Unstake Tokens' :
           'Claim Rewards'}
        </button>
      </div>
    </div>
  );
};

export default SoulTokenStaking;

