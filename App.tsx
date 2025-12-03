
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Explore from './components/Explore';
import Notifications from './components/Notifications';
import ChatInterface from './components/ChatInterface';
import CreateMarketModal from './components/CreateMarketModal';
import { MOCK_MARKETS } from './constants';
import { Home, Search, Trophy, User, Bell, PlusSquare, Bot } from 'lucide-react';
import { cn } from './utils';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // In a real app, this would modify the global market state
  const [markets, setMarkets] = useState(MOCK_MARKETS);

  const handleCreateMarket = async (newMarketData: any) => {
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
      default:
        return <Feed markets={markets} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1265px] mx-auto flex justify-center sm:justify-start">
        
        {/* Left Sidebar (Desktop) */}
        <header className="hidden sm:flex flex-col w-[80px] xl:w-[275px] shrink-0">
          <Sidebar 
            currentView={currentView} 
            onNavigate={setCurrentView} 
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        </header>

        {/* Main Feed / Content Area */}
        <main className="flex-1 max-w-[600px] min-h-screen relative border-r border-slate-800/0">
          {renderView()}
        </main>

        {/* Right Panel (Desktop) */}
        <div className="hidden lg:block w-[350px] shrink-0">
           <RightPanel />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-slate-800 flex justify-around px-2 py-3 z-40 safe-area-pb">
        <button 
            onClick={() => setCurrentView('home')}
            className={cn("p-2 rounded-full transition-colors", currentView === 'home' ? "text-blue-500" : "text-slate-500")}
        >
          <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
        </button>
        <button 
            onClick={() => setCurrentView('explore')}
            className={cn("p-2 rounded-full transition-colors", currentView === 'explore' ? "text-blue-500" : "text-slate-500")}
        >
          <Search size={24} strokeWidth={currentView === 'explore' ? 2.5 : 2} />
        </button>
        
        {/* Mobile Create Button (Center) */}
        <button 
             onClick={() => setIsCreateModalOpen(true)}
             className="p-2 -mt-4 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30"
        >
          <PlusSquare size={24} strokeWidth={2.5} />
        </button>
        
        <button 
             onClick={() => setCurrentView('assistant')}
             className={cn("p-2 rounded-full transition-colors", currentView === 'assistant' ? "text-blue-500" : "text-slate-500")}
        >
          <Bot size={24} strokeWidth={currentView === 'assistant' ? 2.5 : 2} />
        </button>

         <button 
             onClick={() => setCurrentView('profile')}
             className={cn("p-2 rounded-full transition-colors", currentView === 'profile' ? "text-blue-500" : "text-slate-500")}
        >
          <User size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
        </button>
      </nav>

      {/* Modals */}
      <CreateMarketModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateMarket}
      />
    </div>
  );
}

export default App;