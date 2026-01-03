import React, { useState, useEffect } from 'react';
import { Users, Plus, TrendingUp, Clock, CheckCircle2, XCircle, Zap, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import { DAOProposal } from '../types';
import { cn, formatCurrency } from '../utils';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { BrowserProvider } from 'ethers';
import { getAllProposals, castVote, createProposal } from '../services/soulGovernorService';
import { useToast } from '../contexts/ToastContext';

const DAOGovernance: React.FC = () => {
  const { provider, isConnected } = useWeb3Auth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'proposals' | 'treasury'>('proposals');
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      if (isConnected && provider) {
        setIsLoading(true);
        try {
          const web3Provider = new BrowserProvider(provider);
          const data = await getAllProposals(web3Provider);
          setProposals(data);
        } catch (error) {
          console.error('Failed to fetch proposals:', error);
          showToast('Failed to load proposals', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProposals();
  }, [isConnected, provider, showToast]);

  const handleVote = async (proposalId: string, support: number) => {
    if (!provider) return;
    setIsVoting(proposalId);
    try {
      await castVote(proposalId, support, provider);
      showToast('Vote submitted successfully!', 'success');
      // Refresh proposals
      const web3Provider = new BrowserProvider(provider);
      const data = await getAllProposals(web3Provider);
      setProposals(data);
    } catch (error: any) {
      console.error('Vote failed:', error);
      showToast(error.message || 'Vote failed', 'error');
    } finally {
      setIsVoting(null);
    }
  };

  const handleCreateTestProposal = async () => {
    if (!provider) return;
    try {
        await createProposal(
            "Community Fund Allocation",
            "Allocate 1000 SOUL for community rewards",
            [], [], [],
            provider
        );
        showToast('Proposal created!', 'success');
        // Refresh
        const web3Provider = new BrowserProvider(provider);
        const data = await getAllProposals(web3Provider);
        setProposals(data);
    } catch (error: any) {
        console.error('Create proposal failed:', error);
        showToast(error.message || 'Failed to create proposal', 'error');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#fff9e6] border-[#ffd700]/30 text-[#ffc107]';
      case 'passed':
        return 'bg-[#34c759]/10 border-[#34c759]/30 text-[#34c759]';
      case 'rejected':
        return 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#ff3b30]';
      default:
        return 'bg-[#f5f5f7] border-[#e5e5ea] text-[#86868b]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock size={14} />;
      case 'passed':
        return <CheckCircle2 size={14} />;
      case 'rejected':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const calculateProgress = (proposal: DAOProposal) => {
    const total = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
    const yesPercent = total > 0 ? (proposal.yesVotes / total) * 100 : 0;
    return { yesPercent, total };
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen pb-20 sm:pb-0 bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#38383a] px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <Users className="text-[#ffd700]" size={24} />
              DAO Governance
            </h1>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">Decentralized community decision-making</p>
          </div>
          <button 
            onClick={handleCreateTestProposal}
            disabled={!provider}
            className="bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus size={18} />
            New Proposal (Test)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-black">
        <button
          onClick={() => setActiveTab('proposals')}
          className={cn(
            "flex-1 py-4 transition-colors duration-200 relative",
            activeTab === 'proposals' ? "text-[#1d1d1f] dark:text-white" : "text-[#86868b] dark:text-[#a1a1a6]"
          )}
        >
          <span className="font-semibold text-sm">Proposals</span>
          {activeTab === 'proposals' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-[#ffd700] rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('treasury')}
          className={cn(
            "flex-1 py-4 transition-colors duration-200 relative",
            activeTab === 'treasury' ? "text-[#1d1d1f] dark:text-white" : "text-[#86868b] dark:text-[#a1a1a6]"
          )}
        >
          <span className="font-semibold text-sm">Treasury</span>
          {activeTab === 'treasury' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-[#ffd700] rounded-full"></div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd700]"></div>
          </div>
        )}
        
        {!isLoading && activeTab === 'proposals' ? (
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="text-center py-10 text-[#86868b] dark:text-[#a1a1a6]">
                No proposals found. Create one to get started!
              </div>
            ) : proposals.map((proposal) => {
              const { yesPercent, total } = calculateProgress(proposal);
              const daysRemaining = Math.max(0, Math.ceil(
                (new Date(proposal.votingEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              ));

              return (
                <div
                  key={proposal.id}
                  className="bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusColor(proposal.status))}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                          {proposal.proposalType.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-2">
                        {proposal.title}
                      </h3>
                      <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mb-3 line-clamp-2">
                        {proposal.description}
                      </p>
                      {proposal.tokenAmount > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#1d1d1f] dark:text-white font-semibold">
                            Amount: <span className="text-[#ffd700]">{formatCurrency(proposal.tokenAmount)} SOS</span>
                          </span>
                          <span className="text-[#86868b] dark:text-[#a1a1a6]">
                            Target: {proposal.allocationTarget}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      <span>Voting Progress</span>
                      <span>{daysRemaining} days remaining</span>
                    </div>
                    <div className="h-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ffd700] rounded-full transition-all duration-300"
                        style={{ width: `${yesPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-[#34c759] font-semibold">
                          Yes: {formatCurrency(proposal.yesVotes)} SOS
                        </span>
                        <span className="text-[#ff3b30] font-semibold">
                          No: {formatCurrency(proposal.noVotes)} SOS
                        </span>
                        <span className="text-gray-500 font-semibold dark:text-gray-400">
                          Abstain: {formatCurrency(proposal.abstainVotes)} SOS
                        </span>
                      </div>
                      <span className="text-[#86868b] dark:text-[#a1a1a6]">
                        Total: {formatCurrency(total)} SOS
                      </span>
                    </div>
                  </div>


                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button 
                        onClick={() => handleVote(proposal.id, 1)}
                        disabled={isVoting === proposal.id || proposal.status !== 'active'}
                        className="flex-1 bg-[#34c759]/10 hover:bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/30 py-2 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <ThumbsUp size={16} />
                      Vote Yes
                    </button>
                    <button 
                        onClick={() => handleVote(proposal.id, 0)}
                        disabled={isVoting === proposal.id || proposal.status !== 'active'}
                        className="flex-1 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 py-2 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <ThumbsDown size={16} />
                      Vote No
                    </button>
                    <button 
                        onClick={() => handleVote(proposal.id, 2)}
                        disabled={isVoting === proposal.id || proposal.status !== 'active'}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 py-2 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <MinusCircle size={16} />
                      Abstain
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Treasury Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#1d1d1f]">DAO Treasury</h3>
                  <TrendingUp className="text-[#ffd700]" size={20} />
                </div>
                <div className="text-3xl font-bold text-[#1d1d1f] mb-1">
                  {formatCurrency(MOCK_DAO_BALANCE)}
                </div>
                <div className="text-sm text-[#86868b]">SOS Tokens</div>
              </div>

              <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#1d1d1f]">Platform Balance</h3>
                  <Zap className="text-[#ffd700]" size={20} />
                </div>
                <div className="text-3xl font-bold text-[#1d1d1f] mb-1">
                  {formatCurrency(MOCK_PLATFORM_BALANCE)}
                </div>
                <div className="text-sm text-[#86868b]">SOS Tokens on PC Platform</div>
              </div>
            </div>

            {/* Recent Contributions */}
            <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Recent Token Contributions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div>
                    <div className="font-semibold text-sm text-[#1d1d1f]">Liquidity Pool Addition</div>
                    <div className="text-xs text-[#86868b]">2 days ago</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#ffd700]">+500K SOS</div>
                    <div className="text-xs text-[#86868b]">Ethereum Pool</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div>
                    <div className="font-semibold text-sm text-[#1d1d1f]">Community Rewards</div>
                    <div className="text-xs text-[#86868b]">5 days ago</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#ffd700]">+200K SOS</div>
                    <div className="text-xs text-[#86868b]">Reward Pool</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DAOGovernance;

