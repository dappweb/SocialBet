
import React, { useState } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Explore from './components/Explore';
import Notifications from './components/Notifications';
import ChatInterface from './components/ChatInterface';
import CreateMarketModal from './components/CreateMarketModal';
import DAOGovernance from './components/DAOGovernance';
import WhitePaper from './components/WhitePaper';
import WalletLoginModal from './components/WalletLoginModal';
import SocialLoginModal from './components/SocialLoginModal';
import WalletBalance from './components/WalletBalance';
import ErrorBoundary from './components/ErrorBoundary';
import { MOCK_MARKETS } from './constants';
import { Home, Search, Trophy, User, Bell, PlusSquare, Bot } from 'lucide-react';
import { cn } from './utils';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const { showToast, toasts, removeToast } = useToast();
  // In a real app, this would modify the global market state
  const [markets, setMarkets] = useState(MOCK_MARKETS);

  const handleCreateMarket = async (newMarketData: any) => {
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
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Feed markets={markets} />;
      case 'explore':
        return <Explore />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile onBack={() => setCurrentView('home')} />;
      case 'assistant':
        return <ChatInterface />;
      case 'dao':
        return <DAOGovernance />;
      case 'whitepaper':
        return <WhitePaper onBack={() => setCurrentView('home')} />;
      default:
        return <Feed markets={markets} />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white text-[#1d1d1f] font-sans">
        <div className="max-w-[1265px] mx-auto flex justify-center sm:justify-start">
          
          {/* Left Sidebar (Desktop) */}
          <header className="hidden sm:flex flex-col w-[80px] xl:w-[275px] shrink-0 bg-white/80 backdrop-blur-xl border-r border-[#e5e5ea]">
            <Sidebar 
              currentView={currentView} 
              onNavigate={setCurrentView} 
              onCreateClick={() => setIsCreateModalOpen(true)}
              onWalletClick={() => setIsWalletModalOpen(true)}
              onSocialClick={() => setIsSocialModalOpen(true)}
            />
          </header>

          {/* Main Feed / Content Area */}
          <main className="flex-1 max-w-[600px] min-h-screen relative border-r border-[#e5e5ea]/50">
            {renderView()}
          </main>

          {/* Right Panel (Desktop) */}
          <div className="hidden lg:block w-[350px] shrink-0 bg-[#f5f5f7]">
            <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar py-6 px-4">
              <WalletBalance />
              <RightPanel />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#e5e5ea] flex justify-around px-2 py-3 z-40 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button 
              onClick={() => setCurrentView('home')}
              className={cn("p-2 rounded-full transition-all duration-200", currentView === 'home' ? "text-[#ffd700]" : "text-[#86868b]")}
          >
            <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          </button>
          <button 
              onClick={() => setCurrentView('explore')}
              className={cn("p-2 rounded-full transition-all duration-200", currentView === 'explore' ? "text-[#ffd700]" : "text-[#86868b]")}
          >
            <Search size={24} strokeWidth={currentView === 'explore' ? 2.5 : 2} />
          </button>
          
          {/* Mobile Create Button (Center) - Bright Yellow */}
          <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="p-2 -mt-4 bg-[#ffd700] text-[#1d1d1f] rounded-full shadow-lg shadow-[#ffd700]/30 hover:bg-[#ffeb3b] transition-all duration-200 active:scale-95"
          >
            <PlusSquare size={24} strokeWidth={2.5} />
          </button>
          
          <button 
               onClick={() => setCurrentView('assistant')}
               className={cn("p-2 rounded-full transition-all duration-200", currentView === 'assistant' ? "text-[#ffd700]" : "text-[#86868b]")}
          >
            <Bot size={24} strokeWidth={currentView === 'assistant' ? 2.5 : 2} />
          </button>

          <button 
               onClick={() => setIsWalletModalOpen(true)}
               className={cn("p-2 rounded-full transition-all duration-200", "text-[#86868b]")}
          >
            <User size={24} strokeWidth={2} />
          </button>
        </nav>

        {/* Modals */}
        <CreateMarketModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleCreateMarket}
        />
        <WalletLoginModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
        />
        <SocialLoginModal 
          isOpen={isSocialModalOpen} 
          onClose={() => setIsSocialModalOpen(false)} 
        />
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