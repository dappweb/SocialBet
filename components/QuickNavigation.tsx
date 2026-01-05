import React from 'react';
import { Trophy, MessageSquare, Bell, Download, Settings, User, TrendingUp, Users, Shield, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

interface QuickNavigationProps {
  className?: string;
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({ className = '' }) => {
  const { isAuthenticated, user } = useAuth();

  const navigationItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'View and edit your profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/profile',
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      description: 'View your achievements and progress',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/profile?tab=achievements',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Private conversations',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/profile?tab=messages',
      badge: 3, // Mock unread count
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Manage notification settings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/profile?tab=notifications',
      badge: 5, // Mock notification count
    },
    {
      id: 'trading',
      label: 'Trading',
      icon: TrendingUp,
      description: 'View trading dashboard',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/profile?tab=trading',
    },
    {
      id: 'social',
      label: 'Social',
      icon: Users,
      description: 'Find and follow users',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/explore',
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      description: 'Download your data',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      href: '/profile?tab=export',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'App settings and preferences',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      href: '/profile?tab=settings',
    },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('/profile?tab=')) {
      // Handle tab navigation within Profile component
      const tab = href.split('=')[1];
      // The Profile component will read the tab from URL params
      setTimeout(() => {
        const event = new CustomEvent('profileTabChange', { detail: { tab } });
        window.dispatchEvent(event);
      }, 100);
    } else {
      // For now, just show an alert or handle navigation differently
      // since we don't have react-router-dom
      console.log('Navigate to:', href);
      // You could implement custom navigation logic here
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <Shield size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600">Please sign in to access all features.</p>
      </div>
    );
  }

  return (
    <div className={cn('p-4', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick Navigation</h2>
        <p className="text-sm text-gray-600">Access all your features and settings</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.href)}
            className="group relative p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
          >
            {/* Badge */}
            {item.badge && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {item.badge}
              </div>
            )}
            
            {/* Content */}
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                item.bgColor,
                item.color
              )}>
                <item.icon size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {item.label}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {item.description}
                </div>
              </div>
              
              <ChevronRight 
                size={16} 
                className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200 mt-1" 
              />
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </button>
        ))}
      </div>
      
      {/* User Info */}
      {user && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600">{user.handle}</div>
            </div>
            <div className="text-xs text-gray-500">
              Level 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickNavigation;
