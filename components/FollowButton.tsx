import React, { useState, useCallback } from 'react';
import { UserPlus, UserMinus, Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usersApi } from '../services/api';
import { cn } from '../utils';

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  targetUserHandle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  showText?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUserName,
  targetUserHandle,
  className = '',
  size = 'md',
  variant = 'primary',
  showText = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);

  // Check follow status on mount
  React.useEffect(() => {
    if (isAuthenticated && user?.id && targetUserId && user.id !== targetUserId) {
      checkFollowStatus();
    }
  }, [isAuthenticated, user?.id, targetUserId]);

  const checkFollowStatus = useCallback(async () => {
    if (!isAuthenticated || !user?.id || user.id === targetUserId) return;
    
    try {
      const result = await usersApi.isFollowing(user.id, targetUserId);
      setIsFollowing(result.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
      setIsFollowing(false);
    }
  }, [isAuthenticated, user?.id, targetUserId]);

  const handleFollow = useCallback(async () => {
    if (!isAuthenticated || !user?.id || user.id === targetUserId) {
      showToast('Please sign in to follow users', 'warning');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await usersApi.follow(user.id, targetUserId);
      
      if (result.success) {
        setIsOptimistic(true);
        setIsFollowing(true);
        showToast(`You are now following ${targetUserName || targetUserHandle || 'this user'}`, 'success');
        
        // Reset optimistic state after a delay
        setTimeout(() => {
          setIsOptimistic(false);
        }, 1000);
      } else {
        throw new Error('Follow failed');
      }
    } catch (error) {
      console.error('Follow error:', error);
      showToast('Failed to follow user. Please try again.', 'error');
      // Revert optimistic state
      setIsFollowing(false);
      setIsOptimistic(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, targetUserId, targetUserName, targetUserHandle, showToast]);

  const handleUnfollow = useCallback(async () => {
    if (!isAuthenticated || !user?.id || user.id === targetUserId) return;

    setIsLoading(true);
    
    try {
      const result = await usersApi.unfollow(user.id, targetUserId);
      
      if (result.success) {
        setIsOptimistic(true);
        setIsFollowing(false);
        showToast(`You unfollowed ${targetUserName || targetUserHandle || 'this user'}`, 'info');
        
        // Reset optimistic state after a delay
        setTimeout(() => {
          setIsOptimistic(false);
        }, 1000);
      } else {
        throw new Error('Unfollow failed');
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      showToast('Failed to unfollow user. Please try again.', 'error');
      // Revert optimistic state
      setIsFollowing(true);
      setIsOptimistic(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, targetUserId, targetUserName, targetUserHandle, showToast]);

  // Don't show follow button for self
  if (user?.id === targetUserId) {
    return null;
  }

  // Don't show follow button if not authenticated
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => showToast('Please sign in to follow users', 'warning')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97]',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          variant === 'primary' 
            ? 'bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-md shadow-[#ffd700]/20'
            : 'bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] text-[#1d1d1f] dark:text-white border border-[#e5e5ea] dark:border-[#38383a]',
          className
        )}
      >
        <UserPlus size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        {showText && <span>Follow</span>}
      </button>
    );
  }

  // Show loading state while checking follow status
  if (isFollowing === null && !isOptimistic) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-medium',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' 
          ? 'bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6]'
          : 'bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#86868b] dark:text-[#a1a1a6]',
        className
      )}>
        <div className="w-4 h-4 border-2 border-[#86868b] dark:border-[#a1a1a6] border-t-transparent rounded-full animate-spin" />
        {showText && <span>Loading...</span>}
      </div>
    );
  }

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97]',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        // Following state
        isFollowing 
          ? 'bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] text-[#1d1d1f] dark:text-white border border-[#e5e5ea] dark:border-[#38383a]'
          : 'bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] shadow-md shadow-[#ffd700]/20',
        // Loading state
        isLoading && 'opacity-50 cursor-not-allowed',
        // Optimistic state
        isOptimistic && 'opacity-75',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
          {showText && <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>}
        </>
      ) : (
        <>
          {isFollowing ? (
            <>
              <UserMinus size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
              {showText && <span>Following</span>}
            </>
          ) : (
            <>
              <UserPlus size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
              {showText && <span>Follow</span>}
            </>
          )}
        </>
      )}
    </button>
  );
};

export default FollowButton;
