export type MarketCategory = 'Crypto' | 'Sports' | 'Pop Culture' | 'Politics' | 'Tech';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
}

export interface PredictionMarket {
  id: string;
  creator: User;
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
}

export type BetType = 'YES' | 'NO';

export interface PendingBet {
  marketId: string;
  type: BetType;
  price: number;
}
