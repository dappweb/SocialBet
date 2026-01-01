import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { FileText, Download, ArrowLeft, TrendingUp, Users, Coins, Zap, Shield, BarChart3, Globe, Lock, Gift, ChevronUp } from 'lucide-react';
import { cn } from '../utils';
import './WhitePaper.css';

interface WhitePaperProps {
  onBack?: () => void;
}

const WhitePaper: React.FC<WhitePaperProps> = memo(({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sections = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'economics', label: 'Token Economics', icon: Coins },
    { id: 'distribution', label: 'Distribution', icon: Gift },
    { id: 'utility', label: 'Utility', icon: Zap },
    { id: 'governance', label: 'Governance', icon: Users },
    { id: 'roadmap', label: 'Roadmap', icon: TrendingUp },
  ], []);

  // Scroll spy to detect active section and calculate progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      setShowScrollTop(scrollPosition > 500);

      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Find which section is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId] || document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDownload = useCallback(() => {
    // In production, this would download a PDF version
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-white white-paper-content">
      {/* Mobile Message */}
      <div className="lg:hidden flex items-center justify-center min-h-screen p-6 no-print">
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
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#e5e5ea] z-50 no-print">
          <div
            className="h-full bg-[#ffd700] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#e5e5ea] shadow-sm white-paper-header no-print" style={{ top: '4px' }}>
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
                  <h1 className="text-xl font-semibold text-[#1d1d1f]">SOUL Token White Paper</h1>
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

        <div className="max-w-6xl mx-auto px-8 py-10 flex">
          {/* Table of Contents - Desktop Sidebar */}
          <div className="sticky top-24 h-[calc(100vh-120px)] w-64 shrink-0 bg-[#f5f5f7] border-r border-[#e5e5ea] overflow-y-auto no-scrollbar white-paper-sidebar no-print mr-8 rounded-2xl">
            <div className="px-4 py-6 space-y-1">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-4 px-2 uppercase tracking-wide">Table of Contents</h3>
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative group",
                      isActive
                        ? "bg-[#fff9e6] text-[#1d1d1f] border border-[#ffd700]/30 shadow-sm"
                        : "text-[#86868b] hover:bg-white hover:text-[#1d1d1f] border border-transparent"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ffd700] rounded-r-full" />
                    )}
                    <Icon
                      size={18}
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-[#ffd700]" : "text-[#86868b] group-hover:text-[#1d1d1f]"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isActive && "font-semibold"
                    )}>
                      {section.label}
                    </span>
                  </button>
                );
              })}
              <div className="mt-6 pt-6 border-t border-[#e5e5ea] px-2">
                <p className="text-xs text-[#86868b] mb-2">Keyboard Shortcuts</p>
                <div className="space-y-1 text-xs text-[#86868b]">
                  <div className="flex items-center justify-between">
                    <span>Print</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-[#e5e5ea] rounded text-[10px]">Ctrl+P</kbd>
                  </div>
                  {onBack && (
                    <div className="flex items-center justify-between">
                      <span>Go Back</span>
                      <kbd className="px-1.5 py-0.5 bg-white border border-[#e5e5ea] rounded text-[10px]">Esc</kbd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Section */}
            <section
              id="overview"
              ref={(el) => (sectionRefs.current['overview'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <div className="bg-gradient-to-br from-[#fff9e6] to-white rounded-2xl p-10 border border-[#ffd700]/20 mb-8 shadow-sm">
                <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-4 flex items-center gap-3">
                  <FileText className="text-[#ffd700]" size={28} />
                  Executive Summary
                </h2>
                <p className="text-[#1d1d1f] leading-relaxed text-lg mb-6 max-w-4xl">
                  The SOUL (SoulCast Token) is the native utility token of the SoulCast platform,
                  designed to power a decentralized KOL social intent prediction market ecosystem.
                  With a total supply of 2.1 billion tokens, SOUL serves as the economic backbone
                  for intent prediction, AI avatar creation, governance, rewards, and platform participation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5ea] hover:border-[#ffd700]/30 transition-colors duration-200">
                    <div className="text-3xl font-bold text-[#ffd700] mb-2">2.1B</div>
                    <div className="text-sm font-medium text-[#86868b]">Total Supply</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5ea] hover:border-[#ffd700]/30 transition-colors duration-200">
                    <div className="text-3xl font-bold text-[#ffd700] mb-2">Multi-Chain</div>
                    <div className="text-sm font-medium text-[#86868b]">ETH, SOL, BSC</div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-[#e5e5ea] hover:border-[#ffd700]/30 transition-colors duration-200">
                    <div className="text-3xl font-bold text-[#ffd700] mb-2">DAO</div>
                    <div className="text-sm font-medium text-[#86868b]">Governance</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Token Economics Section */}
            <section
              id="economics"
              ref={(el) => (sectionRefs.current['economics'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
                <Coins className="text-[#ffd700]" size={24} />
                Token Economics
              </h2>

              <div className="space-y-6">
                <div className="bg-white border border-[#e5e5ea] rounded-xl p-8 shadow-sm white-paper-card">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Token Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-[#86868b] mb-1">Token Name</div>
                      <div className="font-semibold text-[#1d1d1f]">SoulCast Token</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#86868b] mb-1">Token Symbol</div>
                      <div className="font-semibold text-[#1d1d1f]">SOUL</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#86868b] mb-1">Total Supply</div>
                      <div className="font-semibold text-[#1d1d1f]">2,100,000,000 SOUL</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#86868b] mb-1">Decimals</div>
                      <div className="font-semibold text-[#1d1d1f]">18</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e5e5ea] rounded-xl p-8 shadow-sm white-paper-card">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Economic Model</h3>
                  <p className="text-[#1d1d1f] leading-relaxed mb-6 text-base">
                    The SOUL token follows a deflationary economic model with multiple mechanisms
                    designed to create sustainable value:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap size={14} className="text-[#ffd700]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] mb-1">Issuance Fee Burn</div>
                        <div className="text-sm text-[#86868b]">Issued tokens are redeemed and destroyed by SoulCast as issuance fees, creating a deflationary mechanism that reduces supply over time.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BarChart3 size={14} className="text-[#ffd700]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] mb-1">Staking Rewards</div>
                        <div className="text-sm text-[#86868b]">Users can stake SOUL tokens to earn rewards and participate in platform governance.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Gift size={14} className="text-[#ffd700]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] mb-1">Reward Distribution</div>
                        <div className="text-sm text-[#86868b]">Active users receive SOUL tokens through airdrops, prediction rewards, and community participation.</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Distribution Section */}
            <section
              id="distribution"
              ref={(el) => (sectionRefs.current['distribution'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
                <Gift className="text-[#ffd700]" size={24} />
                Token Distribution
              </h2>

              <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
                <p className="text-[#1d1d1f] leading-relaxed mb-6">
                  The 2.1 billion SOUL tokens are distributed across multiple categories to ensure
                  fair distribution, community growth, and sustainable platform development:
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Community Rewards & Airdrops', percentage: 30, amount: '630M', color: 'bg-[#34c759]' },
                    { label: 'Intent Prediction Rewards', percentage: 25, amount: '525M', color: 'bg-[#ffd700]' },
                    { label: 'KOL & Creator Incentives', percentage: 15, amount: '315M', color: 'bg-[#007AFF]' },
                    { label: 'AI Avatar Development Fund', percentage: 10, amount: '210M', color: 'bg-[#ff9500]' },
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
                          <span className="text-sm text-[#86868b] ml-2">({item.amount} SOUL)</span>
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
            <section
              id="utility"
              ref={(el) => (sectionRefs.current['utility'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
                <Zap className="text-[#ffd700]" size={24} />
                Token Utility
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {useMemo(() => [
                  {
                    icon: Coins,
                    title: 'Intent Prediction & Payments',
                    description: 'Use SOUL tokens to place predictions on KOL intent markets, pay for AI avatar creation, and access premium features.',
                  },
                  {
                    icon: Users,
                    title: 'Governance',
                    description: 'Hold SOUL tokens to participate in DAO governance, vote on proposals, and influence platform development.',
                  },
                  {
                    icon: Gift,
                    title: 'Rewards & Airdrops',
                    description: 'Earn SOUL tokens through accurate predictions, market creation, referrals, and community participation.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Staking',
                    description: 'Stake SOUL tokens to earn passive rewards and unlock additional platform benefits and voting power.',
                  },
                  {
                    icon: Shield,
                    title: 'AI Avatar Features',
                    description: 'Access AI avatar creation, KOL digital soul customization, and advanced analytics with SOUL tokens.',
                  },
                  {
                    icon: Globe,
                    title: 'Liquidity Provision',
                    description: 'Provide liquidity to SOUL trading pairs and earn rewards while supporting token stability and market depth.',
                  },
                ], []).map((utility, index) => {
                  const Icon = utility.icon;
                  return (
                    <div key={index} className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 white-paper-card">
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
            <section
              id="governance"
              ref={(el) => (sectionRefs.current['governance'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
                <Users className="text-[#ffd700]" size={24} />
                DAO Governance
              </h2>

              <div className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm">
                <p className="text-[#1d1d1f] leading-relaxed mb-6">
                  SOUL token holders can participate in decentralized autonomous organization (DAO)
                  governance to shape the platform's future. Governance is token-weighted, meaning
                  voting power is proportional to SOUL holdings.
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-[#ffd700] pl-4">
                    <h4 className="font-semibold text-[#1d1d1f] mb-2">Proposal Creation</h4>
                    <p className="text-sm text-[#86868b]">
                      Token holders can create proposals for platform changes, AI development priorities,
                      feature additions, and treasury management. Minimum threshold: 1M SOUL tokens.
                    </p>
                  </div>

                  <div className="border-l-4 border-[#ffd700] pl-4">
                    <h4 className="font-semibold text-[#1d1d1f] mb-2">Voting Mechanism</h4>
                    <p className="text-sm text-[#86868b]">
                      Votes are weighted by SOUL token holdings. Proposals require a quorum of
                      1M SOUL tokens and majority approval to pass. Voting period: 7 days.
                    </p>
                  </div>

                  <div className="border-l-4 border-[#ffd700] pl-4">
                    <h4 className="font-semibold text-[#1d1d1f] mb-2">Treasury Management</h4>
                    <p className="text-sm text-[#86868b]">
                      The DAO controls the platform treasury and can allocate SOUL tokens for
                      AI avatar development, community rewards, partnerships, and platform growth.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Roadmap Section */}
            <section
              id="roadmap"
              ref={(el) => (sectionRefs.current['roadmap'] = el)}
              className="mb-20 scroll-mt-32 white-paper-section"
            >
              <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8 flex items-center gap-3">
                <TrendingUp className="text-[#ffd700]" size={24} />
                Development Roadmap
              </h2>

              <div className="space-y-6">
                {useMemo(() => [
                  {
                    phase: 'Phase 1: Launch',
                    quarter: 'Q1 2025',
                    items: [
                      'Token deployment on Ethereum, Solana, and BSC',
                      'Initial airdrop to early KOL prediction participants',
                      'Basic intent prediction market functionality',
                      'DAO governance setup',
                    ],
                  },
                  {
                    phase: 'Phase 2: Growth',
                    quarter: 'Q2-Q3 2025',
                    items: [
                      'AI Avatar creation for top KOLs',
                      'Enhanced prediction analytics',
                      'KOL digital soul integration',
                      'Community rewards expansion',
                    ],
                  },
                  {
                    phase: 'Phase 3: Robot Integration',
                    quarter: 'Q4 2025',
                    items: [
                      'Robot injection API for AI avatars',
                      'Cross-chain bridge integration',
                      'Advanced AI personality modeling',
                      'Partnership with robotics companies',
                    ],
                  },
                  {
                    phase: 'Phase 4: Global Expansion',
                    quarter: '2026+',
                    items: [
                      'Full robot ecosystem integration',
                      'Multi-language AI avatar support',
                      'Institutional KOL partnerships',
                      'Global market expansion',
                    ],
                  },
                ], []).map((phase, index) => (
                  <div key={index} className="bg-white border border-[#e5e5ea] rounded-xl p-6 shadow-sm white-paper-card">
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
                © 2025 SoulCast. All rights reserved. | Version 1.0 | Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-full shadow-lg shadow-[#ffd700]/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-40 no-print"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
});

WhitePaper.displayName = 'WhitePaper';

export default WhitePaper;

