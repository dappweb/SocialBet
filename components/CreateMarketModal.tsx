
import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Calendar, Tag, DollarSign, HelpCircle, Image as ImageIcon, Sparkles, Upload, Coins, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { MarketCategory } from '../types';
import { cn } from '../utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { useWallet } from '../contexts/WalletContext';
import SoulPurchaseModal from './SoulPurchaseModal';
import { usersApi, aiApi, CurrentEvent } from '../services/api';
import { createMarket as createMarketOnChain } from '../services/predictionMarketService';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (marketData: any) => Promise<void>;
}

const CATEGORIES: MarketCategory[] = ['Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech'];
const SOUL_REQUIRED_FOR_MARKET = 10; // 10 SOUL tokens required to create a market

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { soulBalance, deductSoul, isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { provider } = useWeb3Auth();
  const { isConnected, currentChain } = useWallet();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Crypto');
  const [endDate, setEndDate] = useState('');
  const [liquidity, setLiquidity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showSoulWarning, setShowSoulWarning] = useState(true);
  
  // Image Generation/Editing State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current Events State
  const [currentEvents, setCurrentEvents] = useState<CurrentEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch current events when modal opens
  useEffect(() => {
    if (isOpen && currentEvents.length === 0) {
      fetchCurrentEvents();
    }
  }, [isOpen]);

  const fetchCurrentEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await aiApi.getCurrentEvents();
      if (response.events && response.events.length > 0) {
        setCurrentEvents(response.events);
      }
    } catch (error) {
      console.error('Failed to fetch current events:', error);
      // Keep empty array on error
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleEventClick = async (event: CurrentEvent) => {
    // Auto-fill form with event data
    setQuestion(event.suggestedQuestion);
    setCategory(event.category as MarketCategory);
    
    // Set end date to 7 days from now (default)
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);
    setEndDate(defaultEndDate.toISOString().split('T')[0]);
    
    // Set default liquidity
    if (!liquidity) {
      setLiquidity('1000');
    }

    showToast(`Form filled with: ${event.title}`, 'success');
  };

  const handleGenerateFromEvent = async (event: CurrentEvent) => {
    try {
      const response = await aiApi.generatePrediction({
        topic: event.title,
        context: event.description,
        category: event.category,
      });

      if (response.prediction) {
        setQuestion(response.prediction.question);
        setCategory(response.prediction.category as MarketCategory);
        setEndDate(new Date(response.prediction.endDate).toISOString().split('T')[0]);
        if (!liquidity) {
          setLiquidity('1000');
        }
        showToast('AI prediction generated from event!', 'success');
      }
    } catch (error) {
      console.error('Failed to generate prediction from event:', error);
      showToast('Failed to generate prediction. Using event data instead.', 'warning');
      handleEventClick(event);
    }
  };

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiEdit = async () => {
    if (!imagePreview || !editPrompt) return;
    setIsProcessingImage(true);

    try {
      // Clean base64 string
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash-image for "nano banana" functionality
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType, 
                data: base64Data
              }
            },
            {
              text: editPrompt
            }
          ]
        }
      });

      // Extract image from response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const newBase64 = part.inlineData.data;
            const newMime = part.inlineData.mimeType || 'image/png';
            setImagePreview(`data:${newMime};base64,${newBase64}`);
            setEditPrompt(''); // Clear prompt on success
        }
      }

    } catch (error) {
      console.error("Image edit failed", error);
      alert("Failed to edit image with AI. Please try again.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!question || !endDate || !liquidity) return;

    // Check authentication
    if (!isAuthenticated) {
      showToast('Please sign in to create a market', 'warning');
      return;
    }

    // Check Soul balance
    if (soulBalance < SOUL_REQUIRED_FOR_MARKET) {
      showToast(`Insufficient Soul balance. ${SOUL_REQUIRED_FOR_MARKET} SOUL required to create a market.`, 'error');
      setIsPurchaseModalOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
        // Deduct Soul tokens locally for immediate feedback
        const deducted = await deductSoul(SOUL_REQUIRED_FOR_MARKET);
        if (!deducted) {
          showToast('Failed to deduct Soul tokens. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }

        let onChainMarketId: number | undefined;
        let txHash: string | undefined;

        // Create market on-chain if wallet connected and on Ethereum
        if (isConnected && provider && currentChain === 'ethereum') {
          const contractAddress = import.meta.env.VITE_PREDICTION_MARKET_SEPOLIA;
          if (contractAddress) {
            try {
              showToast('Creating market on blockchain...', 'info');
              const endDateObj = new Date(endDate);
              const initialLiquidity = parseFloat(liquidity) || 10; // Default 10 tokens
              
              const result = await createMarketOnChain(
                provider,
                contractAddress,
                question,
                category,
                endDateObj,
                initialLiquidity
              );

              if (result.success && result.marketId) {
                onChainMarketId = result.marketId;
                txHash = result.txHash;
                showToast(`Market created on-chain! ID: ${result.marketId}`, 'success');
              } else {
                console.warn('On-chain market creation failed, falling back to API:', result.error);
                showToast('On-chain creation failed, using API fallback', 'warning');
              }
            } catch (onChainError) {
              console.error('On-chain market creation error:', onChainError);
              showToast('On-chain creation failed, using API fallback', 'warning');
            }
          }
        }

        // Create market in backend (for UI sync and metadata)
        await onCreate({ 
            question, 
            category, 
            endDate, 
            liquidity: parseFloat(liquidity),
            image: imagePreview,
            onChainMarketId,
            txHash
        });
        
        // Refresh Soul balance from backend
        if (isAuthenticated && user?.id) {
          try {
            const userData = await usersApi.getById(user.id);
            // Update local balance to match backend
            if (userData.sosTokenBalance !== undefined) {
              localStorage.setItem(`soul_balance_${user.id}`, userData.sosTokenBalance.toString());
            }
          } catch (error) {
            console.error('Failed to refresh Soul balance:', error);
          }
        }
        
        showToast(`Market created! ${SOUL_REQUIRED_FOR_MARKET} SOUL deducted.`, 'success');
        
        // Reset form
        setQuestion('');
        setEndDate('');
        setLiquidity('');
        setImagePreview(null);
        setEditPrompt('');
        onClose();
    } catch (error) {
        console.error(error);
        showToast('Failed to create market. Please try again.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    showToast('Soul tokens purchased successfully!', 'success');
  };

  const hasEnoughSoul = soulBalance >= SOUL_REQUIRED_FOR_MARKET;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 transition-colors duration-300">
          <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea] dark:border-[#38383a]">
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Create New Market</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-[#0a0a0a] rounded-full transition-colors duration-200">
              <X size={20} className="text-[#86868b] dark:text-[#a1a1a6]" />
          </button>
        </div>

          {/* Soul Balance Warning */}
          {!hasEnoughSoul && isAuthenticated && showSoulWarning && (
            <div className="mx-5 mt-5 p-4 bg-[#fff3cd] dark:bg-[#332d1a] border border-[#ffd700] rounded-xl flex items-start gap-3 relative">
              <AlertCircle size={20} className="text-[#ff9800] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] dark:text-white mb-1">
                  Insufficient Soul Balance
                </div>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mb-2">
                  You need {SOUL_REQUIRED_FOR_MARKET} SOUL to create a market. Your current balance: {soulBalance.toFixed(2)} SOUL
                </p>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="text-sm font-semibold text-[#1d1d1f] bg-[#ffd700] hover:bg-[#ffeb3b] px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Purchase Soul
                </button>
              </div>
              <button
                onClick={() => setShowSoulWarning(false)}
                className="absolute top-2 right-2 p-1 hover:bg-[#ffd700]/20 rounded-full transition-colors duration-200"
                aria-label="Close warning"
              >
                <X size={16} className="text-[#86868b] dark:text-[#a1a1a6]" />
              </button>
            </div>
          )}

          {/* Soul Balance Display */}
          {isAuthenticated && (
            <div className="mx-5 mt-5 p-3 bg-[#fff9e6] dark:bg-[#332d1a] border border-[#ffd700]/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-[#ffd700]" />
                <span className="text-sm font-medium text-[#1d1d1f] dark:text-white">Soul Balance</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-lg font-bold",
                  hasEnoughSoul ? "text-[#1d1d1f] dark:text-white" : "text-[#ff3b30]"
                )}>
                  {soulBalance.toFixed(2)} SOUL
                </span>
                {!hasEnoughSoul && (
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="text-xs font-semibold text-[#1d1d1f] bg-[#ffd700] hover:bg-[#ffeb3b] px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Events Section */}
            {currentEvents.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                            <TrendingUp size={14} className="text-[#ffd700]" /> Current Events
                        </label>
                        <button
                            type="button"
                            onClick={fetchCurrentEvents}
                            disabled={isLoadingEvents}
                            className="text-xs text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white flex items-center gap-1 transition-colors"
                        >
                            {isLoadingEvents ? (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <span>Refresh</span>
                            )}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                        {currentEvents.map((event, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#f5f5f7] dark:bg-[#0a0a0a] hover:bg-[#fff9e6] dark:hover:bg-[#332d1a] border border-[#e5e5ea] dark:border-[#38383a] hover:border-[#ffd700]/50 rounded-xl p-3 cursor-pointer transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-xs font-semibold px-2 py-0.5 rounded",
                                                event.category === 'Crypto' ? 'bg-[#ffd700] text-[#1d1d1f]' :
                                                event.category === 'Sports' ? 'bg-[#34c759] text-white' :
                                                event.category === 'Pop Culture' ? 'bg-[#af52de] text-white' :
                                                event.category === 'Politics' ? 'bg-[#ff3b30] text-white' :
                                                'bg-[#007aff] text-white'
                                            )}>
                                                {event.category}
                                            </span>
                                            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white truncate">{event.title}</h4>
                                        </div>
                                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] line-clamp-2 mb-2">{event.description}</p>
                                        <p className="text-xs font-medium text-[#1d1d1f] dark:text-white mb-2">{event.suggestedQuestion}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEventClick(event)}
                                        className="flex-1 text-xs font-semibold bg-white hover:bg-[#ffd700] text-[#1d1d1f] px-3 py-1.5 rounded-lg transition-all duration-200 border border-[#e5e5ea] hover:border-[#ffd700]"
                                    >
                                        Use This
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateFromEvent(event)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] px-3 py-1.5 rounded-lg transition-all duration-200"
                                    >
                                        <Zap size={12} />
                                        AI Generate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoadingEvents && currentEvents.length === 0 && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-[#ffd700]" />
                    <span className="ml-2 text-sm text-[#86868b]">Loading current events...</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <HelpCircle size={14} /> Market Question
                </label>
                <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Will Bitcoin hit $100k by 2024?"
                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] resize-none h-24 transition-all duration-200"
                    required
                />
            </div>

            {/* AI Image Generation/Editing Section */}
            <div className="space-y-2">
                 <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <ImageIcon size={14} /> Market Image (Optional)
                </label>
                <div className="bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-4">
                    {imagePreview ? (
                        <div className="space-y-4">
                             <div className="relative aspect-video rounded-xl overflow-hidden border border-[#e5e5ea] bg-white flex items-center justify-center group shadow-sm">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                <button 
                                    type="button"
                                    onClick={() => setImagePreview(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-[#ff3b30]/90 text-[#1d1d1f] hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                                >
                                    <X size={14} />
                                </button>
                             </div>
                             
                             {/* AI Editor */}
                             <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffd700]" />
                                    <input 
                                        type="text" 
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="AI Edit: 'Add neon lights', 'Cyberpunk style'..."
                                        className="w-full bg-white border border-[#e5e5ea] rounded-lg py-2 pl-9 pr-3 text-sm text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:ring-1 focus:ring-[#ffd700] focus:outline-none focus:border-[#ffd700] transition-all duration-200"
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAiEdit}
                                    disabled={!editPrompt || isProcessingImage}
                                    className="bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 active:scale-95"
                                >
                                    {isProcessingImage ? <Loader2 size={14} className="animate-spin" /> : 'Edit'}
                                </button>
                             </div>
                             <p className="text-[10px] text-[#86868b]">Powered by Gemini 2.5 Flash Image</p>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#e5e5ea] hover:border-[#ffd700]/50 rounded-xl h-32 flex flex-col items-center justify-center text-[#86868b] cursor-pointer transition-all duration-200 hover:bg-[#fff9e6]"
                        >
                            <Upload size={24} className="mb-2 opacity-50" />
                            <span className="text-sm font-medium">Upload Image</span>
                            <span className="text-xs opacity-50 mt-1">to unlock AI editing</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                        <Tag size={14} /> Category
                    </label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MarketCategory)}
                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] appearance-none cursor-pointer transition-all duration-200"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                        <Calendar size={14} /> End Date
                    </label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-[#1d1d1f] flex items-center gap-2">
                    <DollarSign size={14} /> Initial Liquidity (USDC)
                </label>
                <input 
                    type="number"
                    value={liquidity}
                    onChange={(e) => setLiquidity(e.target.value)}
                    placeholder="1000"
                    min="100"
                    className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl p-3 text-[#1d1d1f] placeholder:text-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:bg-white focus:border-[#ffd700] transition-all duration-200"
                    required
                />
                <p className="text-xs text-[#86868b]">You must provide initial liquidity to bootstrap the market.</p>
            </div>

            <div className="space-y-2">
            <button
                type="submit"
                  disabled={isSubmitting || isProcessingImage || !hasEnoughSoul || !isAuthenticated}
                className={cn(
                    "w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97]",
                    (isSubmitting || isProcessingImage || !hasEnoughSoul || !isAuthenticated) && "opacity-50 cursor-not-allowed"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" /> Creating...
                    </>
                ) : 'Create Market'}
            </button>
              <p className="text-xs text-center text-[#86868b]">
                {SOUL_REQUIRED_FOR_MARKET} SOUL will be deducted when you create this market
              </p>
            </div>
        </form>
      </div>
    </div>
    <SoulPurchaseModal
      isOpen={isPurchaseModalOpen}
      onClose={() => setIsPurchaseModalOpen(false)}
      onPurchaseSuccess={handlePurchaseSuccess}
    />
    </>
  );
};

export default CreateMarketModal;
