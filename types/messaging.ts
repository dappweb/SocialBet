export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isDeleted: boolean;
  messageType: 'text' | 'image' | 'system';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  lastActivity: string;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
}

export interface MessageThread {
  conversationId: string;
  messages: Message[];
  participants: string[];
  otherUser: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  typingUsers: string[];
}

export interface MessageNotification {
  id: string;
  type: 'new_message' | 'message_read' | 'typing_started' | 'typing_stopped';
  conversationId: string;
  senderId: string;
  receiverId: string;
  content?: string;
  timestamp: string;
  isRead: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageSettings {
  enableNotifications: boolean;
  enableSounds: boolean;
  enableTypingIndicators: boolean;
  enableReadReceipts: boolean;
  autoDeleteAfter: number; // days, 0 = never
  allowStrangers: boolean;
  blockedUsers: string[];
}
