import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../utils';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hello! I'm your SocialBet AI assistant. Ask me anything about prediction markets, odds, or trending topics!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-3-pro-preview for complex text tasks/chat
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are a helpful assistant for a Prediction Market app called SocialBet. You help users understand betting odds, market trends, and general knowledge. Keep answers concise and helpful.",
        }
      });
      
      // Replay history to context (simplified for this demo, ideally use chat.sendMessage with history properly)
      // For this stateless demo, we'll just send the last message as a new chat prompt or construct a history string if needed.
      // However, the GoogleGenAI chat object maintains history if we keep the instance, but here we re-create.
      // Let's just send the user message for now as a single turn for simplicity or construct a history block.
      
      const response = await chat.sendMessage({ message: userMessage });
      
      if (response.text) {
          setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to Gemini. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pb-20 sm:pb-0 bg-black/50 border-x border-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Bot size={24} className="text-white" />
        </div>
        <div>
           <h1 className="text-xl font-bold text-white flex items-center gap-2">
             AI Assistant
             <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Gemini Pro</span>
           </h1>
           <p className="text-xs text-slate-500">Powered by gemini-3-pro-preview</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === 'model' ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-700"
            )}>
              {msg.role === 'model' ? <Sparkles size={14} className="text-indigo-400" /> : <User size={14} className="text-slate-300" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-sm" 
                : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                     <Sparkles size={14} className="text-indigo-400" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                    <span className="text-xs text-slate-500">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-black/90 backdrop-blur">
        <div className="relative flex items-end gap-2 bg-slate-900 rounded-xl border border-slate-700 p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about markets..."
            className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none p-2 max-h-32"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
