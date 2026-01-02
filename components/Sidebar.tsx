
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Home, Trophy, User, Bell, Search, PlusCircle, LogOut, Bot, Users, FileText, Wallet, LogIn, Settings, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';

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

const Sidebar: React.FC<SidebarProps> = memo(({ currentView, onNavigate, onCreateClick, onLoginClick }) => {
  const { isAuthenticated, user, logout, walletAddress } = useAuth();
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

        {/* Authentication Button */}
        {!isAuthenticated && (
          <div className="px-2 mb-4">
            <button
              onClick={onLoginClick}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-sm shadow-[#ffd700]/20 active:scale-95"
            >
              <LogIn size={18} />
              <span className="hidden xl:inline">Sign In</span>
            </button>
          </div>
        )}

        {isAuthenticated && walletAddress && (
          <div className="px-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5f5f7] text-xs font-mono text-[#86868b] hover:bg-[#e5e5ea] transition-colors cursor-pointer group" onClick={handleCopyAddress}>
              <Wallet size={14} className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors" />
              <span className="hidden xl:inline truncate flex-1">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              {copiedAddress ? (
                <Check size={12} className="text-[#34c759]" />
              ) : (
                <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
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

        {/* DAO Governance, Operations & White Paper (PC Platform Only) */}
        <div className="hidden xl:block mt-6 pt-6 border-t border-[#e5e5ea] space-y-1">
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

      <div className="mb-4 relative" ref={profileMenuRef}>
        {isAuthenticated && user ? (
          <>
            {/* Profile Button */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] w-full text-left transition-all duration-200 group"
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
                <p className="font-semibold text-sm text-[#1d1d1f] truncate">{user.name}</p>
                <p className="text-[#86868b] text-xs truncate">{user.handle}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={cn(
                  "text-[#86868b] transition-all duration-200 hidden xl:block",
                  isProfileMenuOpen && "rotate-180"
                )} 
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#e5e5ea] rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 border-b border-[#e5e5ea] bg-[#f5f5f7]">
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
                      <p className="font-semibold text-sm text-[#1d1d1f] truncate">{user.name}</p>
                      <p className="text-[#86868b] text-xs truncate">{user.handle}</p>
                    </div>
                  </div>
                  {walletAddress && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e5ea]">
                      <Wallet size={14} className="text-[#86868b] flex-shrink-0" />
                      <span className="text-xs font-mono text-[#86868b] truncate flex-1">{walletAddress}</span>
                      <button
                        onClick={handleCopyAddress}
                        className="p-1 hover:bg-[#f5f5f7] rounded transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress ? (
                          <Check size={12} className="text-[#34c759]" />
                        ) : (
                          <Copy size={12} className="text-[#86868b]" />
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f5f5f7] text-left transition-colors duration-200"
                  >
                    <User size={16} className="text-[#86868b]" />
                    <span className="text-sm text-[#1d1d1f]">View Profile</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#fff5f5] text-left transition-colors duration-200 group"
                  >
                    <LogOut size={16} className="text-[#86868b] group-hover:text-[#ff3b30] transition-colors" />
                    <span className="text-sm text-[#1d1d1f] group-hover:text-[#ff3b30] transition-colors">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-2">
            <p className="text-xs text-[#86868b] text-center hidden xl:block mb-2">
              Sign in to access your profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;