import React, { useState } from 'react';
import { X, User, Mail, Shield, AlertCircle, Check } from 'lucide-react';
import { cn } from '../utils';

interface FallbackLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

const FallbackLogin: React.FC<FallbackLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    } else if (!formData.handle.startsWith('@')) {
      newErrors.handle = 'Handle must start with @';
    } else if (formData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: `demo_${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        handle: formData.handle.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.handle}`,
        isVerified: false,
        joinedAt: new Date().toISOString(),
        bio: '',
        location: '',
        website: '',
        twitter: '',
        github: '',
        followersCount: 0,
        followingCount: 0,
      };

      onLogin(userData);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Failed to login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5ea] dark:border-[#38383a]">
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Demo Login</h3>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
              Quick access for testing
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

        {/* Alert */}
        <div className="mx-6 mt-4 p-3 bg-[#fff9e6] dark:bg-[#1c1c1e] border border-[#ffd700]/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-[#ff9500] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[#1d1d1f] dark:text-white text-sm">Demo Mode</h4>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                This is a demo login for testing purposes. Your data will be stored locally.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className={cn(
                'w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700]',
                errors.name && 'border-[#ff3b30]'
              )}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-[#ff3b30] mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className={cn(
                'w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700]',
                errors.email && 'border-[#ff3b30]'
              )}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-[#ff3b30] mt-1">{errors.email}</p>
            )}
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-white mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) => handleInputChange('handle', e.target.value)}
              placeholder="@username"
              className={cn(
                'w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700]',
                errors.handle && 'border-[#ff3b30]'
              )}
              disabled={isLoading}
            />
            {errors.handle && (
              <p className="text-xs text-[#ff3b30] mt-1">{errors.handle}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl">
              <p className="text-sm text-[#ff3b30]">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 px-4 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-md shadow-[#ffd700]/20 active:scale-[0.97] flex items-center justify-center gap-2',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <User size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-[#86868b] dark:text-[#a1a1a6]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={12} />
              <span>Demo Mode - No real authentication</span>
            </div>
            <p>Your data is stored locally and will be cleared when you refresh the page.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackLogin;
