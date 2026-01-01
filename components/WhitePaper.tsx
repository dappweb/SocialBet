import React, { useState } from 'react';
import { FileText, Download, ArrowLeft, TrendingUp, Users, Coins, Zap, Shield, BarChart3, Globe, Lock, Gift } from 'lucide-react';
import { cn } from '../utils';

interface WhitePaperProps {
  onBack?: () => void;
}

const WhitePaper: React.FC<WhitePaperProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'economics', label: 'Token Economics', icon: Coins },
    { id: 'distribution', label: 'Distribution', icon: Gift },
    { id: 'utility', label: 'Utility', icon: Zap },
    { id: 'governance', label: 'Governance', icon: Users },
    { id: 'roadmap', label: 'Roadmap', icon: TrendingUp },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownload = () => {
    // In production, this would download a PDF version
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Message */}
      <div className="lg:hidden flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <FileText className="text-[#ffd700] mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">White Paper</h2>
          <p className="text-sm text-[#86868b] mb-6">
            The white paper is optimized for desktop viewing. Please access this page on a PC for the best experience.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-all duration-200"
            >
              Go Back
            </button>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#e5e5ea] shadow-sm">
          <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
              >
                <ArrowLeft size={20} className="text-[#86868b]" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffd700] rounded-xl flex items-center justify-center">
                <FileText className="text-[#1d1d1f]" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#1d1d1f]">SOS Token White Paper</h1>
                <p className="text-xs text-[#86868b]">Token Economics & Platform Model</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Table of Contents - Desktop Sidebar */}
        <div className="fixed left-0 top-0 h-screen w-72 bg-[#f5f5f7] border-r border-[#e5e5ea] pt-28 overflow-y-auto no-scrollbar">
          <div className="px-4 py-6 space-y-1">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4 px-2">Table of Contents</h3>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                    activeSection === section.id
                      ? "bg-[#fff9e6] text-[#1d1d1f] border border-[#ffd700]/30"
                      : "text-[#86868b] hover:bg-white hover:text-[#1d1d1f]"
                  )}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-72">
          {/* Overview Section */}
          <section id="overview" className="mb-20 scroll-mt-32">
            <div className="bg-gradient-to-br from-[#fff9e6] to-white rounded-2xl p-10 border border-[#ffd700]/20 mb-8 shadow-sm">
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-4 flex items-center gap-3">
                <FileText className="text-[#ffd700]" size={28} />
                Executive Summary
              </h2>
              <p className="text-[#1d1d1f] leading-relaxed text-lg mb-4">
                The SOS (SocialBet Token) is the native utility token of the SocialBet platform, 
                designed to power a decentralized social prediction market ecosystem. With a total 
                supply of 2.1 billion tokens, SOS serves as the economic backbone for betting, 
                governance, rewards, and platform participation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 border border-[#e5e5ea]">
                  <div className="text-2xl font-bold text-[#ffd700] mb-1">2.1B</div>
                  <div className="text-sm text-[#86868b]">Total Supply</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#e5e5ea]">
                  <div className="text-2xl font-bold text-[#ffd700] mb-1">Multi-Chain</div>
                  <div className="text-sm text-[#86868b]">ETH, SOL, BSC</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#e5e5ea]">
                  <div className="text-2xl font-bold text-[#ffd700] mb-1">DAO</div>
                  <div className="text-sm text-[#86868b]">Governance</div>
                </div>
              </div>
            </div>
          </section>

          {/* Token Economics Section */}
          <section id="economics" className="mb-20 scroll-mt-32">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
              <Coins className="text-[#ffd700]" size={24} />
              Token Economics
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Token Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#86868b] mb-1">Token Name</div>
                    <div className="font-semibold text-[#1d1d1f]">SocialBet Token</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b] mb-1">Token Symbol</div>
                    <div className="font-semibold text-[#1d1d1f]">SOS</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b] mb-1">Total Supply</div>
                    <div className="font-semibold text-[#1d1d1f]">2,100,000,000 SOS</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b] mb-1">Decimals</div>
                    <div className="font-semibold text-[#1d1d1f]">18</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Economic Model</h3>
                <p className="text-[#1d1d1f] leading-relaxed mb-4">
                  The SOS token follows a deflationary economic model with multiple mechanisms 
                  designed to create sustainable value:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap size={14} className="text-[#ffd700]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1d1d1f] mb-1">Transaction Fees</div>
                      <div className="text-sm text-[#86868b]">A portion of platform fees are used to buy back and burn SOS tokens, reducing supply over time.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BarChart3 size={14} className="text-[#ffd700]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1d1d1f] mb-1">Staking Rewards</div>
                      <div className="text-sm text-[#86868b]">Users can stake SOS tokens to earn rewards and participate in platform governance.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Gift size={14} className="text-[#ffd700]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1d1d1f] mb-1">Reward Distribution</div>
                      <div className="text-sm text-[#86868b]">Active users receive SOS tokens through airdrops, betting rewards, and community participation.</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Distribution Section */}
          <section id="distribution" className="mb-20 scroll-mt-32">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
              <Gift className="text-[#ffd700]" size={24} />
              Token Distribution
            </h2>
            
            <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
              <p className="text-[#1d1d1f] leading-relaxed mb-6">
                The 2.1 billion SOS tokens are distributed across multiple categories to ensure 
                fair distribution, community growth, and sustainable platform development:
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Community Rewards & Airdrops', percentage: 35, amount: '735M', color: 'bg-[#34c759]' },
                  { label: 'User Activity Rewards', percentage: 20, amount: '420M', color: 'bg-[#ffd700]' },
                  { label: 'Creator Incentives', percentage: 15, amount: '315M', color: 'bg-[#007AFF]' },
                  { label: 'Staking Rewards Pool', percentage: 10, amount: '210M', color: 'bg-[#ff9500]' },
                  { label: 'Liquidity Provision Rewards', percentage: 8, amount: '168M', color: 'bg-[#ff3b30]' },
                  { label: 'Platform Operations Reserve', percentage: 7, amount: '147M', color: 'bg-[#86868b]' },
                  { label: 'Team & Advisors (Vested)', percentage: 4, amount: '84M', color: 'bg-[#5856d6]' },
                  { label: 'Marketing & Partnerships', percentage: 1, amount: '21M', color: 'bg-[#af52de]' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded", item.color)}></div>
                        <span className="font-semibold text-[#1d1d1f]">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-[#1d1d1f]">{item.percentage}%</span>
                        <span className="text-sm text-[#86868b] ml-2">({item.amount} SOS)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Utility Section */}
          <section id="utility" className="mb-20 scroll-mt-32">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
              <Zap className="text-[#ffd700]" size={24} />
              Token Utility
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Coins,
                  title: 'Betting & Payments',
                  description: 'Use SOS tokens to place bets on prediction markets, pay for premium content, and access subscription tiers.',
                },
                {
                  icon: Users,
                  title: 'Governance',
                  description: 'Hold SOS tokens to participate in DAO governance, vote on proposals, and influence platform development.',
                },
                {
                  icon: Gift,
                  title: 'Rewards & Airdrops',
                  description: 'Earn SOS tokens through betting, market creation, referrals, and community participation activities.',
                },
                {
                  icon: BarChart3,
                  title: 'Staking',
                  description: 'Stake SOS tokens to earn passive rewards and unlock additional platform benefits and voting power.',
                },
                {
                  icon: Shield,
                  title: 'Premium Features',
                  description: 'Access premium features, creator subscriptions, exclusive markets, and advanced analytics with SOS tokens.',
                },
                {
                  icon: Globe,
                  title: 'Liquidity Provision',
                  description: 'Provide liquidity to SOS trading pairs and earn rewards while supporting token stability and market depth.',
                },
              ].map((utility, index) => {
                const Icon = utility.icon;
                return (
                  <div key={index} className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-xl bg-[#fff9e6] flex items-center justify-center mb-4">
                      <Icon className="text-[#ffd700]" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{utility.title}</h3>
                    <p className="text-sm text-[#86868b] leading-relaxed">{utility.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Governance Section */}
          <section id="governance" className="mb-20 scroll-mt-32">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
              <Users className="text-[#ffd700]" size={24} />
              DAO Governance
            </h2>
            
            <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
              <p className="text-[#1d1d1f] leading-relaxed mb-6">
                SOS token holders can participate in decentralized autonomous organization (DAO) 
                governance to shape the platform's future. Governance is token-weighted, meaning 
                voting power is proportional to SOS holdings.
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-[#ffd700] pl-4">
                  <h4 className="font-semibold text-[#1d1d1f] mb-2">Proposal Creation</h4>
                  <p className="text-sm text-[#86868b]">
                    Token holders can create proposals for platform changes, token allocation, 
                    feature additions, and treasury management. Minimum threshold: 1M SOS tokens.
                  </p>
                </div>
                
                <div className="border-l-4 border-[#ffd700] pl-4">
                  <h4 className="font-semibold text-[#1d1d1f] mb-2">Voting Mechanism</h4>
                  <p className="text-sm text-[#86868b]">
                    Votes are weighted by SOS token holdings. Proposals require a quorum of 
                    1M SOS tokens and majority approval to pass. Voting period: 7 days.
                  </p>
                </div>
                
                <div className="border-l-4 border-[#ffd700] pl-4">
                  <h4 className="font-semibold text-[#1d1d1f] mb-2">Treasury Management</h4>
                  <p className="text-sm text-[#86868b]">
                    The DAO controls the platform treasury and can allocate SOS tokens for 
                    liquidity provision, community rewards, partnerships, and development.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Roadmap Section */}
          <section id="roadmap" className="mb-20 scroll-mt-32">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
              <TrendingUp className="text-[#ffd700]" size={24} />
              Development Roadmap
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  phase: 'Phase 1: Launch',
                  quarter: 'Q1 2024',
                  items: [
                    'Token deployment on Ethereum, Solana, and BSC',
                    'Initial airdrop to early users',
                    'Basic staking functionality',
                    'DAO governance setup',
                  ],
                },
                {
                  phase: 'Phase 2: Growth',
                  quarter: 'Q2-Q3 2024',
                  items: [
                    'Expanded airdrop campaigns',
                    'Liquidity pool incentives',
                    'Enhanced staking rewards',
                    'Red envelope (Hongbao) feature launch',
                  ],
                },
                {
                  phase: 'Phase 3: Expansion',
                  quarter: 'Q4 2024',
                  items: [
                    'Cross-chain bridge integration',
                    'Advanced governance features',
                    'Token buyback and burn program',
                    'Partnership integrations',
                  ],
                },
                {
                  phase: 'Phase 4: Maturity',
                  quarter: '2025+',
                  items: [
                    'Full ecosystem integration',
                    'Institutional staking options',
                    'Advanced DeFi integrations',
                    'Global market expansion',
                  ],
                },
              ].map((phase, index) => (
                <div key={index} className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">{phase.phase}</h3>
                    <span className="px-3 py-1 bg-[#fff9e6] border border-[#ffd700]/30 rounded-lg text-sm font-semibold text-[#ffc107]">
                      {phase.quarter}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-[#86868b]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ffd700] mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-[#e5e5ea] text-center">
            <p className="text-sm text-[#86868b] mb-2">
              This white paper is for informational purposes only and does not constitute financial advice.
            </p>
            <p className="text-xs text-[#86868b]">
              © 2024 SocialBet. All rights reserved. | Version 1.0 | Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default WhitePaper;

