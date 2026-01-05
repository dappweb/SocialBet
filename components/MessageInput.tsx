import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, Mic, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils';
import { useToast } from '../contexts/ToastContext';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'image') => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { showToast } = useToast();

  // Handle typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Start typing indicator
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        onTypingStart?.();
      }
      
      // Stop typing indicator after delay
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTypingStop?.();
        }, 1000);
      }
    }
  }, [maxLength, isTyping, onTypingStart, onTypingStop]);

  // Handle send message
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || isUploading) {
      return;
    }

    setIsUploading(true);
    
    try {
      onSendMessage(trimmedMessage, 'text');
      setMessage('');
      setIsTyping(false);
      onTypingStop?.();
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [message, disabled, isUploading, onSendMessage, showToast, setIsTyping, onTypingStop]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert to base64 for now (in production, you'd upload to a service)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onSendMessage(base64, 'image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process image:', error);
      showToast('Failed to process image. Please try again.', 'error');
      setIsUploading(false);
    }
  }, [onSendMessage, showToast]);

  // Handle voice recording (placeholder)
  const handleVoiceRecord = useCallback(() => {
    showToast('Voice recording coming soon!', 'info');
  }, [showToast]);

  // Handle emoji picker (placeholder)
  const handleEmojiPicker = useCallback(() => {
    showToast('Emoji picker coming soon!', 'info');
  }, [showToast]);

  return (
    <div className={cn('flex items-end gap-2 p-4 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e5ea] dark:border-[#38383a]', className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Text Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className={cn(
            'w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#38383a] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] focus:bg-white dark:focus:bg-[#1c1c1e] transition-all duration-200 text-[#1d1d1f] dark:text-white placeholder:text-[#c7c7cc] max-h-32',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            minHeight: '48px',
            maxHeight: '128px',
          }}
        />
        
        {/* Character Count */}
        <div className="absolute bottom-2 right-2 text-xs text-[#86868b] dark:text-[#a1a1a6]">
          {message.length}/{maxLength}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={handleEmojiPicker}
          disabled={disabled}
          className="p-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Smile size={20} />
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon size={20} />
        </button>

        {/* Voice Record Button */}
        <button
          type="button"
          onClick={handleVoiceRecord}
          disabled={disabled}
          className={cn(
            'p-2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            isRecording && 'text-[#ff3b30] animate-pulse'
          )}
        >
          <Mic size={20} />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim() || isUploading}
          className={cn(
            'p-2 text-[#1d1d1f] dark:text-white bg-[#ffd700] hover:bg-[#ffeb3b] rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
            isUploading && 'opacity-75'
          )}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
