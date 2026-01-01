import React from 'react';
import { X, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { connect, isConnecting } = useAuth();
    const { showToast } = useToast();

    // Early return AFTER all hooks
    if (!isOpen) return null;

    const handleConnect = async () => {
        try {
            await connect();
            showToast('Successfully signed in!', 'success');
            onClose();
        } catch (error: any) {
            console.error('Login error:', error);
            // Don't show error for user-cancelled login
            if (!error?.message?.includes('cancelled') && !error?.message?.includes('closed')) {
                showToast('Sign in failed. Please try again.', 'error');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">
                        Sign In to SocialBet
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200"
                        disabled={isConnecting}
                    >
                        <X size={20} className="text-[#86868b]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#ffd700] to-[#ffeb3b] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ffd700]/20">
                            <LogIn size={32} className="text-[#1d1d1f]" />
                        </div>
                        <p className="text-sm text-[#86868b] mb-2">
                            Choose your preferred login method
                        </p>
                        <p className="text-xs text-[#86868b]">
                            Social accounts (Google, Twitter, Discord, GitHub) or wallets
                        </p>
                    </div>

                    {/* Single Sign In Button */}
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full py-4 px-6 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-lg shadow-[#ffd700]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-xs text-[#86868b]">
                            <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
                            Non-custodial
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#86868b]">
                            <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
                            Secure MPC
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#86868b]">
                            <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
                            No seed phrase
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#86868b]">
                            <div className="w-1.5 h-1.5 bg-[#34c759] rounded-full"></div>
                            Instant wallet
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#f5f5f7] border-t border-[#e5e5ea]">
                    <p className="text-xs text-[#86868b] text-center">
                        Powered by Web3Auth • Non-custodial wallet infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
