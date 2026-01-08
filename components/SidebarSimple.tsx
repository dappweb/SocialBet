import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Trophy, 
  User, 
  Bell, 
  Bot, 
  ChevronDown, 
  Settings, 
  LogOut,
  TrendingUp,
  Sparkles,
  Crown,
  Flame,
  FileText
} from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LazyImage from './LazyImage';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onCreateClick: () => void;
  onLoginClick: () => void;
}

const SidebarSimple: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onCreateClick,
  onLoginClick,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    showToast('Logged out successfully', 'success');
    // Handle logout logic here
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  const featureItems = [
    { id: 'swap', label: 'Swap', icon: TrendingUp },
    { id: 'referral', label: 'Referral', icon: TrendingUp },
    { id: 'red-envelope', label: 'Red Envelope', icon: Sparkles },
    { id: 'airdrop', label: 'Airdrop', icon: Crown },
    { id: 'lp-mining', label: 'LP Mining', icon: Flame },
    { id: 'ambassador', label: 'Ambassador', icon: Crown },
    { id: 'buyback-burn', label: 'Buyback & Burn', icon: Flame },
    { id: 'dao', label: 'DAO', icon: Settings },
    { id: 'whitepaper', label: 'Whitepaper', icon: FileText },
  ];

  const NavItem: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive?: boolean;
    isFeature?: boolean;
  }> = ({ id, label, icon, isActive, isFeature }) => (
    <button
      onClick={() => onNavigate(id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
        isActive
          ? "bg-[#fff9e6] dark:bg-[#332d1a] text-[#ffd700]"
          : "text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]",
        isFeature && "text-xs"
      )}
    >
      {icon}
      <span className={cn("font-medium", isActive && "font-semibold")}>{label}</span>
      {isActive && (
        <div className="w-2 h-2 bg-[#ffd700] rounded-full"></div>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      
      {/* Navigation */}
      <div className="flex-1 px-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={<item.icon size={20} />}
              isActive={currentView === item.id}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-[#e5e5ea] dark:border-[#2c2c2e] my-4"></div>

        {/* Features */}
        <nav className="space-y-1">
          {featureItems.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={<item.icon size={20} />}
              isActive={currentView === item.id}
              isFeature={true}
            />
          ))}
        </nav>
      </div>

      {/* User Profile */}
      {isAuthenticated && user && (
        <div className="p-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200"
            >
              <LazyImage
                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                className="w-8 h-8 rounded-full"
                alt={user.name}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1d1d1f] dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] truncate">
                  @{user.handle || user.name.toLowerCase().replace(/\s+/g, '')}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-[#86868b] dark:text-[#a1a1a6] transition-transform duration-200",
                  isProfileMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Profile Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#0a0a0a] border border-[#e5e5ea] dark:border-[#2c2c2e] rounded-xl shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-colors duration-200 text-[#86868b] dark:text-[#a1a1a6]"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarSimple;
