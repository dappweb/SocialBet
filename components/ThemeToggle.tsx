import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full transition-all duration-300",
        "bg-[#f5f5f7] dark:bg-[#1c1c1e]",
        "border border-[#e5e5ea] dark:border-[#38383a]",
        "hover:bg-[#ffd700] dark:hover:bg-[#ffd700]",
        "hover:border-[#ffd700] dark:hover:border-[#ffd700]",
        "focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:ring-offset-2",
        "dark:focus:ring-offset-[#1c1c1e]",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Sun
          size={iconSizes[size]}
          className={cn(
            "absolute transition-all duration-300 text-[#1d1d1f] dark:text-[#86868b]",
            theme === 'light' ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
          )}
        />
        <Moon
          size={iconSizes[size]}
          className={cn(
            "absolute transition-all duration-300 text-[#1d1d1f] dark:text-[#ffd700]",
            theme === 'dark' ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

