
import React, { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react';
import { Web3AuthProvider } from './contexts/Web3AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { MOCK_MARKETS } from './constants';
import { marketsApi } from './services/api';
import { PredictionMarket } from './types';
import { Home, Search, Trophy, User, Bell, PlusSquare, Bot } from 'lucide-react';
import { cn } from './utils';

// Lazy load components for code splitting
const Feed = lazy(() => import('./components/Feed'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Profile = lazy(() => import('./components/Profile'));
const Explore = lazy(() => import('./components/Explore'));
const Notifications = lazy(() => import('./components/Notifications'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const CreateMarketModal = lazy(() => import('./components/CreateMarketModal'));
const DAOGovernance = lazy(() => import('./components/DAOGovernance'));
const WhitePaper = lazy(() => import('./components/WhitePaper'));
// LoginModal imported directly to avoid dynamic import errors in production
import LoginModal from './components/LoginModal';
const WalletBalance = lazy(() => import('./components/WalletBalance'));
const SoulTokenTrading = lazy(() => import('./components/SoulTokenTrading'));
const TreasuryManagement = lazy(() => import('./components/TreasuryManagement'));
const SoulTokenBalance = lazy(() => import('./components/SoulTokenBalance'));
const SoulTokenStaking = lazy(() => import('./components/SoulTokenStaking'));
const TokenSale = lazy(() => import('./components/TokenSale'));
const OperationsDashboard = lazy(() => import('./components/OperationsDashboard'));

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper' | 'operations';

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

  // Redirect from operations if not admin
  useEffect(() => {
    if (currentView === 'operations' && !isAdmin) {
      setCurrentView('home');
      showToast('Access denied. Operations dashboard is only available to administrators.', 'error');
    }
  }, [currentView, isAdmin, showToast]);

  // Debug: Log markets state
  useEffect(() => {
    console.log('App - Markets state:', markets.length);
  }, [markets]);

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

  // Modal handlers - must be at top level, not inside JSX
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

  // Navigation handlers for mobile nav
  const handleNavigateHome = useCallback(() => setCurrentView('home'), []);
  const handleNavigateExplore = useCallback(() => setCurrentView('explore'), []);
  const handleNavigateAssistant = useCallback(() => setCurrentView('assistant'), []);

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
      case 'dao':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading DAO..." />}>
            <DAOGovernance />
          </Suspense>
        );
      case 'whitepaper':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading white paper..." />}>
            <WhitePaper onBack={handleBack} />
          </Suspense>
        );
      case 'operations':
        return (
          <Suspense fallback={<LoadingSpinner text="Loading operations..." />}>
            <OperationsDashboard />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner text="Loading feed..." />}>
            <Feed markets={markets} />
          </Suspense>
        );
    }
  }, [currentView, markets, handleBack]);

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black text-[#1d1d1f] dark:text-white font-sans transition-colors duration-300">
        <div className="max-w-[1265px] mx-auto flex justify-center sm:justify-start">

          {/* Left Sidebar (Desktop) */}
          <header className="hidden sm:flex flex-col w-[80px] xl:w-[275px] shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-r border-[#e5e5ea] dark:border-[#38383a] transition-colors duration-300">
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              onCreateClick={handleOpenCreateModal}
              onLoginClick={handleOpenLoginModal}
            />
          </header>

          {/* Main Feed / Content Area */}
          <main className={cn(
            "flex-1 min-h-screen relative",
            currentView !== 'whitepaper' && "max-w-[600px] border-r border-[#e5e5ea]/50 dark:border-[#38383a]/50 transition-colors duration-300"
          )}>
            {renderView}
          </main>

          {/* Right Panel (Desktop) - Hidden on whitepaper for better reading experience */}
          {currentView !== 'whitepaper' && (
            <aside className="hidden lg:block w-[350px] shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-l border-[#e5e5ea] dark:border-[#38383a] transition-colors duration-300">
              <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar">
                <Suspense fallback={<div className="h-32 bg-white rounded-xl mb-4 animate-pulse" />}>
                  <WalletBalance />
                </Suspense>
                <RightPanel 
                  onTradeClick={handleOpenTradingModal} 
                  onStakeClick={handleOpenStakingModal}
                  onTokenSaleClick={handleOpenTokenSaleModal}
                />
              </div>
            </aside>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-[#e5e5ea] dark:border-[#38383a] flex justify-around px-2 py-3 z-40 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(255,255,255,0.05)] transition-colors duration-300">
          <button
            onClick={handleNavigateHome}
            className={cn("p-2 rounded-full transition-all duration-200", currentView === 'home' ? "text-[#ffd700]" : "text-[#86868b]")}
            aria-label="Home"
          >
            <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          </button>
          <button
            onClick={handleNavigateExplore}
            className={cn("p-2 rounded-full transition-all duration-200", currentView === 'explore' ? "text-[#ffd700]" : "text-[#86868b]")}
            aria-label="Explore"
          >
            <Search size={24} strokeWidth={currentView === 'explore' ? 2.5 : 2} />
          </button>

          {/* Mobile Create Button (Center) - Bright Yellow */}
          <button
            onClick={handleOpenCreateModal}
            className="p-2 -mt-4 bg-[#ffd700] text-[#1d1d1f] rounded-full shadow-lg shadow-[#ffd700]/30 hover:bg-[#ffeb3b] transition-all duration-200 active:scale-95"
            aria-label="Create Market"
          >
            <PlusSquare size={24} strokeWidth={2.5} />
          </button>

          <button
            onClick={handleNavigateAssistant}
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
              onCreate={handleCreateMarket}
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <Suspense fallback={<LoadingSpinner text="Loading trading..." />}>
                <SoulTokenTrading onClose={handleCloseTradingModal} />
              </Suspense>
            </div>
          </div>
        )}
        {isStakingModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <Suspense fallback={<LoadingSpinner text="Loading staking..." />}>
                <SoulTokenStaking onClose={handleCloseStakingModal} />
              </Suspense>
            </div>
          </div>
        )}
        {isTokenSaleModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <Suspense fallback={<LoadingSpinner text="Loading token sale..." />}>
                <TokenSale onClose={handleCloseTokenSaleModal} />
              </Suspense>
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