import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, MessageSquare, Volume2, VolumeX, Check, X, Shield, Clock, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { messagesApi } from '../services/api';
import { MessageSettings } from '../types/messaging';
import { cn } from '../utils';

interface NotificationSettingsProps {
  onBack?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState<MessageSettings>({
    enableNotifications: true,
    enableSounds: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
    autoDeleteAfter: 0,
    allowStrangers: true,
    blockedUsers: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      setIsLoading(true);
      try {
        const userSettings = await messagesApi.getSettings(user.id);
        setSettings(userSettings);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        showToast('Failed to load settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated, user?.id, showToast]);

  // Handle setting change
  const handleSettingChange = (key: keyof MessageSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    setIsSaving(true);
    try {
      const result = await messagesApi.updateSettings(user.id, settings);
      if (result.success) {
        showToast('Settings saved successfully!', 'success');
        setHasChanges(false);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings
  const handleReset = () => {
    setSettings({
      enableNotifications: true,
      enableSounds: true,
      enableTypingIndicators: true,
      enableReadReceipts: true,
      autoDeleteAfter: 0,
      allowStrangers: true,
      blockedUsers: [],
    });
    setHasChanges(true);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white flex items-center justify-center">
        <div className="text-center">
          <Bell size={48} className="text-[#86868b] dark:text-[#a1a1a6] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-[#86868b] dark:text-[#a1a1a6]">
            Please sign in to manage your notification settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 border-x border-[#e5e5ea]/50 bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-4 py-2 flex items-center gap-4 border-b border-[#e5e5ea] shadow-sm">
        <button onClick={() => onBack?.()} className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
          <Bell size={20} className="text-[#86868b]" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg leading-5 text-[#1d1d1f]">Notification Settings</h1>
          <p className="text-xs text-[#86868b]">
            Manage your notification preferences
          </p>
        </div>
        {hasChanges && (
          <div className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#86868b] dark:text-[#a1a1a6]">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* General Notifications */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
              <Bell size={20} />
              General Notifications
            </h2>
            
            <div className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f] dark:text-white">Enable Notifications</h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    Receive notifications for new messages and updates
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('enableNotifications', !settings.enableNotifications)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    settings.enableNotifications ? 'bg-[#ffd700]' : 'bg-[#e5e5ea] dark:bg-[#38383a]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Enable Sounds */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
                    <Volume2 size={16} />
                    Sound Effects
                  </h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    Play sounds for new messages and notifications
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('enableSounds', !settings.enableSounds)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    settings.enableSounds ? 'bg-[#ffd700]' : 'bg-[#e5e5ea] dark:bg-[#38383a]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      settings.enableSounds ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Message Settings */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Message Settings
            </h2>
            
            <div className="space-y-4">
              {/* Typing Indicators */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f] dark:text-white">Typing Indicators</h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    Show when someone is typing a message
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('enableTypingIndicators', !settings.enableTypingIndicators)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    settings.enableTypingIndicators ? 'bg-[#ffd700]' : 'bg-[#e5e5ea] dark:bg-[#38383a]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      settings.enableTypingIndicators ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Read Receipts */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f] dark:text-white">Read Receipts</h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    Let others know when you've read their messages
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('enableReadReceipts', !settings.enableReadReceipts)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    settings.enableReadReceipts ? 'bg-[#ffd700]' : 'bg-[#e5e5ea] dark:bg-[#38383a]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      settings.enableReadReceipts ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Allow Strangers */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
                    <Users size={16} />
                    Allow Messages from Strangers
                  </h3>
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    Receive messages from users you don't follow
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowStrangers', !settings.allowStrangers)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                    settings.allowStrangers ? 'bg-[#ffd700]' : 'bg-[#e5e5ea] dark:bg-[#38383a]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      settings.allowStrangers ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] p-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} />
              Privacy Settings
            </h2>
            
            <div className="space-y-4">
              {/* Auto Delete Messages */}
              <div>
                <h3 className="font-medium text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Clock size={16} />
                  Auto-Delete Messages
                </h3>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mb-3">
                  Automatically delete messages after a certain period
                </p>
                <select
                  value={settings.autoDeleteAfter}
                  onChange={(e) => handleSettingChange('autoDeleteAfter', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                >
                  <option value={0}>Never</option>
                  <option value={1}>After 1 day</option>
                  <option value={7}>After 1 week</option>
                  <option value={30}>After 1 month</option>
                  <option value={90}>After 3 months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                'flex-1 py-3 px-4 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-md shadow-[#ffd700]/20 active:scale-[0.97] flex items-center justify-center gap-2',
                (!hasChanges || isSaving) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-6 py-3 border border-[#e5e5ea] dark:border-[#38383a] rounded-xl font-semibold text-sm hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e] transition-all duration-200 text-[#1d1d1f] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
