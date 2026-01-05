import React from 'react';
import { UserLevel } from '../types/achievements';
import { cn } from '../utils';

interface UserLevelBadgeProps {
  level: UserLevel;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({
  level,
  size = 'md',
  showProgress = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const progressSizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {/* Level Icon and Number */}
      <div className="relative group">
        <div 
          className={cn(
            'flex items-center justify-center rounded-full font-bold text-white shadow-lg transition-all duration-200 group-hover:scale-105',
            iconSizes[size],
            'bg-gradient-to-br',
            size === 'sm' && 'px-2 py-1',
            size === 'md' && 'px-3 py-1.5',
            size === 'lg' && 'px-4 py-2',
          )}
          style={{
            background: `linear-gradient(135deg, ${level.color}, ${level.color}dd)`,
          }}
        >
          <span className="flex items-center gap-1">
            <span>{level.icon}</span>
            <span className={sizeClasses[size]}>{level.level}</span>
          </span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">{level.title}</div>
          <div className="text-[#86868b] dark:text-[#a1a1a6]">
            {level.experience} / {level.nextLevelExp} XP
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1d1d1f] dark:bg-white"></div>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && level.level < 10 && (
        <div className="w-full max-w-24">
          <div className={cn(
            'bg-[#e5e5ea] dark:bg-[#38383a] rounded-full overflow-hidden',
            progressSizes[size]
          )}>
            <div 
              className="h-full bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] transition-all duration-500 ease-out"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 text-center">
            {Math.round(level.progress)}%
          </div>
        </div>
      )}

      {/* Max Level Indicator */}
      {level.level >= 10 && (
        <div className="text-xs font-medium text-[#ffd700]">
          MAX LEVEL
        </div>
      )}
    </div>
  );
};

export default UserLevelBadge;
