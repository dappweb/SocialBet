import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiApi, ChatMessage } from '../services/api';
import { cn } from '../utils';

const ChatInterface: React.FC = memo(() => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hello! I'm your SoulCast AI assistant powered by Cloudflare AI. Ask me anything about KOL intent predictions, markets, or trending topics!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('llama-3.1-8b-instruct');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const userMessageObj = { role: 'user' as const, text: userMessage };
    
    // Update messages with user message
    setMessages(prev => {
      const updatedMessages = [...prev, userMessageObj];
      
      // Convert messages to ChatMessage format for API
      const chatMessages: ChatMessage[] = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
        text: msg.text,
      }));

      // Call Cloudflare AI API asynchronously
      setIsLoading(true);
      aiApi.chat(chatMessages)
        .then(response => {
          if (response.message) {
            setMessages(prevMsgs => [...prevMsgs, { role: 'assistant', text: response.message }]);
            if (response.model) {
              setCurrentModel(response.model);
            }
          } else {
            throw new Error('No response from AI');
      }
        })
        .catch((error: any) => {
      console.error("Chat error:", error);
          const errorMessage = error.message?.includes('AI service not available') 
            ? "AI service is currently unavailable. Please try again later."
            : "Sorry, I encountered an error. Please try again.";
          setMessages(prevMsgs => [...prevMsgs, { role: 'assistant', text: errorMessage }]);
        })
        .finally(() => {
      setIsLoading(false);
        });

      return updatedMessages;
    });
    
    setInputValue('');
  }, [inputValue, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-screen max-h-screen pb-20 sm:pb-0 bg-white border-x border-[#e5e5ea]/50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] px-4 py-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#ffd700] flex items-center justify-center shadow-sm">
          <Bot size={24} className="text-[#1d1d1f]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
             AI Assistant
            <span className="text-[10px] bg-[#fff9e6] text-[#ffd700] border border-[#ffd700]/30 px-2 py-0.5 rounded-full font-semibold">Cloudflare AI</span>
           </h1>
          <p className="text-xs text-[#86868b]">Powered by {currentModel}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 content-visibility-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === 'assistant' ? "bg-[#fff9e6] border border-[#ffd700]/30" : "bg-[#f5f5f7]"
            )}>
              {msg.role === 'assistant' ? <Sparkles size={14} className="text-[#ffd700]" /> : <User size={14} className="text-[#86868b]" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-[#ffd700] text-[#1d1d1f] rounded-tr-sm"
                : "bg-white border border-[#e5e5ea] text-[#1d1d1f] rounded-tl-sm shadow-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-[#fff9e6] border border-[#ffd700]/30 flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={14} className="text-[#ffd700]" />
                </div>
            <div className="bg-white border border-[#e5e5ea] p-3 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
              <Loader2 size={16} className="text-[#ffd700] animate-spin" />
              <span className="text-xs text-[#86868b]">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#e5e5ea] bg-white/90 backdrop-blur">
        <div className="relative flex items-end gap-2 bg-[#f5f5f7] rounded-xl border border-[#e5e5ea] p-2 focus-within:ring-2 focus-within:ring-[#ffd700] focus-within:bg-white transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about markets..."
            className="w-full bg-transparent text-[#1d1d1f] placeholder:text-[#86868b] text-sm resize-none focus:outline-none p-2 max-h-32"
            rows={1}
            style={{ minHeight: '44px' }}
            aria-label="Chat input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-[#ffd700] hover:bg-[#ffeb3b] text-[#1d1d1f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
