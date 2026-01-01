
import React, { useState, useRef } from 'react';
import { X, Loader2, Calendar, Tag, DollarSign, HelpCircle, Image as ImageIcon, Sparkles, Upload, Coins, AlertCircle } from 'lucide-react';
import { MarketCategory } from '../types';
import { cn } from '../utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import SoulPurchaseModal from './SoulPurchaseModal';
import { usersApi } from '../services/api';
import { transferWithIssuanceFee } from '../services/soulContractService';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (marketData: any) => Promise<void>;
}

const CATEGORIES: MarketCategory[] = ['Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech'];
const SOUL_REQUIRED_FOR_MARKET = 10; // 10 SOUL tokens required to create a market

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { soulBalance, deductSoul, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Crypto');
  const [endDate, setEndDate] = useState('');
  const [liquidity, setLiquidity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  // Image Generation/Editing State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // If wallet is connected, use on-chain transfer with issuance fee
        if (isConnected && provider && walletAddress) {
          try {
            // Platform address for market creation fees (should be set in env)
            const platformAddress = import.meta.env.VITE_PLATFORM_ADDRESS || walletAddress; // Fallback for now
            
            // Transfer with issuance fee on-chain
            const result = await transferWithIssuanceFee(
              platformAddress,
              SOUL_REQUIRED_FOR_MARKET,
              provider
            );
            
            showToast(`Transaction sent! Hash: ${result.txHash.slice(0, 10)}...`, 'info');
            
            // Wait for transaction confirmation
            await result.receipt;
            
            showToast(`Transaction confirmed! ${SOUL_REQUIRED_FOR_MARKET} SOUL transferred with fee.`, 'success');
          } catch (error: any) {
            console.error('On-chain transfer failed:', error);
            // Fallback to backend-only if on-chain fails
            showToast('On-chain transfer failed, using backend only...', 'warning');
            const deducted = await deductSoul(SOUL_REQUIRED_FOR_MARKET);
            if (!deducted) {
              throw new Error('Failed to deduct Soul tokens');
            }
          }
        } else {
          // No wallet connected, use backend-only
          const deducted = await deductSoul(SOUL_REQUIRED_FOR_MARKET);
          if (!deducted) {
            showToast('Failed to deduct Soul tokens. Please try again.', 'error');
            setIsSubmitting(false);
            return;
          }
        }

        // Create market (backend will also validate and deduct Soul)
        await onCreate({ 
            question, 
            category, 
            endDate, 
            liquidity: parseFloat(liquidity),
            image: imagePreview 
        });
        
        // Refresh Soul balance from both backend and on-chain
        if (isAuthenticated && user?.id) {
          try {
            // Refresh from backend
            const userData = await usersApi.getById(user.id);
            if (userData.sosTokenBalance !== undefined) {
              localStorage.setItem(`soul_balance_${user.id}`, userData.sosTokenBalance.toString());
            }
            
            // Refresh from on-chain if connected
            if (isConnected && provider && walletAddress) {
              try {
                const { getBalance } = await import('../services/soulContractService');
                const balance = await getBalance(walletAddress, provider);
                // Update to on-chain balance (more accurate)
                localStorage.setItem(`soul_balance_${user.id}`, balance.balance.toString());
              } catch (error) {
                console.error('Failed to refresh on-chain balance:', error);
              }
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
        <div className="w-full max-w-lg bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
          <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Create New Market</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
              <X size={20} className="text-[#86868b]" />
            </button>
          </div>

          {/* Soul Balance Warning */}
          {!hasEnoughSoul && isAuthenticated && (
            <div className="mx-5 mt-5 p-4 bg-[#fff3cd] border border-[#ffd700] rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-[#ff9800] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-[#1d1d1f] mb-1">
                  Insufficient Soul Balance
                </div>
                <p className="text-xs text-[#86868b] mb-2">
                  You need {SOUL_REQUIRED_FOR_MARKET} SOUL to create a market. Your current balance: {soulBalance.toFixed(2)} SOUL
                </p>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="text-sm font-semibold text-[#1d1d1f] bg-[#ffd700] hover:bg-[#ffeb3b] px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Purchase Soul
                </button>
              </div>
            </div>
          )}

          {/* Soul Balance Display */}
          {isAuthenticated && (
            <div className="mx-5 mt-5 p-3 bg-[#fff9e6] border border-[#ffd700]/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-[#ffd700]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Soul Balance</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-lg font-bold",
                  hasEnoughSoul ? "text-[#1d1d1f]" : "text-[#ff3b30]"
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
