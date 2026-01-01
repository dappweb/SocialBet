
import React, { useState, lazy, Suspense, useCallback, useMemo } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { MOCK_MARKETS } from './constants';
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
const WalletLoginModal = lazy(() => import('./components/WalletLoginModal'));
const SocialLoginModal = lazy(() => import('./components/SocialLoginModal'));
const WalletBalance = lazy(() => import('./components/WalletBalance'));

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const { showToast, toasts, removeToast } = useToast();
  // In a real app, this would modify the global market state
  const [markets, setMarkets] = useState(MOCK_MARKETS);

  const handleCreateMarket = useCallback(async (newMarketData: any) => {
    try {
      // Mock adding market to state
      console.log("Creating market:", newMarketData);
      
      // Optional: Add to local feed to simulate functionality
      const newMarket = {
          id: `new-${Date.now()}`,
          creator: {
            id: 'me',
            name: 'Degen Trader',
            handle: '@degen_eth',
            avatar: 'https://picsum.photos/id/100/100/100',
            isVerified: true,
          },
          question: newMarketData.question,
          category: newMarketData.category,
          endDate: newMarketData.endDate,
          poolSize: newMarketData.liquidity,
          volume: 0,
          likes: 0,
          comments: 0,
          image: newMarketData.image, // Add image if present
          outcomeStats: {
            yesPercent: 50,
            noPercent: 50,
            yesPrice: 0.5,
            noPrice: 0.5,
          },
      };
      
      // Add to top of feed
      setMarkets([newMarket, ...markets]);
      showToast('Market created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create market. Please try again.', 'error');
    }
  }, [markets, showToast]);

  const handleNavigate = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentView('home');
  }, []);

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
            <Profile onBack={handleBack} />
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
      <div className="min-h-screen bg-white text-[#1d1d1f] font-sans">
        <div className="max-w-[1265px] mx-auto flex justify-center sm:justify-start">
          
          {/* Left Sidebar (Desktop) */}
          <header className="hidden sm:flex flex-col w-[80px] xl:w-[275px] shrink-0 bg-white/80 backdrop-blur-xl border-r border-[#e5e5ea]">
            <Sidebar 
              currentView={currentView} 
              onNavigate={handleNavigate} 
              onCreateClick={useCallback(() => setIsCreateModalOpen(true), [])}
              onWalletClick={useCallback(() => setIsWalletModalOpen(true), [])}
              onSocialClick={useCallback(() => setIsSocialModalOpen(true), [])}
            />
          </header>

          {/* Main Feed / Content Area */}
          <main className="flex-1 max-w-[600px] min-h-screen relative border-r border-[#e5e5ea]/50">
            {renderView()}
          </main>

          {/* Right Panel (Desktop) */}
          <div className="hidden lg:block w-[350px] shrink-0 bg-[#f5f5f7]">
            <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar py-6 px-4">
              <Suspense fallback={<div className="h-32 bg-white rounded-xl mb-4 animate-pulse" />}>
                <WalletBalance />
              </Suspense>
              <RightPanel />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#e5e5ea] flex justify-around px-2 py-3 z-40 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button 
              onClick={useCallback(() => setCurrentView('home'), [])}
              className={cn("p-2 rounded-full transition-all duration-200", currentView === 'home' ? "text-[#ffd700]" : "text-[#86868b]")}
              aria-label="Home"
          >
            <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          </button>
          <button 
              onClick={useCallback(() => setCurrentView('explore'), [])}
              className={cn("p-2 rounded-full transition-all duration-200", currentView === 'explore' ? "text-[#ffd700]" : "text-[#86868b]")}
              aria-label="Explore"
          >
            <Search size={24} strokeWidth={currentView === 'explore' ? 2.5 : 2} />
          </button>
          
          {/* Mobile Create Button (Center) - Bright Yellow */}
          <button 
               onClick={useCallback(() => setIsCreateModalOpen(true), [])}
               className="p-2 -mt-4 bg-[#ffd700] text-[#1d1d1f] rounded-full shadow-lg shadow-[#ffd700]/30 hover:bg-[#ffeb3b] transition-all duration-200 active:scale-95"
               aria-label="Create Market"
          >
            <PlusSquare size={24} strokeWidth={2.5} />
          </button>
          
          <button 
               onClick={useCallback(() => setCurrentView('assistant'), [])}
               className={cn("p-2 rounded-full transition-all duration-200", currentView === 'assistant' ? "text-[#ffd700]" : "text-[#86868b]")}
              aria-label="AI Assistant"
          >
            <Bot size={24} strokeWidth={currentView === 'assistant' ? 2.5 : 2} />
          </button>

          <button 
               onClick={useCallback(() => setIsWalletModalOpen(true), [])}
               className={cn("p-2 rounded-full transition-all duration-200", "text-[#86868b]")}
               aria-label="Wallet"
          >
            <User size={24} strokeWidth={2} />
          </button>
        </nav>

        {/* Modals */}
        {isCreateModalOpen && (
          <Suspense fallback={null}>
            <CreateMarketModal 
              isOpen={isCreateModalOpen} 
              onClose={useCallback(() => setIsCreateModalOpen(false), [])} 
              onCreate={handleCreateMarket}
            />
          </Suspense>
        )}
        {isWalletModalOpen && (
          <Suspense fallback={null}>
            <WalletLoginModal 
              isOpen={isWalletModalOpen} 
              onClose={useCallback(() => setIsWalletModalOpen(false), [])} 
            />
          </Suspense>
        )}
        {isSocialModalOpen && (
          <Suspense fallback={null}>
            <SocialLoginModal 
              isOpen={isSocialModalOpen} 
              onClose={useCallback(() => setIsSocialModalOpen(false), [])} 
            />
          </Suspense>
        )}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WalletProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </WalletProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;