import React, { useState, useEffect } from 'react';
import { X, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { connect, isConnecting } = useAuth();
    const { web3auth, isLoading: web3AuthLoading } = useWeb3Auth();
    const { showToast } = useToast();
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    // Early return AFTER all hooks
    if (!isOpen) return null;

    // Check if Web3Auth is ready when modal opens
    useEffect(() => {
        if (isOpen) {
            if (!web3auth && !web3AuthLoading) {
                // Web3Auth failed to initialize
                setError('Authentication service is not available. Please refresh the page.');
            } else if (web3auth && !web3AuthLoading) {
                // Web3Auth is ready, clear any errors
                setError(null);
            }
        }
    }, [isOpen, web3auth, web3AuthLoading]);

    const handleConnect = async () => {
        // If Web3Auth is still loading, wait for it
        if (web3AuthLoading) {
            setIsInitializing(true);
            setError(null);
            showToast('Initializing authentication...', 'info');
            return;
        }

        // If Web3Auth failed to initialize
        if (!web3auth) {
            setError('Authentication service is not available. Please refresh the page.');
            setIsInitializing(false);
            return;
        }

        setError(null);
        setIsInitializing(false);

        try {
            // Call connect which will trigger Web3Auth's login modal
            await connect();
            showToast('Successfully signed in!', 'success');
            onClose();
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error?.message || error?.toString() || 'Unknown error';
            
            // Don't show error for user-cancelled login
            if (errorMessage.includes('cancelled') || 
                errorMessage.includes('closed') || 
                errorMessage.includes('User closed') ||
                errorMessage.includes('popup_closed_by_user') ||
                errorMessage.includes('user closed') ||
                errorMessage.includes('User rejected') ||
                errorMessage.includes('user_cancelled')) {
                // User cancelled, don't show error - just close modal silently
                onClose();
                return;
            }
            
            // Show user-friendly error message
            const friendlyError = errorMessage.includes('not available') || errorMessage.includes('not initialized')
                ? 'Authentication service is not available. Please refresh the page.'
                : 'Sign in failed. Please try again.';
            
            setError(friendlyError);
            showToast(friendlyError, 'error');
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl p-3 text-sm text-[#ff3b30] flex items-start gap-2 relative">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="flex-shrink-0 p-1 hover:bg-[#ff3b30]/20 rounded-full transition-colors duration-200"
                                aria-label="Close error"
                            >
                                <X size={14} className="text-[#ff3b30]" />
                            </button>
                        </div>
                    )}

                    {/* Single Sign In Button */}
                    <button
                        onClick={handleConnect}
                        disabled={isConnecting || isInitializing || (!web3auth && !web3AuthLoading)}
                        className={cn(
                            "w-full py-4 px-6 bg-gradient-to-r from-[#ffd700] to-[#ffeb3b] text-[#1d1d1f] font-semibold rounded-xl hover:from-[#ffeb3b] hover:to-[#ffd700] transition-all duration-200 shadow-lg shadow-[#ffd700]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
                            (!web3auth && !web3AuthLoading) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isConnecting || isInitializing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>{isInitializing ? 'Initializing...' : 'Connecting...'}</span>
                            </>
                        ) : !web3auth && web3AuthLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Loading...</span>
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
