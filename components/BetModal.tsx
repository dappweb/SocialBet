
import React, { useState, useEffect } from 'react';
import { X, Loader2, Info, Wallet, Sparkles, BrainCircuit } from 'lucide-react';
import { PredictionMarket, BetType } from '../types';
import { cn, formatCurrency } from '../utils';
import { GoogleGenAI } from "@google/genai";

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const isYes = betType === 'YES';
  const colorClass = isYes ? 'text-emerald-500' : 'text-rose-500';
  const bgClass = isYes ? 'bg-emerald-500' : 'bg-rose-500';
  const bgSoftClass = isYes ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const borderClass = isYes ? 'border-emerald-500/50' : 'border-rose-500/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Bet <span className={cn("uppercase", colorClass)}>{betType}</span>
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Market Context */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800">
          <p className="text-sm text-slate-400 line-clamp-2">{market.question}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Current Price: <span className="text-white font-medium">{price * 100}¢</span></span>
            <span>•</span>
            <span>Est. Return: <span className={cn("font-medium", colorClass)}>{returnPercentage.toFixed(0)}%</span></span>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex justify-between">
              <span>Wager Amount (USDC)</span>
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Wallet size={12} /> Balance: $1,240.50
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                autoFocus
              />
            </div>
            
            {/* Quick Selectors */}
            <div className="flex gap-2 mt-2">
              {[10, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  ${val}
                </button>
              ))}
              <button
                  onClick={() => handleQuickAmount(1240.50)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-auto"
                >
                  Max
                </button>
            </div>
          </div>

          {/* Calculations */}
          <div className={cn("p-4 rounded-xl space-y-2 border", bgSoftClass, borderClass)}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Shares</span>
              <span className="font-mono text-white">{(estimatedReturn || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Payout</span>
              <span className="font-mono font-bold text-white">{formatCurrency(estimatedReturn)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Profit</span>
              <span className={cn("font-mono font-bold", colorClass)}>+{formatCurrency(potentialProfit)}</span>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                     <BrainCircuit size={14} /> Gemini Intelligence
                 </div>
                 {!analysis && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="text-[10px] bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                        {isAnalyzing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Analyze Market
                    </button>
                 )}
             </div>
             {analysis ? (
                 <p className="text-xs text-indigo-200 leading-relaxed animate-in fade-in">
                     {analysis}
                 </p>
             ) : (
                 <p className="text-[10px] text-slate-500 italic">
                     Get AI-powered risk assessment before you bet.
                 </p>
             )}
          </div>
          
          {error && (
            <div className="text-rose-500 text-sm flex items-center gap-2 bg-rose-500/10 p-3 rounded-lg">
              <Info size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || numericAmount <= 0}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              bgClass,
              (isSubmitting || numericAmount <= 0) && "opacity-50 cursor-not-allowed grayscale"
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
          
          <p className="text-center text-xs text-slate-600">
            By betting, you agree to the smart contract logic and non-refundable execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetModal;
