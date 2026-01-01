import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '..', 'data', 'socialbet.db');

// Initialize database connection
export const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Type definitions for database rows
export interface UserRow {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
    is_verified: number;
    wallet_address_eth: string | null;
    wallet_address_sol: string | null;
    wallet_address_bsc: string | null;
    primary_chain: string | null;
    sos_token_balance: number;
    is_creator: number;
    created_at: string;
}

export interface MarketRow {
    id: string;
    creator_id: string;
    question: string;
    category: string;
    end_date: string;
    pool_size: number;
    volume: number;
    likes_count: number;
    comments_count: number;
    image: string | null;
    is_hot: number;
    is_ai_generated: number;
    is_premium: number;
    yes_percent: number;
    no_percent: number;
    yes_price: number;
    no_price: number;
    created_at: string;
}

export interface BetRow {
    id: string;
    market_id: string;
    user_id: string;
    bet_type: string;
    amount: number;
    price_at_bet: number;
    blockchain: string | null;
    status: string;
    created_at: string;
}

export interface CommentRow {
    id: string;
    market_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export interface LikeRow {
    market_id: string;
    user_id: string;
    created_at: string;
}

export default db;
