import React, { useState } from 'react';
import { X, Loader2, Mail, Twitter, MessageCircle, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: Mail,
    color: 'bg-[#4285F4] hover:bg-[#357ae8]',
    description: 'Continue with Google'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-[#1DA1F2] hover:bg-[#1a91da]',
    description: 'Continue with Twitter'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageCircle,
    color: 'bg-[#5865F2] hover:bg-[#4752c4]',
    description: 'Continue with Discord'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-[#24292e] hover:bg-[#1a1e22]',
    description: 'Continue with GitHub'
  },
];

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({ isOpen, onClose }) => {
  const { connectSocial, isConnecting } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: string) => {
    setError(null);
    setConnectingProvider(provider);
    try {
      await connectSocial(provider);
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to connect with ${provider}`);
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">
            Sign in with Social Account
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
            disabled={isConnecting}
          >
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

        {/* Social Login Options */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-[#86868b] text-center mb-4">
            Choose a social account to sign in or create an account
          </p>

          {SOCIAL_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const isConnectingThis = connectingProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={isConnecting || isConnectingThis}
                className={cn(
                  "w-full p-4 rounded-xl font-semibold text-white transition-all duration-200",
                  "flex items-center justify-center gap-3",
                  provider.color,
                  (isConnecting && !isConnectingThis) && "opacity-50 cursor-not-allowed",
                  !isConnecting && "active:scale-95"
                )}
              >
                {isConnectingThis ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Icon size={20} />
                    <span>{provider.description}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl p-3 text-sm text-[#ff3b30]">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f5f5f7] border-t border-[#e5e5ea]">
          <p className="text-xs text-[#86868b] text-center">
            By signing in, you agree to SoulCast's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginModal;

