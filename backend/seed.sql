-- SocialBet Seed Data

-- Users
INSERT OR REPLACE INTO users (id, name, handle, avatar, is_verified, sos_token_balance) VALUES
  ('u1', 'Vitalik Fan', '@vitalik_eth', 'https://picsum.photos/id/64/200/200', 1, 0),
  ('u2', 'SportsCenter AI', '@sports_bot', 'https://picsum.photos/id/177/200/200', 0, 0),
  ('u3', 'PopBase', '@popbase_official', 'https://picsum.photos/id/823/200/200', 1, 0),
  ('u4', 'Tech Insider', '@tech_insider', 'https://picsum.photos/id/4/200/200', 0, 0),
  ('u5', 'Crypto Whale', '@whale_alert', 'https://picsum.photos/id/237/200/200', 0, 0),
  ('u6', 'F1 Stats', '@f1_predictions', 'https://picsum.photos/id/238/200/200', 0, 0),
  ('me', 'Degen Trader', '@degen_eth', 'https://picsum.photos/id/100/100/100', 1, 50000),
  ('u8', 'Election Watch', '@polymarket_mirror', 'https://picsum.photos/id/240/200/200', 0, 0);

-- Markets
INSERT OR REPLACE INTO markets (id, creator_id, question, category, end_date, pool_size, volume, likes_count, comments_count, is_hot, yes_percent, no_percent, yes_price, no_price) VALUES
  ('1', 'u1', 'Will Bitcoin hit $100,000 before Friday midnight?', 'Crypto', '2024-12-31T23:59:59Z', 124050, 450000, 1205, 342, 1, 65, 35, 0.65, 0.35),
  ('2', 'u2', 'Lakers vs. Warriors: Will LeBron score over 25.5 points tonight?', 'Sports', '2024-12-25T04:00:00Z', 56000, 12000, 89, 45, 0, 48, 52, 0.48, 0.52),
  ('3', 'u3', 'Will Taylor Swift announce "Reputation (TV)" this month?', 'Pop Culture', '2025-01-31T23:59:59Z', 890000, 2100000, 5600, 1200, 0, 20, 80, 0.20, 0.80),
  ('4', 'u4', 'Will OpenAI release GPT-5 before the end of 2025?', 'Tech', '2025-12-31T23:59:59Z', 250000, 67000, 450, 112, 0, 15, 85, 0.15, 0.85),
  ('5', 'u5', 'Will Ethereum gas fees drop below 10 gwei this weekend?', 'Crypto', '2025-01-05T23:59:59Z', 15000, 3000, 210, 56, 0, 90, 10, 0.90, 0.10),
  ('6', 'u6', 'Will Verstappen win the Las Vegas GP?', 'Sports', '2025-11-19T23:59:59Z', 98000, 150000, 670, 120, 0, 75, 25, 0.75, 0.25),
  ('7', 'me', 'Will Solana flip BNB in market cap by end of Q1 2025?', 'Crypto', '2025-03-31T23:59:59Z', 45000, 12000, 340, 89, 0, 30, 70, 0.30, 0.70),
  ('8', 'u8', 'Will the US Debt Ceiling be raised again in Jan 2025?', 'Politics', '2025-01-31T23:59:59Z', 2100000, 5000000, 890, 2300, 1, 95, 5, 0.95, 0.05);

-- Comments
INSERT INTO comments (id, market_id, user_id, content) VALUES
  ('c1', '1', 'u5', 'BTC to the moon! 🚀'),
  ('c2', '1', 'u4', 'I think it will take longer than Friday.'),
  ('c3', '1', 'me', 'Already loaded up on YES positions!'),
  ('c4', '3', 'u1', 'Swifties are hoping! 🎵'),
  ('c5', '8', 'u4', 'This is basically guaranteed at this point.');

-- Likes
INSERT OR IGNORE INTO likes (market_id, user_id) VALUES
  ('1', 'me'),
  ('1', 'u5'),
  ('3', 'me'),
  ('8', 'me');
