import React from 'react';
import { Check, CheckCheck, Clock, X } from 'lucide-react';
import { Message } from '../types/messaging';
import { cn } from '../utils';
import LazyImage from './LazyImage';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
  showStatus?: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showTimestamp = true,
  showStatus = true,
  className = '',
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.isRead) {
      return <CheckCheck size={16} className="text-[#34c759]" />;
    }
    
    return <Check size={16} className="text-[#86868b]" />;
  };

  const getMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words text-[#1d1d1f] dark:text-white">
            {message.content}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment) => (
              <div key={attachment.id} className="relative group">
                <LazyImage
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs">
                      {attachment.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'system':
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg text-sm text-[#86868b] dark:text-[#a1a1a6]">
            <Clock size={14} />
            <span>{message.content}</span>
          </div>
        );
      default:
        return (
          <div className="text-[#86868b] dark:text-[#a1a1a6]">
            Unsupported message type
          </div>
        );
    }
  };

  return (
    <div className={cn(
      'flex gap-2',
      isOwn ? 'flex-row-reverse' : 'flex-row',
      className
    )}>
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#e5e5ea] dark:bg-[#38383a] flex items-center justify-center">
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a1a6]">?</span>
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm',
          isOwn
            ? 'bg-[#ffd700] text-[#1d1d1f] rounded-br-2xl rounded-bl-sm'
            : 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white rounded-bl-2xl rounded-br-sm border border-[#e5e5ea] dark:border-[#38383a]',
          className
        )}
      >
        {/* Message Content */}
        {getMessageContent()}

        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            'text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1',
            isOwn ? 'text-right' : 'text-left'
          )}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>

      {/* Status Icon */}
      {isOwn && showStatus && (
        <div className="flex-shrink-0 flex items-center justify-center">
          {getStatusIcon()}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
