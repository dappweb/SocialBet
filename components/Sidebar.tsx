
import React from 'react';
import { Home, Trophy, User, Bell, Search, PlusCircle, LogOut, Bot } from 'lucide-react';
import { cn } from '../utils';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onCreateClick: () => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-3 text-xl rounded-full w-fit transition-colors group",
      active ? "font-bold text-white" : "text-slate-300 hover:bg-slate-900"
    )}
  >
    <Icon size={26} strokeWidth={active ? 3 : 2} className={cn("transition-transform group-hover:scale-110", active && "scale-105")} />
    <span className="hidden xl:inline">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onCreateClick }) => {
  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-4 pl-4 pr-4">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-4">
           {/* Logo */}
           <div 
             className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform"
             onClick={() => onNavigate('home')}
           >
             SB
           </div>
        </div>
        
        <NavItem 
            icon={Home} 
            label="Home" 
            active={currentView === 'home'} 
            onClick={() => onNavigate('home')} 
        />
        <NavItem 
            icon={Search} 
            label="Explore" 
            active={currentView === 'explore'} 
            onClick={() => onNavigate('explore')} 
        />
        <NavItem 
            icon={Trophy} 
            label="Leaderboard" 
            active={currentView === 'leaderboard'} 
            onClick={() => onNavigate('leaderboard')} 
        />
        <NavItem 
            icon={Bot} 
            label="Assistant" 
            active={currentView === 'assistant'} 
            onClick={() => onNavigate('assistant')} 
        />
        <NavItem 
            icon={Bell} 
            label="Notifications" 
            active={currentView === 'notifications'} 
            onClick={() => onNavigate('notifications')} 
        />
        <NavItem 
            icon={User} 
            label="Profile" 
            active={currentView === 'profile'} 
            onClick={() => onNavigate('profile')} 
        />
        
        <button 
            onClick={onCreateClick}
            className="w-full xl:w-56 mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95 hidden xl:block"
        >
          New Prediction
        </button>
        <button 
            onClick={onCreateClick}
            className="xl:hidden mt-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center"
        >
            <PlusCircle size={24} />
        </button>
      </div>

      <div className="mb-4">
        <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 p-3 rounded-full hover:bg-slate-900 w-full text-left transition-colors"
        >
            <img src="https://picsum.photos/id/100/100/100" className="w-10 h-10 rounded-full border border-slate-700" alt="Me" />
            <div className="hidden xl:block overflow-hidden">
                <p className="font-bold text-sm text-white truncate">Degen Trader</p>
                <p className="text-slate-500 text-sm truncate">@degen_eth</p>
            </div>
            <LogOut size={16} className="ml-auto text-slate-500 hidden xl:block" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;