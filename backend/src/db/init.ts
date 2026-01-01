import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'socialbet.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Remove existing database for fresh init
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Removed existing database');
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('📦 Initializing database...');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    avatar TEXT,
    is_verified INTEGER DEFAULT 0,
    wallet_address_eth TEXT,
    wallet_address_sol TEXT,
    wallet_address_bsc TEXT,
    primary_chain TEXT,
    sos_token_balance REAL DEFAULT 0,
    is_creator INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Markets table
  CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    question TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech')),
    end_date TEXT NOT NULL,
    pool_size REAL DEFAULT 0,
    volume REAL DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    image TEXT,
    is_hot INTEGER DEFAULT 0,
    is_ai_generated INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,
    yes_percent REAL DEFAULT 50,
    no_percent REAL DEFAULT 50,
    yes_price REAL DEFAULT 0.50,
    no_price REAL DEFAULT 0.50,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  -- Bets table
  CREATE TABLE IF NOT EXISTS bets (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    bet_type TEXT NOT NULL CHECK(bet_type IN ('YES', 'NO')),
    amount REAL NOT NULL,
    price_at_bet REAL NOT NULL,
    blockchain TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'won', 'lost')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Likes table
  CREATE TABLE IF NOT EXISTS likes (
    market_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (market_id, user_id),
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Comments table
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    market_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (market_id) REFERENCES markets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
  CREATE INDEX IF NOT EXISTS idx_markets_creator ON markets(creator_id);
  CREATE INDEX IF NOT EXISTS idx_markets_end_date ON markets(end_date);
  CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
  CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
  CREATE INDEX IF NOT EXISTS idx_comments_market ON comments(market_id);
`);

console.log('✅ Database initialized successfully!');
console.log(`📍 Database location: ${dbPath}`);

db.close();
