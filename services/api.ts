// API Service Layer for SoulCast
// Provides typed methods for all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://socialbet-api.dappweb.workers.dev';

// Types matching backend responses
export interface User {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
    isVerified: boolean;
    walletAddressEth?: string;
    walletAddressSol?: string;
    walletAddressBsc?: string;
    primaryChain?: string;
    sosTokenBalance?: number;
    isCreator?: boolean;
    isAdmin?: boolean;
}

export interface Market {
    id: string;
    creator: User;
    question: string;
    category: string;
    endDate: string;
    poolSize: number;
    volume: number;
    likes: number;
    comments: number;
    image?: string;
    isHot: boolean;
    isAiGenerated?: boolean;
    isPremium?: boolean;
    outcomeStats: {
        yesPercent: number;
        noPercent: number;
        yesPrice: number;
        noPrice: number;
    };
}

export interface Bet {
    id: string;
    marketId: string;
    marketQuestion?: string;
    marketCategory?: string;
    userId: string;
    betType: 'YES' | 'NO';
    amount: number;
    priceAtBet: number;
    blockchain?: string;
    status: 'pending' | 'confirmed' | 'won' | 'lost';
    createdAt: string;
}

export interface Comment {
    id: string;
    marketId: string;
    user: User;
    content: string;
    createdAt: string;
}

export interface UserStats {
    marketsCreated: number;
    betsPlaced: number;
    totalVolume: number;
    wins: number;
    likesReceived: number;
    winRate: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    text?: string; // For backward compatibility
}

export interface ChatResponse {
    message: string;
    model: string;
    timestamp: string;
}

export interface MarketAnalysis {
    analysis: string;
    marketId?: string;
    timestamp: string;
}

// API Error class
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// Fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ApiError(response.status, error.error || 'API request failed');
    }

    return response.json();
}

// ==================== Markets API ====================

export const marketsApi = {
    // Get all markets with optional filters
    async getAll(options?: { category?: string; limit?: number; offset?: number; sort?: string }): Promise<Market[]> {
        const params = new URLSearchParams();
        if (options?.category && options.category !== 'All') params.set('category', options.category);
        if (options?.limit) params.set('limit', String(options.limit));
        if (options?.offset) params.set('offset', String(options.offset));
        if (options?.sort) params.set('sort', options.sort);

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<Market[]>(`/api/markets${query}`);
    },

    // Get single market by ID
    async getById(id: string): Promise<Market> {
        return fetchApi<Market>(`/api/markets/${id}`);
    },

    // Create new market
    async create(data: { question: string; category: string; endDate: string; image?: string; creatorId?: string }): Promise<Market> {
        return fetchApi<Market>('/api/markets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update market
    async update(id: string, data: Partial<{ question: string; category: string; endDate: string; image: string; isHot: boolean }>): Promise<{ success: boolean }> {
        return fetchApi<{ success: boolean }>(`/api/markets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete market
    async delete(id: string): Promise<{ success: boolean }> {
        return fetchApi<{ success: boolean }>(`/api/markets/${id}`, {
            method: 'DELETE',
        });
    },
};

// ==================== Users API ====================

export const usersApi = {
    // Get user by ID
    async getById(id: string): Promise<User> {
        return fetchApi<User>(`/api/users/${id}`);
    },

    // Update user profile
    async update(id: string, data: Partial<User>): Promise<{ success: boolean }> {
        return fetchApi<{ success: boolean }>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Get user statistics
    async getStats(id: string): Promise<UserStats> {
        return fetchApi<UserStats>(`/api/users/${id}/stats`);
    },

    // Get all users (for leaderboard)
    async getAll(options?: { limit?: number; sort?: string }): Promise<User[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', String(options.limit));
        if (options?.sort) params.set('sort', options.sort);

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<User[]>(`/api/users${query}`);
    },

    // Add Soul tokens (for purchases)
    async addSoul(id: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
        return fetchApi<{ success: boolean; newBalance: number }>(`/api/users/${id}/soul`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },
};

// ==================== Bets API ====================

export const betsApi = {
    // Place a bet
    async place(data: { marketId: string; betType: 'YES' | 'NO'; amount: number; priceAtBet: number; blockchain?: string; userId?: string }): Promise<Bet> {
        return fetchApi<Bet>('/api/bets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get user's bets
    async getByUser(userId: string, options?: { status?: string; limit?: number }): Promise<Bet[]> {
        const params = new URLSearchParams();
        if (options?.status) params.set('status', options.status);
        if (options?.limit) params.set('limit', String(options.limit));

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<Bet[]>(`/api/bets/user/${userId}${query}`);
    },

    // Get bets for a market
    async getByMarket(marketId: string, options?: { limit?: number }): Promise<Bet[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', String(options.limit));

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<Bet[]>(`/api/bets/market/${marketId}${query}`);
    },

    // Get single bet
    async getById(id: string): Promise<Bet> {
        return fetchApi<Bet>(`/api/bets/${id}`);
    },
};

// ==================== Social API (Likes & Comments) ====================

export const socialApi = {
    // Like a market
    async likeMarket(marketId: string, userId: string = 'me'): Promise<{ success: boolean; likes: number }> {
        return fetchApi<{ success: boolean; likes: number }>(`/api/social/markets/${marketId}/like`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    },

    // Unlike a market
    async unlikeMarket(marketId: string, userId: string = 'me'): Promise<{ success: boolean; likes: number }> {
        return fetchApi<{ success: boolean; likes: number }>(`/api/social/markets/${marketId}/like`, {
            method: 'DELETE',
            body: JSON.stringify({ userId }),
        });
    },

    // Check if user liked a market
    async checkLike(marketId: string, userId: string = 'me'): Promise<{ isLiked: boolean; totalLikes: number }> {
        return fetchApi<{ isLiked: boolean; totalLikes: number }>(`/api/social/markets/${marketId}/likes?userId=${userId}`);
    },

    // Add comment to market
    async addComment(marketId: string, content: string, userId: string = 'me'): Promise<Comment> {
        return fetchApi<Comment>(`/api/social/markets/${marketId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ userId, content }),
        });
    },

    // Get comments for a market
    async getComments(marketId: string, options?: { limit?: number; offset?: number }): Promise<Comment[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', String(options.limit));
        if (options?.offset) params.set('offset', String(options.offset));

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<Comment[]>(`/api/social/markets/${marketId}/comments${query}`);
    },

    // Delete comment
    async deleteComment(commentId: string): Promise<{ success: boolean }> {
        return fetchApi<{ success: boolean }>(`/api/social/comments/${commentId}`, {
            method: 'DELETE',
        });
    },
};

// ==================== Health Check ====================

export const healthApi = {
    async check(): Promise<{ status: string; timestamp: string }> {
        return fetchApi<{ status: string; timestamp: string }>('/api/health');
    },
};

// ==================== AI API ====================

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    text?: string; // For backward compatibility
}

export interface ChatResponse {
    message: string;
    model: string;
    timestamp: string;
}

export interface MarketAnalysis {
    analysis: string;
    marketId?: string;
    timestamp: string;
}

export const aiApi = {
    // Chat with AI assistant
    async chat(messages: ChatMessage[], userId?: string): Promise<ChatResponse> {
        return fetchApi<ChatResponse>('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ messages, userId }),
        });
    },

    // Analyze a prediction market
    async analyzeMarket(data: {
        marketId?: string;
        question: string;
        category?: string;
        currentOdds?: { yesPercent: number; noPercent: number };
    }): Promise<MarketAnalysis> {
        return fetchApi<MarketAnalysis>('/api/ai/analyze-market', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get available AI models
    async getModels(): Promise<{ models: Array<{ id: string; name: string; description: string }> }> {
        return fetchApi<{ models: Array<{ id: string; name: string; description: string }> }>('/api/ai/models');
    },
};

// ==================== Operations API ====================

export interface TreasuryData {
    totalRevenue: number;
    monthlyRevenue: number;
    operationalFund: number;
    totalTrades: number;
    monthlyTrades: number;
    platformFeePercent: number;
    allocations: {
        [key: string]: {
            allocated: number;
            used: number;
            percentage: number;
        };
    };
    trends: {
        revenueChange: string;
        monthlyRevenueChange: string;
        fundChange: string;
        tradesChange: string;
    };
}

export interface TreasuryTransaction {
    id: string;
    transactionType: 'trade_fee' | 'allocation' | 'withdrawal' | 'deposit';
    amount: number;
    currency: string;
    description?: string;
    category?: 'development' | 'operations' | 'marketing' | 'reserves' | 'partnerships';
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface OperationsStats {
    metrics: {
        totalRevenue: number;
        monthlyRevenue: number;
        operationalFund: number;
        totalTrades: number;
        monthlyTrades: number;
    };
    transactionStats: Array<{
        type: string;
        count: number;
        totalAmount: number;
    }>;
    allocations: Array<{
        category: string;
        allocated: number;
        used: number;
        percentage: number;
    }>;
}

export const operationsApi = {
    // Get treasury overview
    async getTreasury(): Promise<TreasuryData> {
        return fetchApi<TreasuryData>('/api/operations/treasury');
    },

    // Get treasury transactions
    async getTransactions(options?: {
        limit?: number;
        offset?: number;
        type?: string;
        category?: string;
    }): Promise<{ transactions: TreasuryTransaction[]; total: number }> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', String(options.limit));
        if (options?.offset) params.set('offset', String(options.offset));
        if (options?.type) params.set('type', options.type);
        if (options?.category) params.set('category', options.category);

        const query = params.toString() ? `?${params}` : '';
        return fetchApi<{ transactions: TreasuryTransaction[]; total: number }>(`/api/operations/transactions${query}`);
    },

    // Record a treasury transaction
    async createTransaction(data: {
        transactionType: string;
        amount: number;
        currency?: string;
        description?: string;
        category?: string;
        status?: string;
        userId?: string;
    }): Promise<{ success: boolean; id: string }> {
        return fetchApi<{ success: boolean; id: string }>('/api/operations/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get operations statistics
    async getStats(): Promise<OperationsStats> {
        return fetchApi<OperationsStats>('/api/operations/stats');
    },

    // Update fund allocations
    async updateAllocations(allocations: Array<{ category: string; percentage: number }>, userId?: string): Promise<{ success: boolean }> {
        return fetchApi<{ success: boolean }>('/api/operations/allocations', {
            method: 'PUT',
            body: JSON.stringify({ allocations, userId }),
        });
    },
};

// Default export with all APIs
const api = {
    markets: marketsApi,
    users: usersApi,
    bets: betsApi,
    social: socialApi,
    health: healthApi,
    ai: aiApi,
    operations: operationsApi,
};

export default api;
