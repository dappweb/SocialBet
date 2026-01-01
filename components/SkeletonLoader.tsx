import React from 'react';
import { cn } from '../utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-[#e5e5ea] rounded';

  if (variant === 'card') {
    return (
      <div className={cn('p-5 space-y-4', className)}>
        <div className="flex gap-4">
          <div className={cn(baseClasses, 'w-12 h-12 rounded-full')} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, 'h-4 w-1/3')} />
            <div className={cn(baseClasses, 'h-3 w-1/2')} />
          </div>
        </div>
        <div className={cn(baseClasses, 'h-4 w-full')} />
        <div className={cn(baseClasses, 'h-4 w-5/6')} />
        <div className={cn(baseClasses, 'h-32 w-full')} />
      </div>
    );
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={width && i === 0 ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4',
        !width && !height && variant === 'rectangular' && 'w-full h-20',
        className
      )}
      style={style}
    />
  );
};

export default SkeletonLoader;

