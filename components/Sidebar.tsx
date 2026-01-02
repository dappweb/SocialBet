
import React, { memo } from 'react';
import { Home, Trophy, User, Bell, Search, PlusCircle, Bot, Users, FileText, Settings } from 'lucide-react';
import { cn } from '../utils';
import ThemeToggle from './ThemeToggle';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper' | 'operations';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onCreateClick: () => void;
  onLoginClick: () => void;
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
        ? "font-semibold text-[#1d1d1f] dark:text-white bg-[#fff9e6] dark:bg-[#332d1a]"
        : "text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
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

const Sidebar: React.FC<SidebarProps> = memo(({ currentView, onNavigate, onCreateClick, onLoginClick }) => {

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-6 pl-6 pr-4 bg-white dark:bg-black transition-colors duration-300">
      <div className="space-y-1">
        {/* Top Section: Logo */}
        <div className="px-2 py-2 mb-6">
          {/* Logo */}
          <div
            className="w-10 h-10 bg-[#ffd700] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-bold text-lg shadow-md shadow-[#ffd700]/20 cursor-pointer hover:scale-105 transition-all duration-200"
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

        {/* DAO Governance, Operations & White Paper (PC Platform Only) */}
        <div className="hidden xl:block mt-6 pt-6 border-t border-[#e5e5ea] dark:border-[#38383a] space-y-1 transition-colors duration-300">
          <NavItem
            icon={Users}
            label="DAO Governance"
            active={currentView === 'dao'}
            onClick={() => onNavigate('dao')}
          />
          <NavItem
            icon={Settings}
            label="Operations"
            active={currentView === 'operations'}
            onClick={() => onNavigate('operations')}
          />
          <NavItem
            icon={FileText}
            label="White Paper"
            active={currentView === 'whitepaper'}
            onClick={() => onNavigate('whitepaper')}
          />
        </div>

        {/* Theme Toggle */}
        <div className="mt-6 flex items-center justify-center xl:justify-start px-2">
          <ThemeToggle size="md" />
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
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;