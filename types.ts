export type MarketCategory = 'Crypto' | 'Sports' | 'Pop Culture' | 'Politics' | 'Tech';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
  walletAddressEth?: string;
  walletAddressSol?: string;
  walletAddressBsc?: string;
  primaryChain?: 'ethereum' | 'solana' | 'bsc';
  sosTokenBalance?: number;
  isCreator?: boolean;
}

export interface PredictionMarket {
  id: string;
  creator: User | { id: 'ai'; name: 'AI Assistant'; handle: '@ai_assistant'; avatar: string };
  question: string;
  category: MarketCategory;
  endDate: string;
  poolSize: number; // in USD
  volume: number;
  likes: number;
  comments: number;
  image?: string;
  outcomeStats: {
    yesPercent: number;
    noPercent: number;
    yesPrice: number; // e.g. 0.65
    noPrice: number; // e.g. 0.35
  };
  isHot?: boolean;
  isAiGenerated?: boolean;
  aiPrediction?: {
    recommendedPosition: 'YES' | 'NO';
    confidence: number; // 0-100
    reasoning?: string;
    dataSources?: string[];
    lastUpdated?: string;
  };
  isPremium?: boolean;
  subscriptionTierRequired?: number;
}

export type BetType = 'YES' | 'NO';

export interface PendingBet {
  marketId: string;
  type: BetType;
  price: number;
  blockchain?: 'ethereum' | 'solana' | 'bsc';
  tokenSymbol?: string;
}

export interface DAOProposal {
  id: string;
  creatorId: string;
  proposalType: 'token_allocation' | 'platform_change' | 'feature_funding' | 'community_reward' | 'treasury_management';
  title: string;
  description: string;
  tokenAmount?: number;
  allocationTarget?: string;
  votingStart: string;
  votingEnd: string;
  quorum: number;
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  executionTxHash?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  messageType: 'text' | 'image' | 'file' | 'voice';
  content: string;
  timestamp: string;
  read: boolean;
  reactions?: { emoji: string; userIds: string[] }[];
}

export interface Conference {
  id: string;
  hostId: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'active' | 'ended';
  recordingUrl?: string;
  conferenceType: 'one-on-one' | 'group';
}

export interface Airdrop {
  id: string;
  tokenAmount: number; // SOS tokens
  eligibilityCriteria: string;
  distributionDate: string;
  recipients: string[];
  claimStatus: Record<string, boolean>;
  airdropType: 'registration' | 'activity' | 'referral' | 'event' | 'community';
}

export interface RedEnvelope {
  id: string;
  creatorId: string;
  totalAmount: number; // SOS tokens
  numberOfRecipients: number;
  distributionType: 'random' | 'equal';
  expirationTime: string;
  password?: string;
  claimedRecipients: string[];
  remainingAmount: number;
  status: 'active' | 'claimed' | 'expired';
  visibility: 'public' | 'group' | 'private';
}
