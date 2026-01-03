import React, { useState } from 'react';
import { Menu, X, Home, Search, Bot, User, ChevronDown, Sparkles, Trophy, Bell, Gift, Award, Crown, Flame, TrendingUp, FileText, Settings, LogOut, Wallet } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';

interface MobileHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onCreateClick: () => void;
  onLoginClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentView,
  onNavigate,
  onCreateClick,
  onLoginClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'referral', label: 'Referral', icon: TrendingUp },
    { id: 'red-envelope', label: 'Red Envelope', icon: Gift },
    { id: 'airdrop', label: 'Airdrop', icon: Award },
    { id: 'lp-mining', label: 'LP Mining', icon: TrendingUp },
    { id: 'ambassador', label: 'Ambassador', icon: Crown },
    { id: 'buyback-burn', label: 'Buyback & Burn', icon: Flame },
    { id: 'dao', label: 'DAO', icon: Sparkles },
    { id: 'whitepaper', label: 'Whitepaper', icon: FileText },
    { id: 'operations', label: 'Operations', icon: Settings },
  ];

  const handleMenuClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-8 h-8 bg-[#ffd700] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] text-sm shadow-md shadow-[#ffd700]/20 hover:scale-105 transition-all duration-200"
            >
              SB
            </button>
            <span className="font-semibold text-lg text-[#1d1d1f] dark:text-white">
              SoulCast
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Create Button */}
            <button
              onClick={onCreateClick}
              className="w-8 h-8 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              aria-label="Create Market"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            {/* User Profile or Login */}
            {isAuthenticated && user ? (
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200"
              >
                <LazyImage
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  className="w-7 h-7 rounded-full border-2 border-[#e5e5ea] dark:border-[#2c2c2e]"
                  alt={user.name}
                />
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="w-8 h-8 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Login"
              >
                <User size={16} className="text-[#1d1d1f] dark:text-white" />
              </button>
            )}

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full flex items-center justify-center transition-colors duration-200"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X size={16} className="text-[#1d1d1f] dark:text-white" />
              ) : (
                <Menu size={16} className="text-[#1d1d1f] dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-4 py-2 border-t border-[#e5e5ea]/50 dark:border-[#2c2c2e]/50 bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">
                <span className="font-semibold text-[#ffd700]">2.3M</span> Total Volume
              </span>
              <span className="text-[#86868b] dark:text-[#a1a1a6]">
                <span className="font-semibold text-[#34c759]">156</span> Active Markets
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#34c759] rounded-full animate-pulse"></div>
              <span className="text-[#34c759]">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white dark:bg-[#0a0a0a] z-50 lg:hidden overflow-y-auto">
            {/* Menu Header */}
            <div className="sticky top-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#ffd700] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] text-sm">
                  SB
                </div>
                <span className="font-semibold text-lg text-[#1d1d1f] dark:text-white">
                  SoulCast
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X size={16} className="text-[#1d1d1f] dark:text-white" />
              </button>
            </div>

            {/* User Section */}
            {isAuthenticated && user && (
              <div className="px-4 py-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
                <div className="flex items-center gap-3">
                  <LazyImage
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    className="w-12 h-12 rounded-full border-2 border-[#e5e5ea] dark:border-[#2c2c2e]"
                    alt={user.name}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[#1d1d1f] dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                      @{user.handle || user.name.toLowerCase().replace(/\s+/g, '')}
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-[#86868b] dark:text-[#a1a1a6]" />
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="px-2 py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#ffd700]"
                        : "text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]"
                    )}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-[#ffd700]" : "text-[#86868b] dark:text-[#a1a1a6]"}
                    />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[#ffd700] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onCreateClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-all duration-200 active:scale-95"
                >
                  Create Market
                </button>
                
                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

MobileHeader.displayName = 'MobileHeader';

export default MobileHeader;
