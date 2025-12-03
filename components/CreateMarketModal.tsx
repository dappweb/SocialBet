import React, { useState } from 'react';
import { X, Loader2, Calendar, Tag, DollarSign, HelpCircle } from 'lucide-react';
import { MarketCategory } from '../types';
import { cn } from '../utils';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (marketData: any) => Promise<void>;
}

const CATEGORIES: MarketCategory[] = ['Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech'];

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Crypto');
  const [endDate, setEndDate] = useState('');
  const [liquidity, setLiquidity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!question || !endDate || !liquidity) return;
    
    setIsSubmitting(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        await onCreate({ question, category, endDate, liquidity: parseFloat(liquidity) });
        
        // Reset form
        setQuestion('');
        setEndDate('');
        setLiquidity('');
        onClose();
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Create New Market</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <HelpCircle size={14} /> Market Question
                </label>
                <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Will Bitcoin hit $100k by 2024?"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Tag size={14} /> Category
                    </label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MarketCategory)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Calendar size={14} /> End Date
                    </label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <DollarSign size={14} /> Initial Liquidity (USDC)
                </label>
                <input 
                    type="number"
                    value={liquidity}
                    onChange={(e) => setLiquidity(e.target.value)}
                    placeholder="1000"
                    min="100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                />
                <p className="text-xs text-slate-500">You must provide initial liquidity to bootstrap the market.</p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all active:scale-[0.98]",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" /> Creating...
                    </>
                ) : 'Create Market'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketModal;