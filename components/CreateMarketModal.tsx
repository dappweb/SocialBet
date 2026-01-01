
import React, { useState, useRef } from 'react';
import { X, Loader2, Calendar, Tag, DollarSign, HelpCircle, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { MarketCategory } from '../types';
import { cn } from '../utils';
import { GoogleGenAI } from "@google/genai";

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
    
    setIsSubmitting(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await onCreate({ 
            question, 
            category, 
            endDate, 
            liquidity: parseFloat(liquidity),
            image: imagePreview 
        });
        
        // Reset form
        setQuestion('');
        setEndDate('');
        setLiquidity('');
        setImagePreview(null);
        setEditPrompt('');
        onClose();
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#e5e5ea]">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Create New Market</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors duration-200">
            <X size={20} className="text-[#86868b]" />
          </button>
        </div>

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

            <button
                type="submit"
                disabled={isSubmitting || isProcessingImage}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-lg text-[#1d1d1f] shadow-md flex items-center justify-center gap-2 bg-[#ffd700] hover:bg-[#ffeb3b] transition-all duration-200 active:scale-[0.97]",
                  (isSubmitting || isProcessingImage) && "opacity-50 cursor-not-allowed"
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
