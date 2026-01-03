
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Home, Trophy, User, Bell, Search, PlusCircle, LogOut, Bot, Users, FileText, Wallet, LogIn, Settings, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';
import ThemeToggle from './ThemeToggle';

type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant' | 'dao' | 'whitepaper' | 'operations' | 'test-eth';

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
        : "text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] hover:text-[#1d1d1f] dark:hover:text-white"
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
  const { isAuthenticated, user, logout, walletAddress, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      showToast('Successfully signed out', 'success');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to sign out. Please try again.', 'error');
    }
  }, [logout, showToast]);

  const handleCopyAddress = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopiedAddress(true);
        showToast('Wallet address copied!', 'success');
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
        showToast('Failed to copy address', 'error');
      }
    }
  }, [walletAddress, showToast]);

  // Get user initials for avatar fallback
  const getUserInitials = useCallback((name: string) => {
    if (!name) return 'SB';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-6 pl-6 pr-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors duration-300">
      <div className="space-y-1">
        {/* Top Section: Logo and User Profile */}
        <div className="px-2 py-2 mb-6 space-y-4">
          {/* Logo */}
          <div
            className="w-10 h-10 bg-[#ffd700] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-bold text-lg shadow-md shadow-[#ffd700]/20 cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onNavigate('home')}
          >
            SB
          </div>

          {/* User Profile at Top */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Profile Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] w-full text-left transition-all duration-200 group"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                {/* Avatar with fallback to initials */}
                <div className="relative">
                  {user.avatar ? (
                    <LazyImage 
                      src={user.avatar} 
                      className="w-10 h-10 rounded-full border-2 border-[#e5e5ea] object-cover" 
                      alt={user.name}
                      onError={(e) => {
                        // Fallback to initials if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-initials')) {
                          const initials = document.createElement('div');
                          initials.className = 'avatar-initials w-10 h-10 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] font-bold text-sm border-2 border-[#e5e5ea]';
                          initials.textContent = getUserInitials(user.name);
                          parent.appendChild(initials);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] font-bold text-sm border-2 border-[#e5e5ea] shadow-sm">
                      {getUserInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="hidden xl:block overflow-hidden flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1d1d1f] dark:text-white truncate">{user.name}</p>
                  <p className="text-[#86868b] dark:text-[#a1a1a6] text-xs truncate">{user.handle}</p>
                </div>
                <ChevronDown 
                  size={16} 
                  className={cn(
                    "text-[#86868b] dark:text-[#a1a1a6] transition-all duration-200 hidden xl:block",
                    isProfileMenuOpen && "rotate-180"
                  )} 
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden transition-colors duration-300">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#1c1c1e] transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      {user.avatar ? (
                        <LazyImage 
                          src={user.avatar} 
                          className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" 
                          alt={user.name}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1d1d1f] font-bold border-2 border-white shadow-sm">
                          {getUserInitials(user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1d1d1f] dark:text-white truncate">{user.name}</p>
                        <p className="text-[#86868b] dark:text-[#a1a1a6] text-xs truncate">{user.handle}</p>
                      </div>
                    </div>
                    {walletAddress && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#38383a] transition-colors duration-300">
                        <Wallet size={14} className="text-[#86868b] dark:text-[#a1a1a6] flex-shrink-0" />
                        <span className="text-xs font-mono text-[#86868b] dark:text-[#a1a1a6] truncate flex-1">{walletAddress}</span>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <Check size={12} className="text-[#34c759]" />
                          ) : (
                            <Copy size={12} className="text-[#86868b] dark:text-[#a1a1a6]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] text-left transition-colors duration-200"
                    >
                      <User size={16} className="text-[#86868b] dark:text-[#a1a1a6]" />
                      <span className="text-sm text-[#1d1d1f] dark:text-white">View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#fff5f5] dark:hover:bg-[#2c1c1c] text-left transition-colors duration-200 group"
                    >
                      <LogOut size={16} className="text-[#86868b] dark:text-[#a1a1a6] group-hover:text-[#ff3b30] transition-colors" />
                      <span className="text-sm text-[#1d1d1f] dark:text-white group-hover:text-[#ff3b30] transition-colors">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-2">
              <button
                onClick={onLoginClick}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-sm shadow-[#ffd700]/20 active:scale-95"
              >
                <LogIn size={18} />
                <span className="hidden xl:inline">Sign In</span>
              </button>
            </div>
          )}
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
        <div className="hidden xl:block mt-6 pt-6 border-t border-[#e5e5ea] dark:border-[#38383a] space-y-1">
          <NavItem
            icon={Users}
            label="DAO Governance"
            active={currentView === 'dao'}
            onClick={() => onNavigate('dao')}
          />
          {/* Test ETH Purchase - Development only */}
          <NavItem
            icon={Wallet}
            label="Test ETH Purchase"
            active={currentView === 'test-eth'}
            onClick={() => onNavigate('test-eth')}
          />
          {/* Operations - Only visible to admin/owner */}
          {isAdmin && (
            <NavItem
              icon={Settings}
              label="Operations"
              active={currentView === 'operations'}
              onClick={() => onNavigate('operations')}
            />
          )}
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