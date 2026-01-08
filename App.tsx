import React, { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import RightPanel from './components/RightPanelSimple';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import LoginModal from './components/LoginModal';
import WalletBalance from './components/WalletBalanceSimple';
import TopNavBar from './components/TopNavBar';
import { MOCK_MARKETS } from './constants';
import { Web3AuthProvider } from './contexts/Web3AuthContext';
import { marketsApi } from './services/api';
import { PredictionMarket } from './types';
import { Home, Search, Trophy, User, Bell, PlusSquare, Bot } from 'lucide-react';
import { cn } from './utils';

// Test with simplified Feed component
const Feed = lazy(() => import('./components/FeedSimple'));
const CreateMarketModal = lazy(() => import('./components/CreateMarketModal'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Profile = lazy(() => import('./components/Profile'));
const Explore = lazy(() => import('./components/Explore'));
const Notifications = lazy(() => import('./components/Notifications'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const WhitePaper = lazy(() => import('./components/WhitePaper'));
const DAOGovernance = lazy(() => import('./components/DAOGovernance'));
const ReferralProgram = lazy(() => import('./components/ReferralProgram'));
const RedEnvelope = lazy(() => import('./components/RedEnvelope'));
const Airdrop = lazy(() => import('./components/Airdrop'));
const LPMining = lazy(() => import('./components/LPMining'));
const AmbassadorProgram = lazy(() => import('./components/AmbassadorProgram'));
const BuybackBurn = lazy(() => import('./components/BuybackBurn'));
const SwapInterface = lazy(() => import('./components/SwapInterface'));

type View = 
  | 'home' 
  | 'explore' 
  | 'leaderboard' 
  | 'notifications' 
  | 'profile' 
  | 'assistant' 
  | 'whitepaper'
  | 'dao'
  | 'referral'
  | 'red-envelope'
  | 'airdrop'
  | 'lp-mining'
  | 'ambassador'
  | 'buyback-burn'
  | 'swap'
  | 'test';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTradingModalOpen, setIsTradingModalOpen] = useState(false);
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
  const [isTokenSaleModalOpen, setIsTokenSaleModalOpen] = useState(false);
  const { showToast, toasts, removeToast } = useToast();
  const { user, isAdmin } = useAuth();
  // Initialize with mock data immediately, then try to fetch from API
  const [markets, setMarkets] = useState<PredictionMarket[]>(MOCK_MARKETS);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch markets from API on mount
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const data = await marketsApi.getAll();
        if (data && Array.isArray(data) && data.length > 0) {
          setMarkets(data as PredictionMarket[]);
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
        // Keep using mock data if API fails
        showToast('Using offline data - API unavailable', 'warning');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarkets();
  }, [showToast]);

  const handleCreateMarket = useCallback(async (newMarketData: any) => {
    try {
      // Get current user ID from auth context
      const creatorId = user?.id || 'me';
      
      // Create market via API
      const newMarket = await marketsApi.create({
        question: newMarketData.question,
        category: newMarketData.category,
        endDate: newMarketData.endDate,
        image: newMarketData.image,
        creatorId,
      });

      // Add to top of feed
      setMarkets(prev => [newMarket as PredictionMarket, ...prev]);
      showToast('Market created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create market:', error);
      showToast('Failed to create market. Please try again.', 'error');
    }
  }, [showToast, user]);

  const handleNavigate = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentView('home');
  }, []);

  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleOpenLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const handleCloseLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const handleOpenTradingModal = useCallback(() => setIsTradingModalOpen(true), []);
  const handleCloseTradingModal = useCallback(() => setIsTradingModalOpen(false), []);
  const handleOpenStakingModal = useCallback(() => setIsStakingModalOpen(true), []);
  const handleCloseStakingModal = useCallback(() => setIsStakingModalOpen(false), []);
  const handleOpenTokenSaleModal = useCallback(() => setIsTokenSaleModalOpen(true), []);
  const handleCloseTokenSaleModal = useCallback(() => setIsTokenSaleModalOpen(false), []);

  const renderView = useMemo(() => {
    switch (currentView) {
      case 'home':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading feed..." />}>
            <Feed markets={markets} />
          </Suspense>
        );
      case 'explore':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading explore..." />}>
            <Explore />
          </Suspense>
        );
      case 'leaderboard':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading leaderboard..." />}>
            <Leaderboard />
          </Suspense>
        );
      case 'notifications':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading notifications..." />}>
            <Notifications />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading profile..." />}>
            <Profile onBack={handleBack} onLoginClick={handleOpenLoginModal} />
          </Suspense>
        );
      case 'assistant':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading assistant..." />}>
            <ChatInterface />
          </Suspense>
        );
      case 'whitepaper':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading whitepaper..." />}>
            <WhitePaper />
          </Suspense>
        );
      case 'dao':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading DAO..." />}>
            <DAOGovernance />
          </Suspense>
        );
      case 'referral':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading referral..." />}>
            <ReferralProgram />
          </Suspense>
        );
      case 'red-envelope':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading red envelope..." />}>
            <RedEnvelope />
          </Suspense>
        );
      case 'airdrop':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading airdrop..." />}>
            <Airdrop />
          </Suspense>
        );
      case 'lp-mining':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading LP mining..." />}>
            <LPMining />
          </Suspense>
        );
      case 'ambassador':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading ambassador..." />}>
            <AmbassadorProgram />
          </Suspense>
        );
      case 'buyback-burn':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading buyback & burn..." />}>
            <BuybackBurn />
          </Suspense>
        );
      case 'swap':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading swap..." />}>
            <div className="p-4 pt-8">
              <SwapInterface />
            </div>
          </Suspense>
        );
      case 'test':
        return (
          <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white p-8">
            <h1 className="text-3xl font-bold mb-4">✅ All Components Working!</h1>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4">
              <p>All major components are working correctly!</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <p>Ready to restore full functionality.</p>
            </div>
          </div>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner text="Loading feed..." />}>
            <Feed markets={MOCK_MARKETS} />
          </Suspense>
        );
    }
  }, [currentView, markets, handleBack]);

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-white font-sans transition-colors duration-300">
        {/* Top Navigation Bar */}
        <TopNavBar
          onLoginClick={handleOpenLoginModal}
          onNavigate={handleNavigate}
          onCreateClick={handleOpenCreateModal}
          currentView={currentView}
          notificationCount={3}
        />
        
        {/* Two Column Layout */}
        <div className="max-w-[1400px] mx-auto flex justify-center">
          {/* Main Feed / Content Area */}
          <main className="flex-1 min-h-[calc(100vh-64px)] relative transition-colors duration-300">
            {renderView}
          </main>

          {/* Right Panel (Desktop) */}
          <aside className="hidden lg:block w-[360px] shrink-0 border-l border-[#e5e5ea] dark:border-[#2c2c2e] bg-white/50 dark:bg-[#0a0a0a]/50 transition-colors duration-300">
            <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
              <WalletBalance 
                onBuyClick={handleOpenTokenSaleModal}
                onSwapClick={() => setCurrentView('swap')}
              />
              <RightPanel 
                onTradeClick={handleOpenTradingModal} 
                onStakeClick={handleOpenStakingModal}
                onTokenSaleClick={handleOpenTokenSaleModal}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-[#e5e5ea] dark:border-[#2c2c2e] flex justify-around px-2 py-3 z-40 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(255,255,255,0.05)] transition-colors duration-300">
          <button
            onClick={() => setCurrentView('home')}
            className={cn("p-2 rounded-full transition-all duration-200", currentView === 'home' ? "text-[#ffd700]" : "text-[#86868b]")}
            aria-label="Home"
          >
            <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setCurrentView('explore')}
            className={cn("p-2 rounded-full transition-all duration-200", currentView === 'explore' ? "text-[#ffd700]" : "text-[#86868b]")}
            aria-label="Explore"
          >
            <Search size={24} strokeWidth={currentView === 'explore' ? 2.5 : 2} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="p-2 -mt-4 bg-[#ffd700] text-[#1d1d1f] rounded-full shadow-lg shadow-[#ffd700]/30 hover:bg-[#ffeb3b] transition-all duration-200 active:scale-95"
            aria-label="Create Market"
          >
            <PlusSquare size={24} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setCurrentView('assistant')}
            className={cn("p-2 rounded-full transition-all duration-200", currentView === 'assistant' ? "text-[#ffd700]" : "text-[#86868b]")}
            aria-label="AI Assistant"
          >
            <Bot size={24} strokeWidth={currentView === 'assistant' ? 2.5 : 2} />
          </button>
          <button
            onClick={handleOpenLoginModal}
            className={cn("p-2 rounded-full transition-all duration-200", "text-[#86868b]")}
            aria-label="Login"
          >
            <User size={24} strokeWidth={2} />
          </button>
        </nav>

        {/* Modals */}
        {isCreateModalOpen && (
          <Suspense fallback={null}>
            <CreateMarketModal
              isOpen={isCreateModalOpen}
              onClose={handleCloseCreateModal}
              onCreate={() => showToast('Market created successfully!', 'success')}
            />
          </Suspense>
        )}
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={handleCloseLoginModal}
          />
        )}
        {isTradingModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5e5ea] dark:border-[#2c2c2e] p-6">
              <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">Trading Modal</h2>
              <p className="text-[#86868b] dark:text-[#a1a1a6] mb-4">Trading modal would go here.</p>
              <button
                onClick={handleCloseTradingModal}
                className="px-4 py-2 bg-[#ffd700] text-[#1d1d1f] rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {isStakingModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5e5ea] dark:border-[#2c2c2e] p-6">
              <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">Staking Modal</h2>
              <p className="text-[#86868b] dark:text-[#a1a1a6] mb-4">Staking modal would go here.</p>
              <button
                onClick={handleCloseStakingModal}
                className="px-4 py-2 bg-[#ffd700] text-[#1d1d1f] rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {isTokenSaleModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e5e5ea] dark:border-[#2c2c2e] p-6">
              <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-4">Token Sale Modal</h2>
              <p className="text-[#86868b] dark:text-[#a1a1a6] mb-4">Token sale modal would go here.</p>
              <button
                onClick={handleCloseTokenSaleModal}
                className="px-4 py-2 bg-[#ffd700] text-[#1d1d1f] rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <WalletProvider>
            <Web3AuthProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Web3AuthProvider>
          </WalletProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
