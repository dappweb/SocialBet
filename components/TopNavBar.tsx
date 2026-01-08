import React, { useState } from 'react';
import { Bell, Wallet, User, ChevronDown, LogOut, Settings, Copy, ExternalLink, Check, Home, Search, Trophy, Bot, PlusSquare } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';
import ThemeToggle from './ThemeToggle';

interface TopNavBarProps {
  onLoginClick: () => void;
  onNavigate: (view: string) => void;
  onCreateClick?: () => void;
  currentView?: string;
  notificationCount?: number;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  onLoginClick,
  onNavigate,
  onCreateClick,
  currentView = 'home',
  notificationCount = 0,
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { walletAddress } = useWallet();
  const { walletAddress: web3WalletAddress } = useWeb3Auth();
  const { showToast } = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayAddress = walletAddress || web3WalletAddress;
  const shortAddress = displayAddress 
    ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
    : null;

  const handleCopyAddress = async () => {
    if (displayAddress) {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      showToast('Address copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#e5e5ea] dark:border-[#2c2c2e] transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-xl flex items-center justify-center font-bold text-[#1d1d1f] shadow-md shadow-[#ffd700]/20">
                FX
              </div>
              <span className="hidden lg:block font-semibold text-lg text-[#1d1d1f] dark:text-white">
                ForecastX
              </span>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  currentView === 'home'
                    ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#1d1d1f] dark:text-white"
                    : "text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
                )}
              >
                <Home size={18} />
                <span>Home</span>
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  currentView === 'explore'
                    ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#1d1d1f] dark:text-white"
                    : "text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
                )}
              >
                <Search size={18} />
                <span>Explore</span>
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  currentView === 'leaderboard'
                    ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#1d1d1f] dark:text-white"
                    : "text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
                )}
              >
                <Trophy size={18} />
                <span>Ranking</span>
              </button>
              <button
                onClick={() => onNavigate('assistant')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  currentView === 'assistant'
                    ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#1d1d1f] dark:text-white"
                    : "text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
                )}
              >
                <Bot size={18} />
                <span>AI</span>
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all",
                  currentView === 'profile'
                    ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#1d1d1f] dark:text-white"
                    : "text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] hover:text-[#1d1d1f] dark:hover:text-white"
                )}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Create Button */}
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold rounded-xl hover:opacity-90 transition-all duration-200 active:scale-95"
              >
                <PlusSquare size={16} />
                <span>Create</span>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            {/* Notifications */}
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff3b30] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Wallet / Connect */}
            {isAuthenticated && displayAddress ? (
              <div className="relative">
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-xl transition-colors"
                >
                  <Wallet size={16} className="text-[#ffd700]" />
                  <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">
                    {shortAddress}
                  </span>
                  <ChevronDown size={14} className={cn(
                    "text-[#86868b] transition-transform",
                    isWalletMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* Wallet Dropdown */}
                {isWalletMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsWalletMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#e5e5ea] dark:border-[#38383a]">
                        <div className="text-xs text-[#86868b] mb-1">Wallet Address</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-[#1d1d1f] dark:text-white">
                            {shortAddress}
                          </span>
                          <button
                            onClick={handleCopyAddress}
                            className="p-1 hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded transition-colors"
                          >
                            {copied ? (
                              <Check size={14} className="text-[#34c759]" />
                            ) : (
                              <Copy size={14} className="text-[#86868b]" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <a
                          href={`https://etherscan.io/address/${displayAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-lg transition-colors"
                        >
                          <ExternalLink size={14} />
                          View on Etherscan
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl transition-all duration-200 shadow-md shadow-[#ffd700]/20 hover:shadow-lg hover:shadow-[#ffd700]/30 active:scale-95"
              >
                <Wallet size={16} />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}

            {/* User Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors"
                >
                  <LazyImage
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    className="w-8 h-8 rounded-full border-2 border-[#e5e5ea] dark:border-[#38383a]"
                    alt={user.name}
                  />
                  <ChevronDown size={14} className={cn(
                    "hidden sm:block text-[#86868b] transition-transform",
                    isProfileMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#e5e5ea] dark:border-[#38383a]">
                        <div className="flex items-center gap-3">
                          <LazyImage
                            src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            className="w-10 h-10 rounded-full"
                            alt={user.name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[#1d1d1f] dark:text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-[#86868b] truncate">
                              @{user.handle || user.name.toLowerCase().replace(/\s+/g, '')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            onNavigate('profile');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-lg transition-colors"
                        >
                          <User size={16} />
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('settings');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-lg transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <div className="border-t border-[#e5e5ea] dark:border-[#38383a] my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
