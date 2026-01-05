import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, Users, ArrowRight } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { usersApi } from '../services/api';
import { cn } from '../utils';
import { User as UserType } from '../types';
import LazyImage from './LazyImage';
import FollowButton from './FollowButton';

interface UserSearchProps {
  placeholder?: string;
  maxResults?: number;
  onSelect?: (user: UserType) => void;
  className?: string;
  showFollowButton?: boolean;
  autoFocus?: boolean;
}

const UserSearch: React.FC<UserSearchProps> = ({
  placeholder = 'Search users...',
  maxResults = 10,
  onSelect,
  className = '',
  showFollowButton = true,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  
  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await usersApi.search(debouncedQuery.trim(), {
          limit: maxResults,
        });
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, maxResults]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  // Handle user selection
  const handleUserSelect = useCallback((user: UserType) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(user);
  }, [onSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleUserSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, handleUserSelect]);

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, []);

  // Add click outside listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-10 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] transition-all duration-200',
            'text-sm'
          )}
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            type="button"
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200"
          >
            <X size={16} />
          </button>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 size={16} className="text-[#ffd700] animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl shadow-lg max-h-96 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && !isLoading && query.length >= 2 && (
              <div className="p-4 text-center text-[#86868b] dark:text-[#a1a1a6] text-sm">
                No users found for "{query}"
              </div>
            )}
            
            {results.length > 0 && (
              <div className="py-2">
                {results.map((user, index) => (
                  <div
                    key={user.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] cursor-pointer transition-colors duration-200',
                      selectedIndex === index && 'bg-[#ffd700]/10 dark:bg-[#ffd700]/20',
                      'group'
                    )}
                    onClick={() => handleUserSelect(user)}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <LazyImage
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover bg-[#f5f5f7] dark:bg-[#1c1c1e]"
                      />
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1d1d1f] dark:text-white truncate">
                          {user.name}
                        </span>
                        {user.isVerified && (
                          <svg className="w-4 h-4 text-[#ffd700]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#86868b] dark:text-[#a1a1a6] truncate">
                        {user.handle}
                      </span>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1d1d1f] dark:text-white truncate">
                          {user.name}
                        </span>
                        {user.isVerified && (
                          <svg className="w-4 h-4 text-[#ffd700]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#86868b] dark:text-[#a1a1a6] truncate">
                        {user.handle}
                      </span>
                      
                      {/* Bio or Stats */}
                      {user.bio && (
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] line-clamp-2 mt-1">
                          {user.bio}
                        </p>
                      )}
                      
                      {!user.bio && (
                        <div className="flex items-center gap-4 text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                          <span>{user.followersCount || 0} followers</span>
                          <span>{user.followingCount || 0} following</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Follow Button */}
                    {showFollowButton && (
                      <div className="flex-shrink-0">
                        <FollowButton
                          targetUserId={user.id}
                          targetUserName={user.name}
                          targetUserHandle={user.handle}
                          size="sm"
                          showText={false}
                        />
                      </div>
                    )}
                    
                    {/* Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ArrowRight size={16} className="text-[#86868b] dark:text-[#a1a1a6]" />
                    </div>
                  </div>
              ))}
              </div>
            )}
            
            {/* Show More */}
            {results.length >= maxResults && (
              <div className="px-4 py-2 text-center text-xs text-[#86868b] dark:text-[#a1a1a6] border-t border-[#e5e5ea] dark:border-[#38383a]">
                Showing {maxResults} of {results.length} results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
