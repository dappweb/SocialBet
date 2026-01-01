# SoulCast Backend API

Express + SQLite backend for the SoulCast KOL intent prediction market platform.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:8787`.

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Markets
- `GET /api/markets` - List all markets (supports `?category=`, `?limit=`, `?sort=`)
- `GET /api/markets/:id` - Get single market
- `POST /api/markets` - Create market
- `PUT /api/markets/:id` - Update market
- `DELETE /api/markets/:id` - Delete market

### Users
- `GET /api/users` - List users (leaderboard)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/stats` - Get user statistics

### Predictions (Bets)
- `POST /api/bets` - Place a prediction
- `GET /api/bets/user/:userId` - Get user's predictions
- `GET /api/bets/market/:marketId` - Get market's predictions
- `GET /api/bets/:id` - Get single prediction

### Social
- `POST /api/social/markets/:id/like` - Like market
- `DELETE /api/social/markets/:id/like` - Unlike market
- `GET /api/social/markets/:id/likes` - Check like status
- `POST /api/social/markets/:id/comments` - Add comment
- `GET /api/social/markets/:id/comments` - Get comments
- `DELETE /api/social/comments/:id` - Delete comment

## Database

SQLite database stored at `data/soulcast.db`.

### Tables
- `users` - User accounts
- `markets` - KOL intent prediction markets
- `bets` - User predictions
- `likes` - Market likes
- `comments` - Market comments
