import React, { useState, memo } from 'react';
import { X, Smartphone, Apple, Download, QrCode, ExternalLink } from 'lucide-react';
import { cn } from '../utils';

interface AppDownloadProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppDownload: React.FC<AppDownloadProps> = memo(({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  const appStoreUrl = 'https://apps.apple.com/app/kolmarket';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kolmarket.app';
  const apkDownloadUrl = '/downloads/kolmarket-latest.apk';

  const handleDownload = (platform: 'ios' | 'android' | 'apk') => {
    switch (platform) {
      case 'ios':
        window.open(appStoreUrl, '_blank');
        break;
      case 'android':
        window.open(playStoreUrl, '_blank');
        break;
      case 'apk':
        window.open(apkDownloadUrl, '_blank');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#ffd700] to-[#ffb700] p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <X size={20} className="text-[#1d1d1f]" />
          </button>
          
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-[#1d1d1f]">SB</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-1">Download KOL Market</h2>
          <p className="text-sm text-[#1d1d1f]/70">Get the full experience on mobile</p>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
          <button
            onClick={() => setActiveTab('ios')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors",
              activeTab === 'ios'
                ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
                : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
            )}
          >
            <Apple size={20} />
            iOS
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors",
              activeTab === 'android'
                ? "text-[#1d1d1f] dark:text-white border-b-2 border-[#ffd700]"
                : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
            )}
          >
            <Smartphone size={20} />
            Android
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'ios' ? (
            <div className="space-y-4">
              {/* App Store Button */}
              <button
                onClick={() => handleDownload('ios')}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <Apple size={24} />
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-lg font-bold">App Store</div>
                </div>
              </button>

              {/* QR Code Section */}
              <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border border-[#e5e5ea]">
                    <QrCode size={64} className="text-[#1d1d1f]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Scan to Download</h4>
                    <p className="text-sm text-[#86868b]">
                      Open your camera app and scan the QR code to download directly
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="text-center text-sm text-[#86868b]">
                Requires iOS 14.0 or later. Compatible with iPhone and iPad.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Play Button */}
              <button
                onClick={() => handleDownload('android')}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">GET IT ON</div>
                  <div className="text-lg font-bold">Google Play</div>
                </div>
              </button>

              {/* APK Direct Download */}
              <button
                onClick={() => handleDownload('apk')}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-[#e5e5ea] dark:border-[#2c2c2e] text-[#1d1d1f] dark:text-white rounded-xl font-medium hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors"
              >
                <Download size={20} />
                Download APK Directly
                <ExternalLink size={16} className="text-[#86868b]" />
              </button>

              {/* QR Code Section */}
              <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border border-[#e5e5ea]">
                    <QrCode size={64} className="text-[#1d1d1f]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1d1d1f] dark:text-white mb-1">Scan to Download</h4>
                    <p className="text-sm text-[#86868b]">
                      Scan with your Android device to download from Google Play
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="text-center text-sm text-[#86868b]">
                Requires Android 8.0 or later. APK size: ~45MB
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-[#fff9e6] dark:bg-[#332d1a] rounded-xl p-4 border border-[#ffd700]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffd700]/20 flex items-center justify-center flex-shrink-0">
                <Smartphone size={20} className="text-[#ffd700]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1d1d1f] dark:text-white text-sm mb-1">
                  Mobile App Features
                </h4>
                <ul className="text-xs text-[#86868b] space-y-1">
                  <li>• Push notifications for prediction updates</li>
                  <li>• Biometric login (Face ID / Fingerprint)</li>
                  <li>• Offline mode for viewing predictions</li>
                  <li>• Widget support for quick access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AppDownload.displayName = 'AppDownload';

export default AppDownload;
