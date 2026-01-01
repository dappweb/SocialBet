/**
 * SOUL Token Staking Component
 * Allows users to stake SOUL tokens on both Ethereum/Sepolia and Solana
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { 
  stakeEthereum,
  getEthereumStakeInfo,
  getSolanaStakeInfo,
  StakeInfo,
} from '../services/soulTokenService';
import SoulTokenBalance from './SoulTokenBalance';
import './SoulTokenStaking.css';

type ChainType = 'ethereum' | 'solana';
type ActionType = 'stake' | 'unstake' | 'claim';

interface SoulTokenStakingProps {
  onClose?: () => void;
}

const SoulTokenStaking: React.FC<SoulTokenStakingProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { provider, isConnected } = useWeb3Auth();
  const { solanaWallet, solanaConnection } = useWallet();
  const { showToast } = useToast();

  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [action, setAction] = useState<ActionType>('stake');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<{ ethereum?: StakeInfo; solana?: StakeInfo }>({});

  // Get available chains
  const availableChains = useMemo(() => {
    const chains: ChainType[] = [];
    if (provider && isConnected) {
      chains.push('ethereum');
    }
    if (solanaWallet && solanaConnection) {
      chains.push('solana');
    }
    return chains;
  }, [provider, isConnected, solanaWallet, solanaConnection]);

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

      const [ethStake, solStake] = await Promise.all([
        ethAddress && provider
          ? getEthereumStakeInfo(ethAddress, provider).catch(() => undefined)
          : Promise.resolve(undefined),
        solanaWallet?.publicKey && solanaConnection
          ? getSolanaStakeInfo(solanaWallet.publicKey.toString(), solanaConnection).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);

      setStakeInfo({
        ethereum: ethStake,
        solana: solStake,
      });
    } catch (error) {
      console.error('Error fetching stake info:', error);
    }
  }, [user, provider, isConnected, solanaWallet, solanaConnection]);

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

        const txHash = await stakeEthereum(parseFloat(amount), provider);
        showToast(`Staking transaction submitted: ${txHash.slice(0, 10)}...`, 'info');
        
        // Wait for confirmation (in production, use proper transaction waiting)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        showToast('Successfully staked SOUL tokens!', 'success');
        await fetchStakeInfo();
      } else {
        // Solana staking
        // TODO: Implement Solana staking
        showToast('Solana staking coming soon!', 'info');
      }

      setAmount('');
    } catch (error: any) {
      console.error('Staking error:', error);
      showToast(error.message || 'Failed to stake tokens', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, selectedChain, provider, showToast, fetchStakeInfo]);

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
      // TODO: Implement unstaking
      showToast('Unstaking functionality coming soon!', 'info');
      setAmount('');
    } catch (error: any) {
      console.error('Unstaking error:', error);
      showToast(error.message || 'Failed to unstake tokens', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [amount, selectedChain, stakeInfo, showToast]);

  const handleClaimRewards = useCallback(async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement claim rewards
      showToast('Claim rewards functionality coming soon!', 'info');
    } catch (error: any) {
      console.error('Claim rewards error:', error);
      showToast(error.message || 'Failed to claim rewards', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [showToast]);

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

