
import React from 'react';
import { Home, Trophy, User, Bell, Search, PlusCircle, LogOut, Bot, Users, FileText } from 'lucide-react';
import { cn } from '../utils';
import WalletButton from './WalletButton';
import { useWallet } from '../contexts/WalletContext';
import LazyImage from './LazyImage';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onCreateClick: () => void;
  onWalletClick: () => void;
  onSocialClick: () => void;
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
      "flex items-center gap-4 px-4 py-3 rounded-xl w-fit transition-all duration-200 group relative",
      active 
        ? "font-semibold text-[#1d1d1f] bg-[#fff9e6]" 
        : "text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
    )}
  >
    <Icon 
      size={24} 
      strokeWidth={active ? 2.5 : 2} 
      className={cn(
        "transition-all duration-200 relative z-10", 
        active && "text-[#ffd700]",
        "group-hover:scale-105"
      )} 
    />
    <span className="hidden xl:inline relative z-10 text-[15px]">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onCreateClick, onWalletClick, onSocialClick }) => {
  const { isConnected, user } = useWallet();
  
  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-6 pl-6 pr-4">
      <div className="space-y-1">
        <div className="px-2 py-2 mb-6">
           {/* Logo */}
           <div 
             className="w-10 h-10 bg-[#ffd700] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-bold text-lg shadow-md shadow-[#ffd700]/20 cursor-pointer hover:scale-105 transition-all duration-200"
             onClick={() => onNavigate('home')}
           >
             SB
           </div>
        </div>
        
        {/* Authentication Buttons */}
        {!isConnected && (
          <div className="px-2 mb-4 space-y-2">
            <WalletButton onClick={onWalletClick} />
            <button
              onClick={onSocialClick}
              className="w-full px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] active:scale-95"
            >
              Social Login
            </button>
          </div>
        )}
        
        {isConnected && (
          <div className="px-2 mb-4">
            <WalletButton onClick={onWalletClick} />
          </div>
        )}
        
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
        
        {/* DAO Governance & White Paper (PC Platform Only) */}
        <div className="hidden xl:block mt-6 pt-6 border-t border-[#e5e5ea] space-y-1">
          <NavItem 
              icon={Users} 
              label="DAO Governance" 
              active={currentView === 'dao'} 
              onClick={() => onNavigate('dao')} 
          />
          <NavItem 
              icon={FileText} 
              label="White Paper" 
              active={currentView === 'whitepaper'} 
              onClick={() => onNavigate('whitepaper')} 
          />
        </div>
        
        {/* Create Market Button - Bright Yellow */}
        <button 
            onClick={onCreateClick}
            className="w-full xl:w-56 mt-8 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold py-3.5 rounded-xl shadow-md shadow-[#ffd700]/20 transition-all duration-200 active:scale-95 hidden xl:block"
        >
          New Prediction
        </button>
        <button 
            onClick={onCreateClick}
            className="xl:hidden mt-8 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] p-3 rounded-xl shadow-md shadow-[#ffd700]/20 flex items-center justify-center transition-all duration-200 active:scale-95"
        >
            <PlusCircle size={24} />
        </button>
      </div>

      <div className="mb-4">
        {isConnected && user ? (
          <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] w-full text-left transition-colors duration-200"
          >
              <LazyImage src={user.avatar} className="w-10 h-10 rounded-full border-2 border-[#e5e5ea]" alt={user.name} />
              <div className="hidden xl:block overflow-hidden">
                  <p className="font-semibold text-sm text-[#1d1d1f] truncate">{user.name}</p>
                  <p className="text-[#86868b] text-sm truncate">{user.handle}</p>
              </div>
              <LogOut size={16} className="ml-auto text-[#86868b] hidden xl:block" />
          </button>
        ) : (
          <div className="px-2">
            <p className="text-xs text-[#86868b] text-center hidden xl:block mb-2">
              Connect wallet to access your profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;