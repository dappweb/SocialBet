import React, { useState } from 'react';
import { Sparkles, Check, X, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { AIPrediction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { marketsApi } from '../services/api';

interface AIPredictionSuggestionProps {
    prediction: AIPrediction;
    onDismiss?: () => void;
    onCreated?: () => void;
}

const AIPredictionSuggestion: React.FC<AIPredictionSuggestionProps> = ({
    prediction,
    onDismiss,
    onCreated,
}) => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateMarket = async () => {
        if (!isAuthenticated || !user) {
            showToast('Please sign in to create a market', 'warning');
            return;
        }

        setIsCreating(true);
        try {
            const newMarket = await marketsApi.create({
                question: prediction.question,
                category: prediction.category,
                endDate: prediction.endDate,
                creatorId: user.id,
                isAiGenerated: true, // Mark as AI-generated
            });

            showToast('AI-generated market created successfully!', 'success');
            onCreated?.();
        } catch (error: any) {
            console.error('Failed to create market:', error);
            const errorMessage = error.message || 'Failed to create market';
            showToast(errorMessage, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        } catch {
            return dateString;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Crypto': 'bg-[#ffd700] text-[#1d1d1f]',
            'Sports': 'bg-[#34c759] text-white',
            'Pop Culture': 'bg-[#af52de] text-white',
            'Politics': 'bg-[#ff3b30] text-white',
            'Tech': 'bg-[#007aff] text-white',
        };
        return colors[category] || 'bg-[#86868b] text-white';
    };

    return (
        <div className="bg-gradient-to-br from-[#fff9e6] to-white border-2 border-[#ffd700] rounded-2xl p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ffd700] flex items-center justify-center">
                        <Sparkles size={16} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#1d1d1f] text-sm">AI-Generated Prediction</h3>
                        <p className="text-xs text-[#86868b]">Confidence: {prediction.confidence}%</p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="p-1 hover:bg-[#f5f5f7] rounded-lg transition-colors"
                        aria-label="Dismiss"
                    >
                        <X size={16} className="text-[#86868b]" />
                    </button>
                )}
            </div>

            {/* Question */}
            <div className="mb-4">
                <h4 className="font-semibold text-[#1d1d1f] text-base mb-2">{prediction.question}</h4>
                {prediction.description && (
                    <p className="text-sm text-[#86868b] leading-relaxed">{prediction.description}</p>
                )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-4 text-xs text-[#86868b]">
                <div className="flex items-center gap-1">
                    <span className={cn("px-2 py-1 rounded-lg font-semibold text-xs", getCategoryColor(prediction.category))}>
                        {prediction.category}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Ends {formatDate(prediction.endDate)}</span>
                </div>
            </div>

            {/* Reasoning (collapsible) */}
            {prediction.reasoning && prediction.reasoning !== prediction.description && (
                <details className="mb-4">
                    <summary className="text-xs text-[#86868b] cursor-pointer hover:text-[#1d1d1f] flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>View AI reasoning</span>
                    </summary>
                    <p className="mt-2 text-xs text-[#86868b] leading-relaxed pl-4 border-l-2 border-[#ffd700]/30">
                        {prediction.reasoning}
                    </p>
                </details>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCreateMarket}
                    disabled={isCreating || !isAuthenticated}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        isAuthenticated
                            ? "bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] disabled:opacity-50"
                            : "bg-[#e5e5ea] text-[#86868b] cursor-not-allowed"
                    )}
                >
                    {isCreating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <Check size={16} />
                            <span>Create Market</span>
                        </>
                    )}
                </button>
            </div>

            {!isAuthenticated && (
                <p className="mt-2 text-xs text-center text-[#86868b]">
                    Sign in to create this market
                </p>
            )}
        </div>
    );
};

export default AIPredictionSuggestion;

