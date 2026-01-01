import React, { useState, useRef, useEffect } from 'react';
import { Wallet, LogOut, ChevronDown, Mail } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils';

interface WalletButtonProps {
  onClick?: () => void;
  className?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onClick, className }) => {
  const { isConnected, user: walletUser, walletAddress, currentChain, disconnectWallet } = useWallet();
  const { user: authUser, isAuthenticated, authMethod, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const user = authUser || walletUser;
  const isConnectedAny = isAuthenticated || isConnected;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isConnectedAny && user) {
    const displayText = walletAddress 
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : user.name;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            onClick?.();
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200",
            "bg-[#fff9e6] hover:bg-[#ffeb3b] text-[#1d1d1f] border border-[#ffd700]/30",
            className
          )}
        >
          <div className="w-2 h-2 rounded-full bg-[#34c759]"></div>
          <span className="hidden sm:inline truncate max-w-[120px]">
            {displayText}
          </span>
          <span className="sm:hidden truncate max-w-[80px]">
            {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-2)}` : user.name.slice(0, 8)}
          </span>
          <ChevronDown size={16} />
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e5ea] rounded-xl shadow-lg z-50 animate-in fade-in duration-200">
          <div className="p-3 border-b border-[#e5e5ea]">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-[#e5e5ea]"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate">{user.name}</div>
                <div className="text-xs text-[#86868b] truncate">{user.handle}</div>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            {authMethod === 'wallet' && currentChain && (
              <div className="px-3 py-2 text-xs text-[#86868b]">
                Network: <span className="font-semibold text-[#1d1d1f] capitalize">{currentChain}</span>
              </div>
            )}
            {authMethod === 'social' && (
              <div className="px-3 py-2 text-xs text-[#86868b] flex items-center gap-2">
                <Mail size={14} />
                <span>Social Account</span>
              </div>
            )}
            {walletAddress && (
              <div className="px-3 py-2 text-xs text-[#86868b] break-all">
                {walletAddress}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-[#e5e5ea]">
            <button
              onClick={() => {
                if (authMethod === 'wallet') {
                  disconnectWallet();
                } else {
                  logout();
                }
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f5f5f7] text-sm font-semibold text-[#ff3b30] transition-colors duration-200"
            >
              <LogOut size={16} />
              {authMethod === 'wallet' ? 'Disconnect Wallet' : 'Sign Out'}
            </button>
          </div>
        </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200",
        "bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-sm shadow-[#ffd700]/20",
        "active:scale-95",
        className
      )}
    >
      <Wallet size={18} />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </button>
  );
};

export default WalletButton;

