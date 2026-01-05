import React from 'react';
import { Achievement } from '../types/achievements';
import { getRarityColor, getRarityBorder } from '../types/achievements';
import { cn } from '../utils';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  size = 'md',
  showProgress = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const descSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const isCompleted = achievement.progress.completed;
  const progressPercentage = (achievement.progress.current / achievement.progress.required) * 100;

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 transition-all duration-200 hover:shadow-lg',
        sizeClasses[size],
        getRarityBorder(achievement.rarity),
        isCompleted 
          ? 'bg-gradient-to-br from-white/10 to-white/5 dark:from-[#1c1c1e]/10 dark:to-[#1c1c1e]/5' 
          : 'bg-white dark:bg-[#1c1c1e] opacity-75',
        className
      )}
    >
      {/* Rarity Glow Effect */}
      {isCompleted && (
        <div 
          className="absolute inset-0 rounded-xl opacity-20"
          style={{
            background: `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}22, transparent)`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div 
              className={cn(
                'flex items-center justify-center rounded-lg',
                iconSizes[size],
                isCompleted 
                  ? 'bg-gradient-to-br from-white/20 to-white/10 dark:from-[#1c1c1e]/20 dark:to-[#1c1c1e]/10' 
                  : 'bg-[#f5f5f7] dark:bg-[#0a0a0a]'
              )}
            >
              <span className={isCompleted ? '' : 'opacity-50'}>
                {achievement.icon}
              </span>
            </div>

            {/* Title and Points */}
            <div className="flex-1">
              <h3 
                className={cn(
                  'font-semibold line-clamp-1',
                  titleSizes[size],
                  isCompleted 
                    ? 'text-[#1d1d1f] dark:text-white' 
                    : 'text-[#86868b] dark:text-[#a1a1a6]'
                )}
              >
                {achievement.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    getRarityColor(achievement.rarity),
                    isCompleted 
                      ? 'bg-white/20 dark:bg-[#1c1c1e]/20 text-white' 
                      : 'bg-[#f5f5f7] dark:bg-[#0a0a0a] text-[#86868b] dark:text-[#a1a1a6]'
                  )}
                >
                  {achievement.rarity}
                </span>
                <span 
                  className={cn(
                    'text-xs font-medium',
                    isCompleted 
                      ? 'text-[#ffd700] dark:text-[#ffeb3b]' 
                      : 'text-[#86868b] dark:text-[#a1a1a6]'
                  )}
                >
                  {achievement.points} pts
                </span>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          {isCompleted && (
            <div className="flex items-center justify-center w-6 h-6 bg-[#34c759] rounded-full">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Description */}
        <p 
          className={cn(
            'line-clamp-2 mb-3',
            descSizes[size],
            isCompleted 
              ? 'text-[#1d1d1f] dark:text-white/80' 
              : 'text-[#86868b] dark:text-[#a1a1a6]'
          )}
        >
          {achievement.description}
        </p>

        {/* Progress Bar */}
        {showProgress && !isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">
                Progress
              </span>
              <span className="font-medium text-[#1d1d1f] dark:text-white">
                {achievement.progress.current} / {achievement.progress.required}
              </span>
            </div>
            <div className="w-full bg-[#e5e5ea] dark:bg-[#38383a] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-center text-[#86868b] dark:text-[#a1a1a6]">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
        )}

        {/* Unlocked Date */}
        {isCompleted && achievement.unlockedAt && (
          <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] pt-2 border-t border-[#e5e5ea]/20 dark:border-[#38383a]/20">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <span 
            className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              achievement.category === 'trading' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
              achievement.category === 'social' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
              achievement.category === 'creation' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
              achievement.category === 'special' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            )}
          >
            {achievement.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
