import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 
        className={cn("animate-spin text-[#ffd700]", sizeClasses[size])} 
      />
      {text && (
        <p className="text-sm text-[#86868b]">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

