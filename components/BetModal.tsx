
import React, { useState, useEffect } from 'react';
import { X, Loader2, Info, Wallet, Sparkles, BrainCircuit } from 'lucide-react';
import { PredictionMarket, BetType } from '../types';
import { cn, formatCurrency } from '../utils';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../contexts/ToastContext';

interface BetModalProps {
  market: PredictionMarket | null;
  betType: BetType | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (marketId: string, amount: number, type: BetType) => Promise<void>;
}

const BetModal: React.FC<BetModalProps> = ({ market, betType, isOpen, onClose, onPlaceBet }) => {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // AI Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setIsSubmitting(false);
      setError(null);
      setAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  // Early return AFTER all hooks
  if (!isOpen || !market || !betType) return null;

  const price = betType === 'YES' ? market.outcomeStats.yesPrice : market.outcomeStats.noPrice;
  const numericAmount = parseFloat(amount) || 0;
  
  // Potential return calculation (Simulated AMM logic)
  const estimatedReturn = numericAmount > 0 ? numericAmount / price : 0;
  const potentialProfit = estimatedReturn - numericAmount;
  const returnPercentage = numericAmount > 0 ? (potentialProfit / numericAmount) * 100 : 0;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Using gemini-2.5-flash for fast text analysis
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this prediction market question for a user who is considering betting ${betType}: "${market.question}". 
            Category: ${market.category}. 
            Current Stats: YES is ${market.outcomeStats.yesPercent}%, NO is ${market.outcomeStats.noPercent}%.
            Provide a concise 2-sentence risk assessment and probability insight.`
        });
        if (response.text) {
            setAnalysis(response.text);
        }
    } catch (err) {
        console.error("AI Analysis failed", err);
        setAnalysis("Could not generate analysis at this time.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      showToast("Please enter a valid bet amount", 'warning');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      await onPlaceBet(market.id, numericAmount, betType);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Transaction failed. Please try again.");
      showToast("Transaction failed. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isYes = betType === 'YES';
  const colorClass = isYes ? 'text-[#34c759]' : 'text-[#ff3b30]';
  const bgClass = isYes ? 'bg-[#34c759]' : 'bg-[#ff3b30]';
  const bgSoftClass = isYes ? 'bg-[#34c759]/10' : 'bg-[#ff3b30]/10';
  const borderClass = isYes ? 'border-[#34c759]/30' : 'border-[#ff3b30]/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-[#1d1d1f]">
            Bet <span className={cn("uppercase", colorClass)}>{betType}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

        {/* Market Context */}
        <div className="p-4 bg-[#f5f5f7] border-b border-[#e5e5ea]">
          <p className="text-sm text-[#1d1d1f] line-clamp-2 font-medium">{market.question}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#86868b]">
            <span>Current Price: <span className="text-[#1d1d1f] font-semibold">{price * 100}¢</span></span>
            <span>•</span>
            <span>Est. Return: <span className={cn("font-semibold", colorClass)}>{returnPercentage.toFixed(0)}%</span></span>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1d1d1f] flex justify-between">
              <span>Wager Amount (USDC)</span>
              <span className="flex items-center gap-1 text-[#86868b] text-xs">
                <Wallet size={12} /> Balance: $1,240.50
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-semibold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
                autoFocus
              />
            </div>
            
            {/* Quick Selectors */}
            <div className="flex gap-2 mt-2">
              {[10, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#f5f5f7] hover:bg-[#fff9e6] hover:border hover:border-[#ffd700]/30 text-[#1d1d1f] transition-all duration-200"
                >
                  ${val}
                </button>
              ))}
              <button
                  onClick={() => handleQuickAmount(1240.50)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#f5f5f7] hover:bg-[#fff9e6] hover:border hover:border-[#ffd700]/30 text-[#1d1d1f] transition-all duration-200 ml-auto"
                >
                  Max
                </button>
            </div>
          </div>

          {/* Calculations */}
          <div className={cn("p-4 rounded-xl space-y-2 border", bgSoftClass, borderClass)}>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Total Shares</span>
              <span className="font-mono text-[#1d1d1f] font-semibold">{(estimatedReturn || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Potential Payout</span>
              <span className="font-mono font-bold text-[#1d1d1f]">{formatCurrency(estimatedReturn)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Potential Profit</span>
              <span className={cn("font-mono font-bold", colorClass)}>+{formatCurrency(potentialProfit)}</span>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl p-3">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-[#ffc107] text-xs font-semibold uppercase tracking-wider">
                     <BrainCircuit size={14} /> AI Intelligence
                 </div>
                 {!analysis && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="text-[10px] bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium active:scale-95"
                    >
                        {isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Analyze Market
                    </button>
                 )}
             </div>
             {analysis ? (
                 <p className="text-xs text-[#1d1d1f] leading-relaxed animate-in fade-in">
                     {analysis}
                 </p>
             ) : (
                 <p className="text-[10px] text-[#86868b] italic">
                     Get AI-powered risk assessment before you bet.
                 </p>
             )}
          </div>
          
          {error && (
            <div className="text-[#ff3b30] text-sm flex items-center gap-2 bg-[#ff3b30]/10 p-3 rounded-xl border border-[#ff3b30]/20 relative">
              <Info size={16} className="flex-shrink-0" />
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

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || numericAmount <= 0}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg text-white shadow-md transform transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2",
              bgClass,
              (isSubmitting || numericAmount <= 0) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Confirming on Chain...
              </>
            ) : (
              `Review & Bet ${betType}`
            )}
          </button>
          
          <p className="text-center text-xs text-[#86868b]">
            By betting, you agree to the smart contract logic and non-refundable execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetModal;
