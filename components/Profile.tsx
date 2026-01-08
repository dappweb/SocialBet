import React, { useState, memo, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Calendar, Link as LinkIcon, MapPin, ArrowLeft, Ghost, LogIn, AlertCircle, BarChart3 } from 'lucide-react';
import { MOCK_MARKETS } from '../constants';
import PredictionCard from './PredictionCard';
import { PredictionMarket, BetType } from '../types';
import { cn } from '../utils';
import { usersApi, marketsApi } from '../services/api';
import LazyImage from './LazyImage';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import EditProfileModal from './EditProfileModal';
import AchievementsPage from './AchievementsPage';
import UserStatsDashboard from './UserStatsDashboard';
import QuickNavigation from './QuickNavigation';

const TradingDashboard = lazy(() => import('./TradingDashboard'));

interface ProfileProps {
  onBack?: () => void;
  onLoginClick?: () => void;
}

type ProfileTab = 'bets' | 'created' | 'trading' | 'achievements';

// Moved outside Profile component to prevent recreation on every render
const TabButton = memo(({ id, label, activeTab, onClick }: { id: ProfileTab, label: string, activeTab: ProfileTab, onClick: (id: ProfileTab) => void }) => (
  <button
    onClick={() => onClick(id)}
    className="flex-1 py-4 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] transition-colors duration-200 relative"
    aria-label={label}
  >
    <span className={cn("font-semibold text-sm transition-colors duration-200", activeTab === id ? "text-[#1d1d1f] dark:text-white" : "text-[#86868b] dark:text-[#a1a1a6]")}>
      {label}
    </span>
    {activeTab === id && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#ffd700] rounded-full"></div>
    )}
  </button>
));

TabButton.displayName = 'TabButton';

const Profile: React.FC<ProfileProps> = memo(({ onBack, onLoginClick }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('bets');
  const [userMarkets, setUserMarkets] = useState<PredictionMarket[]>([]);
  const [allMarkets, setAllMarkets] = useState<PredictionMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({ betsCount: 0 });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [savedAuth, setSavedAuth] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Check for saved auth in localStorage as fallback (for mobile persistence)
  // Make it reactive so it updates when auth state changes
  useEffect(() => {
    const checkSavedAuth = () => {
      try {
        const saved = localStorage.getItem('socialbet_auth');
        const parsed = saved ? JSON.parse(saved) : null;
        setSavedAuth(parsed);
        return parsed;
      } catch {
        setSavedAuth(null);
        return null;
      }
    };
    
    // Check immediately
    checkSavedAuth();
    
    // Also check periodically in case localStorage is updated elsewhere
    const interval = setInterval(checkSavedAuth, 1000);
    
    // Listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = () => {
      checkSavedAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Use authenticated user data, saved auth, or fallback to mock data
  const displayUser = useMemo(() => {
    if (isAuthenticated && user) {
      return {
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        twitter: user.twitter,
        github: user.github,
        joinedAt: user.joinedAt,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
      };
    }
    
    // Fallback to saved auth from localStorage (for mobile persistence)
    if (savedAuth?.user) {
      return {
        name: savedAuth.user.name,
        handle: savedAuth.user.handle,
        avatar: savedAuth.user.avatar,
        bio: savedAuth.user.bio,
        location: savedAuth.user.location,
        website: savedAuth.user.website,
        twitter: savedAuth.user.twitter,
        github: savedAuth.user.github,
        joinedAt: savedAuth.user.joinedAt,
        followersCount: savedAuth.user.followersCount || 0,
        followingCount: savedAuth.user.followingCount || 0,
      };
    }
    
    // Final fallback to mock user for demo
    return {
      name: 'Degen Trader',
      handle: '@degen_eth',
      avatar: 'https://picsum.photos/id/100/200/200',
      bio: 'Full-time crypto speculator. Betting on volatility. Not financial advice. 🚀',
      location: 'Metaverse',
      website: 'https://degentrader.eth',
      twitter: 'degentrader',
      github: 'degentrader',
      joinedAt: '2021-09-01',
      followersCount: 6900,
      followingCount: 420,
    };
  }, [isAuthenticated, user, savedAuth]);

  // Show login prompt ONLY if not authenticated AND no saved auth
  // This ensures profile is accessible when logged in
  useEffect(() => {
    // Check both isAuthenticated and savedAuth for mobile persistence
    const hasAuth = isAuthenticated || user || (savedAuth?.user !== null && savedAuth?.user !== undefined);
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile auth check:', {
        isAuthenticated,
        hasUser: !!user,
        hasSavedAuth: !!savedAuth?.user,
        hasAuth,
        showLoginPrompt: !hasAuth
      });
    }
    
    // Only show login prompt if we truly have no authentication
    // Add a small delay to avoid race conditions during auth initialization
    const timer = setTimeout(() => {
      setShowLoginPrompt(!hasAuth);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, savedAuth, user]);

  // Fetch user data and markets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [markets, stats] = await Promise.all([
          marketsApi.getAll(),
          usersApi.getStats('me').catch(() => ({ betsPlaced: 0 })),
        ]);
        setAllMarkets(markets as PredictionMarket[]);
        setUserMarkets((markets as PredictionMarket[]).filter(m => m.creator.id === 'me' || m.creator.handle === '@degen_eth'));
        setUserStats({ betsCount: stats.betsPlaced || 0 });
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setAllMarkets(MOCK_MARKETS);
        setUserMarkets(MOCK_MARKETS.filter(m => m.creator.handle === '@degen_eth'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Data for tabs
  const userBets = useMemo(() => allMarkets.slice(0, 3), [allMarkets]);
  const createdMarkets = useMemo(() => userMarkets, [userMarkets]);
  const likedMarkets = useMemo(() => allMarkets.slice(2, 4), [allMarkets]);

  const handleBet = useCallback((market: PredictionMarket, type: BetType) => {
    try {
      console.log("Bet clicked on profile", {
        marketId: market.id,
        question: market.question,
        type,
        outcomeStats: market.outcomeStats
      });
      
      // TODO: Implement actual betting logic
      // For now, just show a success message
      const message = `✅ Bet ${type} placed successfully!\n\n📊 Market: ${market.question}\n💰 Price: ${Math.floor((type === 'YES' ? market.outcomeStats?.yesPrice : market.outcomeStats?.noPrice || 0.5) * 100)}¢\n\nThis is a demo. Actual betting functionality coming soon!`;
      
      // Use a more user-friendly notification
      if (confirm(message)) {
        console.log("User confirmed bet placement");
      }
    } catch (error) {
      console.error("Error in handleBet:", error);
      alert("❌ An error occurred while placing bet. Please try again.");
    }
  }, []);

  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab);
  }, []);

  const renderContent = () => {
    // Show Trading Dashboard for trading tab
    if (activeTab === 'trading') {
      return (
        <Suspense fallback={<LoadingSpinner text="Loading trading dashboard..." />}>
          <div className="p-4">
            <TradingDashboard markets={allMarkets} />
          </div>
        </Suspense>
      );
    }

    // Show Achievements Page
    if (activeTab === 'achievements') {
      return (
        <Suspense fallback={<LoadingSpinner text="Loading achievements..." />}>
          <AchievementsPage onBack={() => setActiveTab('bets')} />
        </Suspense>
      );
    }

    let data = userBets;
    let emptyMsg = "No bets placed yet.";

    if (activeTab === 'created') {
      data = createdMarkets;
      emptyMsg = "No markets created yet.";
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-[#86868b] dark:text-[#a1a1a6]">
          <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-full p-6 mb-4">
            <Ghost size={40} className="opacity-50" />
          </div>
          <p className="font-medium">{emptyMsg}</p>
        </div>
      );
    }

    return data.map(market => (
      <div key={market.id} className="relative animate-in fade-in duration-300">
        {activeTab === 'bets' && (
          <div className="px-5 pt-4 pb-1 text-[11px] font-semibold text-[#86868b] flex items-center gap-2 uppercase tracking-wide">
            <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
            <span>You bet YES • $500.00</span>
          </div>
        )}
        <PredictionCard market={market} onBet={handleBet} />
      </div>
    ));
  };

  // Determine if we should show login prompt
  // Only show if we have NO authentication at all (neither isAuthenticated nor savedAuth)
  const hasAnyAuth = isAuthenticated || user || (savedAuth?.user !== null && savedAuth?.user !== undefined);
  const shouldShowLoginPrompt = !hasAnyAuth;
  
  if (shouldShowLoginPrompt) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50 bg-white dark:bg-[#0a0a0a]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e] shadow-sm">
          <button onClick={() => onBack?.()} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200 group">
            <ArrowLeft size={20} className="text-[#86868b] group-hover:text-[#1d1d1f] dark:group-hover:text-white" />
          </button>
          <div>
            <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f] dark:text-white">Profile</h1>
          </div>
        </div>

        {/* Login Prompt */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-[#fff9e6] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} className="text-[#ff9500]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Sign In Required</h2>
              <p className="text-sm text-[#86868b]">
                Please sign in to view your profile and trading history.
              </p>
            </div>
            <button
              onClick={() => onLoginClick?.()}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-lg shadow-[#ffd700]/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
            <p className="text-xs text-[#86868b]">
              Your session will be saved for easy access next time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50 bg-white dark:bg-[#0a0a0a]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e] shadow-sm">
        <button onClick={() => onBack?.()} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200 group">
          <ArrowLeft size={20} className="text-[#86868b] group-hover:text-[#1d1d1f] dark:group-hover:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f] dark:text-white">Profile</h1>
          <p className="text-xs text-[#86868b]">
            {displayUser.name} • {displayUser.followersCount.toLocaleString()} followers
          </p>
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200 group"
        >
          <BarChart3 size={20} className="text-[#86868b] group-hover:text-[#1d1d1f]" />
        </button>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-[#e5e5ea] bg-white/50 backdrop-blur-sm">
            <div className="h-full overflow-y-auto">
              <UserStatsDashboard className="border-b border-[#e5e5ea]" />
              <QuickNavigation />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Info */}
          <div className="px-5 relative mb-4">
            <div className="absolute -top-14 sm:-top-16 left-5">
              <LazyImage
                src={displayUser.avatar}
                alt={displayUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#1c1c1e] object-cover bg-white dark:bg-[#1c1c1e] shadow-lg"
              />
            </div>
            <div className="flex justify-end py-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-2 border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl font-semibold text-sm hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:border-[#ffd700] transition-all duration-200 active:scale-95 text-[#1d1d1f] dark:text-white"
              >
                Edit Profile
              </button>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                {displayUser.name}
                {user?.isVerified && (
                  <svg className="w-5 h-5 text-[#ffd700]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </h2>
              <p className="text-[#86868b] font-medium">{displayUser.handle}</p>

              {/* Bio */}
              {displayUser.bio && (
                <p className="mt-4 text-[#1d1d1f] dark:text-[#e5e5ea] text-[15px] leading-relaxed max-w-md">
                  {displayUser.bio}
                </p>
              )}

              {/* Location and Links */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[#86868b] text-sm">
                {/* Location */}
                {displayUser.location && (
                  <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-default">
                    <MapPin size={16} /> <span>{displayUser.location}</span>
                  </div>
                )}
                
                {/* Website */}
                {displayUser.website && (
                  <div className="flex items-center gap-1.5 hover:text-[#ffd700] transition-colors duration-200 cursor-pointer">
                    <LinkIcon size={16} /> 
                    <a 
                      href={displayUser.website.startsWith('http') ? displayUser.website : `https://${displayUser.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {displayUser.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                
                {/* Twitter */}
                {displayUser.twitter && (
                  <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">
                    <LinkIcon size={16} /> 
                    <a 
                      href={`https://twitter.com/${displayUser.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      @{displayUser.twitter}
                    </a>
                  </div>
                )}
                
                {/* GitHub */}
                {displayUser.github && (
                  <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-pointer">
                    <LinkIcon size={16} /> 
                    <a 
                      href={`https://github.com/${displayUser.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {displayUser.github}
                    </a>
                  </div>
                )}
                
                {/* Join Date */}
                {displayUser.joinedAt && (
                  <div className="flex items-center gap-1.5 hover:text-[#1d1d1f] transition-colors duration-200 cursor-default">
                    <Calendar size={16} /> 
                    <span>Joined {new Date(displayUser.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Follow Stats */}
              <div className="flex gap-6 mt-5 text-sm">
                <div className="hover:underline cursor-pointer group">
                  <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ffd700] transition-colors duration-200">
                    {displayUser.followingCount.toLocaleString()}
                  </span> 
                  <span className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors duration-200">Following</span>
                </div>
                <div className="hover:underline cursor-pointer group">
                  <span className="font-semibold text-[#1d1d1f] group-hover:text-[#ffd700] transition-colors duration-200">
                    {displayUser.followersCount >= 1000 
                      ? `${(displayUser.followersCount / 1000).toFixed(1)}K`
                      : displayUser.followersCount.toLocaleString()
                    }
                  </span> 
                  <span className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors duration-200">Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e] bg-white dark:bg-[#0a0a0a] overflow-x-auto">
            <TabButton id="bets" label="Bets" activeTab={activeTab} onClick={handleTabChange} />
            <TabButton id="created" label="Created" activeTab={activeTab} onClick={handleTabChange} />
            <TabButton id="trading" label="Trading" activeTab={activeTab} onClick={handleTabChange} />
            <TabButton id="achievements" label="Achievements" activeTab={activeTab} onClick={handleTabChange} />
          </div>

          {/* Content List */}
          <div className="min-h-[200px]">
            {renderContent()}
          </div>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
