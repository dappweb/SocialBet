import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '..', 'data', 'socialbet.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('🌱 Seeding database...');

// Seed users
const users = [
    { id: 'u1', name: 'Vitalik Fan', handle: '@vitalik_eth', avatar: 'https://picsum.photos/id/64/200/200', is_verified: 1 },
    { id: 'u2', name: 'SportsCenter AI', handle: '@sports_bot', avatar: 'https://picsum.photos/id/177/200/200', is_verified: 0 },
    { id: 'u3', name: 'PopBase', handle: '@popbase_official', avatar: 'https://picsum.photos/id/823/200/200', is_verified: 1 },
    { id: 'u4', name: 'Tech Insider', handle: '@tech_insider', avatar: 'https://picsum.photos/id/4/200/200', is_verified: 0 },
    { id: 'u5', name: 'Crypto Whale', handle: '@whale_alert', avatar: 'https://picsum.photos/id/237/200/200', is_verified: 0 },
    { id: 'u6', name: 'F1 Stats', handle: '@f1_predictions', avatar: 'https://picsum.photos/id/238/200/200', is_verified: 0 },
    { id: 'me', name: 'Degen Trader', handle: '@degen_eth', avatar: 'https://picsum.photos/id/100/100/100', is_verified: 1, sos_token_balance: 50000 },
    { id: 'u8', name: 'Election Watch', handle: '@polymarket_mirror', avatar: 'https://picsum.photos/id/240/200/200', is_verified: 0 },
];

const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, name, handle, avatar, is_verified, sos_token_balance)
  VALUES (@id, @name, @handle, @avatar, @is_verified, @sos_token_balance)
`);

for (const user of users) {
    insertUser.run({ ...user, sos_token_balance: user.sos_token_balance || 0 });
}
console.log(`✅ Inserted ${users.length} users`);

// Seed markets
const markets = [
    {
        id: '1',
        creator_id: 'u1',
        question: 'Will Bitcoin hit $100,000 before Friday midnight?',
        category: 'Crypto',
        end_date: '2024-12-31T23:59:59Z',
        pool_size: 124050,
        volume: 450000,
        likes_count: 1205,
        comments_count: 342,
        is_hot: 1,
        yes_percent: 65,
        no_percent: 35,
        yes_price: 0.65,
        no_price: 0.35,
    },
    {
        id: '2',
        creator_id: 'u2',
        question: 'Lakers vs. Warriors: Will LeBron score over 25.5 points tonight?',
        category: 'Sports',
        end_date: '2024-12-25T04:00:00Z',
        pool_size: 56000,
        volume: 12000,
        likes_count: 89,
        comments_count: 45,
        is_hot: 0,
        yes_percent: 48,
        no_percent: 52,
        yes_price: 0.48,
        no_price: 0.52,
    },
    {
        id: '3',
        creator_id: 'u3',
        question: 'Will Taylor Swift announce "Reputation (TV)" this month?',
        category: 'Pop Culture',
        end_date: '2025-01-31T23:59:59Z',
        pool_size: 890000,
        volume: 2100000,
        likes_count: 5600,
        comments_count: 1200,
        is_hot: 0,
        yes_percent: 20,
        no_percent: 80,
        yes_price: 0.20,
        no_price: 0.80,
    },
    {
        id: '4',
        creator_id: 'u4',
        question: 'Will OpenAI release GPT-5 before the end of 2025?',
        category: 'Tech',
        end_date: '2025-12-31T23:59:59Z',
        pool_size: 250000,
        volume: 67000,
        likes_count: 450,
        comments_count: 112,
        is_hot: 0,
        yes_percent: 15,
        no_percent: 85,
        yes_price: 0.15,
        no_price: 0.85,
    },
    {
        id: '5',
        creator_id: 'u5',
        question: 'Will Ethereum gas fees drop below 10 gwei this weekend?',
        category: 'Crypto',
        end_date: '2025-01-05T23:59:59Z',
        pool_size: 15000,
        volume: 3000,
        likes_count: 210,
        comments_count: 56,
        is_hot: 0,
        yes_percent: 90,
        no_percent: 10,
        yes_price: 0.90,
        no_price: 0.10,
    },
    {
        id: '6',
        creator_id: 'u6',
        question: 'Will Verstappen win the Las Vegas GP?',
        category: 'Sports',
        end_date: '2025-11-19T23:59:59Z',
        pool_size: 98000,
        volume: 150000,
        likes_count: 670,
        comments_count: 120,
        is_hot: 0,
        yes_percent: 75,
        no_percent: 25,
        yes_price: 0.75,
        no_price: 0.25,
    },
    {
        id: '7',
        creator_id: 'me',
        question: 'Will Solana flip BNB in market cap by end of Q1 2025?',
        category: 'Crypto',
        end_date: '2025-03-31T23:59:59Z',
        pool_size: 45000,
        volume: 12000,
        likes_count: 340,
        comments_count: 89,
        is_hot: 0,
        yes_percent: 30,
        no_percent: 70,
        yes_price: 0.30,
        no_price: 0.70,
    },
    {
        id: '8',
        creator_id: 'u8',
        question: 'Will the US Debt Ceiling be raised again in Jan 2025?',
        category: 'Politics',
        end_date: '2025-01-31T23:59:59Z',
        pool_size: 2100000,
        volume: 5000000,
        likes_count: 890,
        comments_count: 2300,
        is_hot: 1,
        yes_percent: 95,
        no_percent: 5,
        yes_price: 0.95,
        no_price: 0.05,
    },
];

const insertMarket = db.prepare(`
  INSERT OR REPLACE INTO markets (
    id, creator_id, question, category, end_date, pool_size, volume,
    likes_count, comments_count, is_hot, yes_percent, no_percent, yes_price, no_price
  ) VALUES (
    @id, @creator_id, @question, @category, @end_date, @pool_size, @volume,
    @likes_count, @comments_count, @is_hot, @yes_percent, @no_percent, @yes_price, @no_price
  )
`);

for (const market of markets) {
    insertMarket.run(market);
}
console.log(`✅ Inserted ${markets.length} markets`);

// Seed some sample comments
const comments = [
    { id: uuidv4(), market_id: '1', user_id: 'u5', content: 'BTC to the moon! 🚀' },
    { id: uuidv4(), market_id: '1', user_id: 'u4', content: 'I think it will take longer than Friday.' },
    { id: uuidv4(), market_id: '1', user_id: 'me', content: 'Already loaded up on YES positions!' },
    { id: uuidv4(), market_id: '3', user_id: 'u1', content: 'Swifties are hoping! 🎵' },
    { id: uuidv4(), market_id: '8', user_id: 'u4', content: 'This is basically guaranteed at this point.' },
];

const insertComment = db.prepare(`
  INSERT INTO comments (id, market_id, user_id, content)
  VALUES (@id, @market_id, @user_id, @content)
`);

for (const comment of comments) {
    insertComment.run(comment);
}
console.log(`✅ Inserted ${comments.length} comments`);

// Seed some likes
const likes = [
    { market_id: '1', user_id: 'me' },
    { market_id: '1', user_id: 'u5' },
    { market_id: '3', user_id: 'me' },
    { market_id: '8', user_id: 'me' },
];

const insertLike = db.prepare(`
  INSERT OR IGNORE INTO likes (market_id, user_id)
  VALUES (@market_id, @user_id)
`);

for (const like of likes) {
    insertLike.run(like);
}
console.log(`✅ Inserted ${likes.length} likes`);

console.log('🎉 Database seeding complete!');

db.close();
