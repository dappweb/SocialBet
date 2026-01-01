# SocialBet - Technical Specifications

## 1. Architecture Overview

### 1.1 Application Type
Single Page Application (SPA) built with React and TypeScript, using Vite as the build tool.

### 1.2 Architecture Pattern
- **Component-Based Architecture:** Modular React components
- **Unidirectional Data Flow:** State flows down, events flow up
- **Client-Side Rendering:** All rendering happens in the browser
- **Edge Computing:** Cloudflare Workers for serverless API endpoints
- **Edge Database:** Cloudflare D1 for distributed SQLite database
- **Hybrid Authentication:** Web3 wallet + OAuth social login
- **Design System:** Apple-inspired simple and elegant UI with bright yellow as primary color

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 6.2.0 | Build Tool & Dev Server |
| Tailwind CSS | 4.1.17 | Styling Framework |
| PostCSS | 8.5.6 | CSS Processing |
| Autoprefixer | 10.4.22 | CSS Vendor Prefixing |

### 2.2 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @google/genai | latest | Google Gemini AI Integration (fallback) |
| lucide-react | 0.460.0 | Icon Library |
| clsx | 2.1.1 | Conditional Class Names |
| tailwind-merge | 2.5.4 | Tailwind Class Merging |
| react-dom | 18.3.1 | React DOM Rendering |
| @web3modal/wagmi | latest | WalletConnect integration (EVM chains) |
| wagmi | latest | React Hooks for Ethereum/EVM chains |
| viem | latest | TypeScript Ethereum/EVM library |
| @solana/web3.js | latest | Solana blockchain interaction |
| @solana/wallet-adapter-react | latest | Solana wallet integration |
| @solana/wallet-adapter-wallets | latest | Solana wallet providers |
| @tanstack/react-query | latest | Server state management |
| @auth/core | latest | Authentication core library |
| next-auth | latest | Authentication framework (or custom OAuth) |
| @stripe/stripe-js | latest | Stripe payment integration |
| socket.io-client | latest | WebSocket client for real-time messaging |
| simple-peer | latest | WebRTC for video conferencing |
| agora-rtc-sdk-ng | latest | Agora video conferencing (optional) |
| react-native | latest | Mobile app framework (iOS/Android) |
| electron | latest | Desktop app framework (Windows/macOS/Linux) |
| tauri | latest | Alternative desktop framework (optional) |

### 2.3 Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-react | 5.0.0 | Vite React Plugin |
| @tailwindcss/postcss | 4.1.17 | Tailwind PostCSS Integration |
| @types/node | 22.14.0 | Node.js Type Definitions |

---

## 3. Project Structure

```
SocialBet/
├── components/          # React components
│   ├── BetModal.tsx
│   ├── ChatInterface.tsx
│   ├── CreateMarketModal.tsx
│   ├── Explore.tsx
│   ├── Feed.tsx
│   ├── Leaderboard.tsx
│   ├── Notifications.tsx
│   ├── PredictionCard.tsx
│   ├── Profile.tsx
│   ├── RightPanel.tsx
│   ├── Sidebar.tsx
│   ├── AIPredictionBadge.tsx    # AI prediction indicators
│   ├── AIMarketGenerator.tsx   # AI market generation UI
│   ├── AIPredictionPanel.tsx    # AI prediction insights
│   ├── MessageList.tsx          # Instant messaging UI
│   ├── MessageComposer.tsx      # Message input component
│   ├── VideoConference.tsx      # Video conferencing UI
│   ├── AirdropModal.tsx         # Airdrop claim interface
│   ├── RedEnvelope.tsx          # Red envelope component
│   ├── DAOGovernance.tsx        # DAO governance dashboard (PC)
│   ├── ProposalList.tsx         # Governance proposals list
│   ├── ProposalDetail.tsx       # Proposal details and voting
│   └── TokenContribution.tsx    # DAO token contribution interface
├── hooks/               # Custom React hooks
│   ├── useWallet.ts
│   ├── useAIPredictions.ts
│   ├── useSwipeGesture.ts
│   ├── useMessaging.ts
│   ├── useVideoConference.ts
│   ├── useSOSToken.ts
│   └── useDAOGovernance.ts
├── services/            # API services
│   ├── cloudflare-ai.ts
│   ├── market-generator.ts
│   ├── prediction-engine.ts
│   ├── messaging-service.ts
│   ├── webrtc-service.ts
│   └── token-service.ts
├── workers/             # Cloudflare Workers
│   ├── ai-market-generator.ts
│   ├── ai-prediction.ts
│   ├── news-monitor.ts
│   ├── messaging-worker.ts
│   └── airdrop-distributor.ts
├── mobile/              # Mobile app (React Native)
│   ├── ios/
│   ├── android/
│   └── shared/
├── desktop/              # Desktop app (Electron/Tauri)
│   ├── main/
│   ├── preload/
│   └── renderer/
├── contracts/            # Smart contracts
│   ├── ethereum/
│   │   ├── SOS.sol
│   │   ├── Airdrop.sol
│   │   ├── RedEnvelope.sol
│   │   └── DAOGovernance.sol
│   ├── solana/
│   │   ├── sos-token.ts
│   │   ├── airdrop-program.ts
│   │   └── dao-governance.ts
│   └── bsc/
│       ├── SOS.sol
│       ├── Airdrop.sol
│       └── DAOGovernance.sol
├── docs/               # Documentation
│   ├── requirements/
│   ├── technical/
│   └── user-stories/
├── public/             # Static assets
│   └── _redirects
├── App.tsx             # Main application component
├── constants.ts        # Application constants
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── index.css           # Global styles
├── types.ts            # TypeScript type definitions
├── utils.ts            # Utility functions
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── postcss.config.js   # PostCSS configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

---

## 4. Component Architecture

### 4.1 Component Hierarchy

```
App
├── Sidebar (Navigation) [Desktop]
├── TopBar (Search, Notifications) [Desktop]
├── Main Content Area
│   ├── Feed
│   │   ├── PredictionCard (multiple)
│   │   │   └── AIPredictionBadge
│   │   └── AIPredictionPanel
│   ├── Explore
│   ├── Leaderboard
│   ├── Notifications
│   ├── Profile
│   ├── ChatInterface
│   └── AIMarketGenerator
├── RightPanel [Desktop]
│   ├── Trending Markets
│   ├── AI Predictions
│   └── Recommendations
├── BottomNav (Navigation) [Mobile]
├── FloatingActionButton (Create) [Mobile]
└── Modals
    ├── CreateMarketModal
    ├── BetModal
    └── AIPredictionModal
```

### 4.2 Component Responsibilities

#### App.tsx
- Main application container
- View state management
- Modal state management
- Market data state management
- Navigation routing logic

#### Sidebar.tsx
- Navigation menu
- View switching
- Create market button trigger

#### Feed.tsx
- Market feed display
- Market list rendering
- Feed filtering/sorting

#### PredictionCard.tsx
- Individual market display
- Market statistics
- Betting interface trigger
- Social interactions (like, comment)

#### BetModal.tsx
- Bet placement interface
- Price display
- Bet confirmation

#### CreateMarketModal.tsx
- Market creation form
- Category selection
- Date/time picker
- Image upload

#### ChatInterface.tsx
- AI assistant chat UI
- Message display
- User input handling
- Gemini API integration

#### RightPanel.tsx
- Trending markets
- Recommendations
- Additional market info

---

## 5. Type System

### 5.1 Core Types (types.ts)

```typescript
// Market Categories
type MarketCategory = 'Crypto' | 'Sports' | 'Pop Culture' | 'Politics' | 'Tech';

// User Interface
interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
}

// Prediction Market
interface PredictionMarket {
  id: string;
  creator: User;
  question: string;
  category: MarketCategory;
  endDate: string;
  poolSize: number;
  volume: number;
  likes: number;
  comments: number;
  image?: string;
  outcomeStats: {
    yesPercent: number;
    noPercent: number;
    yesPrice: number;
    noPrice: number;
  };
  isHot?: boolean;
}

// Bet Types
type BetType = 'YES' | 'NO';

interface PendingBet {
  marketId: string;
  type: BetType;
  price: number;
}
```

### 5.2 View Types

```typescript
type View = 'home' | 'explore' | 'leaderboard' | 'notifications' | 'profile' | 'assistant';
```

---

## 6. Configuration Files

### 6.1 vite.config.ts

```typescript
- Server Configuration:
  - Port: 3000
  - Host: 0.0.0.0 (all interfaces)
  
- Plugins:
  - @vitejs/plugin-react
  
- Environment Variables:
  - GEMINI_API_KEY (from .env.local, optional)
  - VITE_CLOUDFLARE_API_URL (from .env.local)
  - VITE_WALLET_CONNECT_PROJECT_ID (from .env.local)
  - VITE_STRIPE_PUBLIC_KEY (from .env.local)
  - VITE_OAUTH_*_CLIENT_ID (from .env.local)
  
- Path Aliases:
  - @ -> project root
```

### 6.2 tsconfig.json
- TypeScript compiler options
- Module resolution settings
- JSX configuration

### 6.3 postcss.config.js
- Tailwind CSS processing
- Autoprefixer configuration

---

## 7. State Management

### 7.1 Current Approach
- **Local Component State:** Using React `useState` hook
- **Props Drilling:** Data passed through component props
- **Mock Data:** Static data in `constants.ts`

### 7.2 State Structure

```typescript
// App-level state
{
  currentView: View;
  isCreateModalOpen: boolean;
  markets: PredictionMarket[];
  user: User | null;
  wallet: WalletState | null;
  subscriptions: Subscription[];
  premiumContent: PremiumContent[];
}
```

### 7.3 State Management Libraries
- **React Query (@tanstack/react-query):** Server state management
  - API data fetching
  - Caching and synchronization
  - Background updates
- **Context API:** Global client state
  - User authentication state
  - Wallet connection state
  - Theme/preferences
- **Zustand (recommended):** Lightweight state management
  - UI state
  - Local preferences
  - Component communication

---

## 8. Styling Architecture

### 8.1 Tailwind CSS Configuration
- **Version:** 4.1.17
- **PostCSS Integration:** @tailwindcss/postcss
- **Utility-First Approach:** All styling via utility classes

### 8.2 Design System (Apple-Inspired with Bright Yellow)

#### Design Philosophy
- **Simplicity:** Clean, uncluttered interface with minimal visual noise
- **Elegance:** Refined aesthetics with attention to detail
- **Clarity:** Clear visual hierarchy and information architecture
- **Consistency:** Unified design language across all platforms
- **Purposeful:** Every element serves a clear function

#### Colors
- **Primary (Bright Yellow):**
  - Main: `#FFD700` (Gold) - Primary actions, CTAs
  - Light: `#FFEB3B` (Bright Yellow) - Hover states, highlights
  - Dark: `#FFC107` (Amber) - Active states, pressed buttons
  - Tint: `#FFF9E6` (Light Yellow) - Backgrounds, subtle accents
- **Background:**
  - Primary: `#FFFFFF` (White)
  - Secondary: `#F5F5F7` (Light Gray)
  - Tertiary: `#FAFAFA` (Off-White)
- **Text:**
  - Primary: `#1D1D1F` (Near Black)
  - Secondary: `#86868B` (Medium Gray)
  - Tertiary: `#C7C7CC` (Light Gray)
- **Borders & Dividers:**
  - Border: `#E5E5EA` (Light Gray)
  - Divider: `#F2F2F7` (Very Light Gray)
- **Status Colors:**
  - Success: `#34C759` (Green)
  - Error: `#FF3B30` (Red)
  - Warning: `#FF9500` (Orange)
  - Info: `#007AFF` (Blue)
- **Special Elements:**
  - Premium: Bright yellow with subtle glow
  - AI: Light yellow background (`#FFF9E6`) with yellow border
  - Notifications: Bright yellow badge

#### Spacing
- **Base Unit:** 4px grid system
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Generous Padding:** Comfortable spacing for readability
- **Touch Targets:** Minimum 44px for mobile interactions
- **Desktop Spacing:** Slightly more compact but still comfortable

#### Typography
- **Font Family:** 
  - Primary: San Francisco (SF Pro) on Apple devices
  - Fallback: System fonts (Segoe UI, Roboto, -apple-system)
  - Monospace: SF Mono for code/technical content
- **Font Sizes:**
  - Large Title: 34px (bold)
  - Title 1: 28px (bold)
  - Title 2: 22px (bold)
  - Title 3: 20px (semibold)
  - Headline: 17px (semibold)
  - Body: 17px (regular)
  - Callout: 16px (regular)
  - Subhead: 15px (regular)
  - Footnote: 13px (regular)
  - Caption: 12px (regular)
- **Line Height:** 1.4-1.6 for optimal readability
- **Letter Spacing:** -0.01em to -0.02em for headings
- **Font Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

#### Shadows & Elevation
- **Level 0:** No shadow (flat)
- **Level 1:** `0 1px 3px rgba(0,0,0,0.1)` - Cards
- **Level 2:** `0 2px 6px rgba(0,0,0,0.1)` - Elevated cards
- **Level 3:** `0 4px 12px rgba(0,0,0,0.15)` - Modals
- **Level 4:** `0 8px 24px rgba(0,0,0,0.2)` - Dropdowns, popovers
- **Yellow Glow:** `0 0 20px rgba(255, 215, 0, 0.3)` - Yellow accent elements

#### Animations & Transitions
- **Duration:** 200-300ms for most interactions
- **Easing:** 
  - Standard: `cubic-bezier(0.4, 0.0, 0.2, 1)` (ease-out)
  - Decelerate: `cubic-bezier(0.0, 0.0, 0.2, 1)`
  - Accelerate: `cubic-bezier(0.4, 0.0, 1, 1)`
- **Transitions:**
  - Fade: Opacity 0 → 1
  - Slide: Transform translateY/translateX
  - Scale: Transform scale (0.95 → 1.0)
  - Spring: Natural, bouncy animations for special interactions
- **Micro-interactions:**
  - Button press: Subtle scale (0.97)
  - Hover: Light yellow tint background
  - Loading: Smooth spinner or skeleton screens
  - Pull-to-refresh: Elastic bounce effect

#### Layout Patterns (Apple-Style)
- **Card-based design:** 
  - White cards with subtle shadows
  - Rounded corners (12-16px radius)
  - Generous padding (16-24px)
  - Clear separation between cards
- **Navigation:**
  - Clean sidebar with subtle background
  - Translucent top bar (blur effect)
  - Bottom navigation with rounded corners (mobile)
- **Modals & Sheets:**
  - Bottom sheet on mobile (rounded top corners)
  - Centered modal on desktop
  - Backdrop blur effect
- **Buttons:**
  - Primary: Bright yellow background, dark text
  - Secondary: Light background, yellow border
  - Tertiary: Text-only with yellow accent
  - Rounded corners (8-12px)
  - Clear hierarchy and sizing
- **Input Fields:**
  - Clean borders, rounded corners
  - Focus state: Yellow border/outline
  - Placeholder text in light gray
  - Clear visual feedback
- **Infinite scroll:** Seamless, smooth loading
- **Image optimization:** Lazy loading, progressive enhancement

### 8.3 Responsive Breakpoints
- **Mobile:** `< 640px` (sm) - Full-width, bottom nav, swipe gestures
- **Tablet:** `640px - 1024px` (sm to lg) - Hybrid layout
- **Desktop:** `> 1024px` (lg+) - Sidebar + main + right panel
- **Large Desktop:** `> 1440px` (xl) - Optimized for wide screens

### 8.4 Cross-Platform Considerations
- **PWA Support:** Installable on mobile devices
- **Touch Gestures:** Swipe, pinch, pull-to-refresh
- **Keyboard Navigation:** Full keyboard support on desktop
- **Safe Areas:** Respects device notches and safe areas (mobile)
- **Viewport Meta:** Proper viewport configuration
- **Orientation Support:** Landscape and portrait modes

---

## 9. API Integration

### 9.1 Cloudflare AI Workers
- **Service:** Cloudflare AI Workers
- **Configuration:** Via Cloudflare Workers bindings
- **Usage:** Primary AI assistant, market analysis, content recommendations, automatic predictions
- **Location:** Cloudflare Workers (serverless functions)
- **Features:**
  - Natural language processing
  - Market trend analysis
  - Content generation
  - User behavior analysis
  - **Automatic market generation:**
    - News monitoring and analysis
    - Trend detection from social media
    - Event-based market creation
    - Question formulation
    - Category classification
  - **Automatic predictions:**
    - Real-time market probability calculations
    - Betting recommendations (YES/NO)
    - Confidence scoring
    - Risk assessment
    - Continuous updates
  - **Data source integration:**
    - News APIs (NewsAPI, Google News RSS)
    - Social media APIs (Twitter/X, Reddit)
    - Financial data (crypto prices, sports odds)
    - Event calendars

### 9.2 Cloudflare D1 Database
- **Service:** Cloudflare D1 (SQLite-based edge database)
- **Configuration:** Via Cloudflare Workers bindings
- **Usage:** Data persistence for users, markets, bets, subscriptions
- **Schema:** SQL tables for all data models
- **Features:**
  - Edge-distributed database
  - Low-latency reads globally
  - ACID transactions
  - SQL queries via Workers

### 9.3 Cloudflare R2 Storage
- **Service:** Cloudflare R2 (S3-compatible object storage)
- **Configuration:** Via Cloudflare Workers bindings
- **Usage:** Media storage (images, premium content)
- **Features:**
  - No egress fees
  - CDN integration
  - Large file support

### 9.4 Cloudflare KV
- **Service:** Cloudflare KV (key-value store)
- **Configuration:** Via Cloudflare Workers bindings
- **Usage:** Caching, session management, real-time data
- **Features:**
  - Ultra-low latency
  - Global distribution
  - Eventual consistency

### 9.5 Web3 Wallet Integration

#### 9.5.1 Ethereum & EVM-Compatible Chains (ETH, BSC, Polygon, Arbitrum, Base)
- **Libraries:** 
  - `wagmi` - React hooks for Ethereum/EVM chains
  - `viem` - TypeScript Ethereum/EVM library
  - `@web3modal/wagmi` - WalletConnect UI for EVM chains
- **Supported Wallets:**
  - MetaMask (primary for EVM)
  - WalletConnect (mobile wallets)
  - Coinbase Wallet
  - Trust Wallet
  - Rainbow Wallet
- **Supported Chains:**
  - **Ethereum (ETH):** Mainnet, Goerli, Sepolia testnets
  - **Binance Smart Chain (BSC):** Mainnet, Testnet
  - Polygon, Arbitrum, Base (additional support)
- **Features:**
  - Wallet connection/disconnection
  - Chain switching
  - Signature-based authentication
  - Transaction signing
  - Gas fee estimation
  - Network detection

#### 9.5.2 Solana Blockchain
- **Libraries:**
  - `@solana/web3.js` - Solana blockchain interaction
  - `@solana/wallet-adapter-react` - React hooks for Solana
  - `@solana/wallet-adapter-wallets` - Solana wallet providers
- **Supported Wallets:**
  - Phantom (primary for Solana)
  - Solflare
  - Backpack
  - Glow
  - WalletConnect (Solana)
- **Supported Networks:**
  - Solana Mainnet
  - Solana Devnet
  - Solana Testnet
- **Features:**
  - Wallet connection/disconnection
  - Network switching
  - Transaction signing
  - Signature-based authentication
  - Transaction fee estimation (SOL)

#### 9.5.3 Multi-Chain Architecture
- **Unified Wallet Interface:** Single UI for all supported chains
- **Chain Selection:** Users can choose their preferred blockchain
- **Cross-Chain Support:** Support for transactions on ETH, SOL, and BSC
- **Token Support:**
  - Ethereum: ETH, ERC-20 tokens
  - Solana: SOL, SPL tokens
  - BSC: BNB, BEP-20 tokens
- **Location:** 
  - `components/WalletConnect.tsx` (EVM chains)
  - `components/SolanaWalletConnect.tsx` (Solana)
  - `hooks/useWallet.ts` (unified hook)
  - `hooks/useSolanaWallet.ts` (Solana-specific)

### 9.6 Social Media Authentication
- **Providers:**
  - Google OAuth 2.0
  - Twitter/X OAuth 1.0a/2.0
  - Discord OAuth 2.0
  - GitHub OAuth 2.0
- **Implementation:** Custom OAuth flow or NextAuth.js
- **Features:**
  - OAuth redirect flow
  - Account linking
  - Profile data import
  - Session management
- **Location:** `components/AuthModal.tsx`, `utils/auth.ts`

### 9.7 Payment Processing
- **Crypto Payments:**
  - **Ethereum (ETH):**
    - Direct ETH transfers
    - ERC-20 token payments
    - Smart contract integration (optional)
  - **Solana (SOL):**
    - Direct SOL transfers
    - SPL token payments
    - Program-based transactions
  - **Binance Smart Chain (BSC):**
    - Direct BNB transfers
    - BEP-20 token payments
    - EVM-compatible smart contracts
  - Multi-chain payment selection
  - Cross-chain payment support (future)
- **Fiat Payments:**
  - Stripe integration (`@stripe/stripe-js`)
  - PayPal integration (optional)
  - Subscription billing
- **Location:** `components/PaymentModal.tsx`, `utils/payments.ts`, `utils/solanaPayments.ts`

### 9.8 Google Gemini API (Fallback)
- **Package:** @google/genai
- **Configuration:** Via `GEMINI_API_KEY` environment variable
- **Usage:** Fallback AI assistant when Cloudflare AI is unavailable
- **Location:** `ChatInterface.tsx`

### 9.9 API Key Management
- Stored in `.env.local` (not committed to version control)
- Cloudflare credentials via Workers secrets
- Injected via Vite's `define` configuration for client-side
- Accessible as `process.env.*` variables

---

## 10. Build & Deployment

### 10.1 Development
```bash
npm run dev
```
- Starts Vite dev server on port 3000
- Hot Module Replacement (HMR) enabled
- Fast refresh for React components

### 10.2 Production Build
```bash
npm run build
```
- Creates optimized production bundle
- Outputs to `dist/` directory
- Code splitting and minification

### 10.3 Preview
```bash
npm run preview
```
- Preview production build locally

### 10.4 Deployment Considerations
- **Frontend:** Static site hosting (Cloudflare Pages, Vercel, Netlify)
- **Backend:** Cloudflare Workers for API endpoints
- **Database:** Cloudflare D1 (automatically deployed with Workers)
- **Storage:** Cloudflare R2 for media files
- **Environment Variables:** 
  - Client-side: Via Vite build-time injection
  - Server-side: Via Cloudflare Workers secrets
- **Redirect rules:** See `public/_redirects`
- **CDN:** Cloudflare global network for edge distribution

---

## 11. Performance Optimizations

### 11.1 Current Optimizations
- Vite's fast build and HMR
- Code splitting via dynamic imports (potential)
- React component memoization (potential)

### 11.2 Recommended Optimizations
- Lazy loading for routes/views
- Image optimization and lazy loading
- Virtual scrolling for long lists
- Memoization of expensive computations
- Bundle size analysis and optimization

---

## 12. Testing Strategy

### 12.1 Current State
- No testing framework configured

### 12.2 Recommended Testing
- **Unit Tests:** Jest + React Testing Library
- **Component Tests:** Component rendering and interactions
- **E2E Tests:** Playwright or Cypress
- **Type Checking:** TypeScript compiler

---

## 13. Security Considerations

### 13.1 Current Measures
- Environment variables for sensitive data
- TypeScript for type safety
- Input validation (to be implemented)

### 13.2 Recommended Measures
- Input sanitization
- XSS protection
- CSRF protection (if backend added)
- Rate limiting (if backend added)
- Content Security Policy (CSP)

---

## 14. Browser Support

### 14.1 Target Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 14.2 Polyfills
- Modern JavaScript features (handled by Vite)
- CSS features (handled by Autoprefixer)

---

## 15. Development Workflow

### 15.1 Setup
1. Install Node.js
2. Run `npm install`
3. Create `.env.local` with required environment variables:
   ```
   GEMINI_API_KEY=your_key (optional, fallback)
   VITE_CLOUDFLARE_API_URL=your_api_url
   VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
   VITE_STRIPE_PUBLIC_KEY=your_stripe_key
   VITE_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_OAUTH_TWITTER_CLIENT_ID=your_twitter_client_id
   VITE_OAUTH_DISCORD_CLIENT_ID=your_discord_client_id
   VITE_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
   ```
4. Set up Cloudflare Workers:
   - Install Wrangler CLI: `npm install -g wrangler`
   - Authenticate: `wrangler login`
   - Create D1 database: `wrangler d1 create socialbet-db`
   - Deploy Workers: `wrangler deploy`
5. Run `npm run dev`

### 15.2 Code Style
- TypeScript strict mode
- Functional components with hooks
- Component-based file structure
- Utility functions in separate files

---

## 16. Cloudflare Infrastructure

### 16.1 Cloudflare Workers (Cloud Computing Platform)
- **Purpose:** Serverless API endpoints and edge computing
- **Runtime:** V8 isolates at the edge
- **Features:**
  - Low latency globally (300+ data centers)
  - Automatic scaling (handles traffic spikes)
  - Zero cold starts (instant execution)
  - Integrated with D1, R2, KV, AI, Durable Objects
  - **Enhanced capabilities:**
    - Real-time event processing
    - WebSocket management
    - Serverless signaling for conferencing
    - Message routing and queuing
    - Edge-based business logic

### 16.2 Cloudflare D1 Database Schema
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  wallet_address_eth TEXT,  -- Ethereum/EVM wallet address
  wallet_address_sol TEXT,   -- Solana wallet address
  wallet_address_bsc TEXT,   -- BSC wallet address (can be same as ETH)
  primary_chain TEXT DEFAULT 'ethereum',  -- Preferred blockchain
  oauth_provider TEXT,
  oauth_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Markets table
CREATE TABLE markets (
  id TEXT PRIMARY KEY,
  creator_id TEXT,  -- NULL if AI-generated
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  end_date DATETIME NOT NULL,
  pool_size REAL DEFAULT 0,
  volume REAL DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_tier_required INTEGER,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence REAL,
  ai_recommended_position TEXT,  -- 'YES' or 'NO'
  ai_reasoning TEXT,
  ai_data_sources TEXT,  -- JSON array of sources
  ai_last_updated DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- AI Predictions table (for tracking prediction accuracy)
CREATE TABLE ai_predictions (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL,
  prediction_type TEXT NOT NULL,  -- 'YES' or 'NO'
  confidence REAL NOT NULL,
  reasoning TEXT,
  data_sources TEXT,  -- JSON array
  predicted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  actual_outcome TEXT,  -- 'YES', 'NO', or NULL if unresolved
  was_correct BOOLEAN,
  FOREIGN KEY (market_id) REFERENCES markets(id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  tier_level INTEGER NOT NULL,
  price REAL NOT NULL,
  status TEXT DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  auto_renewal BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (subscriber_id) REFERENCES users(id)
);

-- Bets table
CREATE TABLE bets (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  bet_type TEXT NOT NULL,
  price REAL NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  blockchain TEXT NOT NULL,  -- 'ethereum', 'solana', 'bsc', etc.
  chain_id TEXT,  -- Chain ID for EVM chains, network for Solana
  transaction_hash TEXT,  -- Transaction hash/signature
  token_address TEXT,  -- Token contract address (for ERC-20/SPL tokens)
  token_symbol TEXT,  -- Token symbol (ETH, SOL, BNB, USDC, etc.)
  status TEXT DEFAULT 'pending',
  confirmations INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (market_id) REFERENCES markets(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 16.3 Cloudflare R2 Bucket Structure
```
socialbet-media/
├── avatars/
│   └── {user_id}/
│       └── avatar.{ext}
├── market-images/
│   └── {market_id}/
│       └── image.{ext}
└── premium-content/
    └── {creator_id}/
        └── {content_id}/
            └── content.{ext}
```

### 16.4 Cloudflare KV Namespaces
- **sessions:** User session data
- **cache:** Frequently accessed data
- **realtime:** Real-time market updates

### 16.5 Cloudflare Durable Objects
- **Purpose:** Stateful real-time applications
- **Features:**
  - Persistent WebSocket connections
  - Stateful SFU instances for video conferencing
  - Real-time collaboration state
  - Automatic scaling and failover
  - Global state synchronization
- **Use Cases:**
  - Video conferencing rooms
  - Real-time messaging
  - Collaborative features
  - Live market updates

### 16.6 Cloudflare Stream
- **Purpose:** Video processing and streaming
- **Features:**
  - Live video streaming (< 1 second latency)
  - Video recording and storage
  - Automatic transcoding
  - Adaptive bitrate streaming
  - Global CDN delivery
  - 4K video support
- **Use Cases:**
  - Video conferencing recording
  - Screen sharing
  - Live streaming
  - Video content delivery

### 16.7 Cloudflare TURN
- **Purpose:** NAT traversal for WebRTC
- **Features:**
  - Global TURN server network
  - Low-latency NAT traversal
  - Automatic region selection
  - High availability
  - Reliable connection establishment
- **Use Cases:**
  - Video conferencing
  - Peer-to-peer connections
  - Real-time communication

## 17. Authentication Architecture

### 17.1 Web3 Wallet Authentication Flow

#### 17.1.1 Ethereum/EVM Chains (ETH, BSC, Polygon, Arbitrum, Base)
1. User clicks "Connect Wallet"
2. Wallet provider modal appears (Web3Modal)
3. User selects wallet (MetaMask, WalletConnect, etc.) and chain
4. Frontend receives wallet address and chain ID
5. Backend generates nonce challenge
6. User signs message with wallet (EIP-191 standard)
7. Backend verifies signature using wallet address
8. Backend creates/updates user session with chain info
9. JWT token returned to frontend

#### 17.1.2 Solana Authentication Flow
1. User clicks "Connect Solana Wallet"
2. Solana wallet adapter modal appears
3. User selects wallet (Phantom, Solflare, etc.)
4. Frontend receives Solana wallet public key
5. Backend generates nonce challenge
6. User signs message with Solana wallet
7. Backend verifies signature using public key
8. Backend creates/updates user session with Solana address
9. JWT token returned to frontend

### 17.2 OAuth Social Login Flow
1. User clicks social login button
2. Redirect to OAuth provider
3. User authorizes application
4. OAuth provider redirects with code
5. Backend exchanges code for access token
6. Backend fetches user profile
7. Backend creates/updates user account
8. JWT token returned to frontend

### 17.3 Account Linking
- Users can link multiple authentication methods
- Primary authentication method is wallet (if available)
- Social accounts can be linked to wallet address
- Unified user profile across all auth methods

## 18. Payment Architecture

### 18.1 Crypto Payment Flow

#### 18.1.1 Ethereum/EVM Chains (ETH, BSC, Polygon, Arbitrum, Base)
1. User initiates payment (subscription/bet)
2. Frontend calculates amount in native token (ETH, BNB) or ERC-20/BEP-20 tokens
3. User selects chain if multiple EVM chains supported
4. User approves transaction in wallet (MetaMask, etc.)
5. Transaction sent to selected blockchain
6. Backend monitors transaction status via RPC nodes
7. On confirmation (12+ block confirmations for security), update database
8. Grant access/activate subscription
9. Transaction hash stored for verification

#### 18.1.2 Solana Payment Flow
1. User initiates payment (subscription/bet)
2. Frontend calculates amount in SOL or SPL tokens
3. User approves transaction in Solana wallet (Phantom, etc.)
4. Transaction sent to Solana network
5. Backend monitors transaction status via Solana RPC
6. On confirmation (32+ slot confirmations), update database
7. Grant access/activate subscription
8. Transaction signature stored for verification

### 18.2 Multi-Chain Payment Selection
- Users can choose their preferred blockchain for payments
- Supported chains clearly displayed in payment modal
- Gas/fee estimation shown for each chain
- Chain-specific token support:
  - Ethereum: ETH, USDC, USDT, DAI
  - Solana: SOL, USDC (SPL), USDT (SPL)
  - BSC: BNB, USDT, USDC, BUSD

### 18.2 Fiat Payment Flow
1. User initiates payment
2. Frontend creates Stripe payment intent
3. User enters payment details
4. Stripe processes payment
5. Webhook confirms payment
6. Backend updates database
7. Grant access/activate subscription

## 19. AI Automatic Prediction System

### 19.1 Market Generation Pipeline
1. **Data Collection:**
   - News API monitoring (every 15 minutes)
   - Social media trend detection (real-time)
   - Event calendar scanning (daily)
   - Market gap analysis (hourly)

2. **Market Generation:**
   - AI analyzes collected data
   - Identifies prediction opportunities
   - Formulates market questions
   - Assigns categories
   - Estimates end dates
   - Generates initial pricing

3. **Quality Control:**
   - AI confidence scoring
   - Duplicate detection
   - Relevance filtering
   - User approval workflow (optional)

4. **Publication:**
   - Markets added to feed
   - Clearly labeled as "AI Generated"
   - Creator set to "AI Assistant"

### 19.2 Prediction Engine
1. **Market Analysis:**
   - Continuous monitoring of active markets
   - Real-time data ingestion
   - Probability calculations
   - Risk assessment

2. **Prediction Generation:**
   - YES/NO recommendation
   - Confidence level (0-100%)
   - Reasoning explanation
   - Data sources cited
   - Update frequency based on volatility

3. **Prediction Updates:**
   - Scheduled updates (every hour for active markets)
   - Event-triggered updates (breaking news)
   - User-requested updates
   - Historical tracking

4. **Accuracy Tracking:**
   - Store predictions in database
   - Track actual outcomes
   - Calculate accuracy metrics
   - Improve model over time

### 19.3 AI Model Architecture
- **Primary Model:** Cloudflare AI Workers (LLM)
- **Fallback Model:** Google Gemini API
- **Specialized Models:**
  - News analysis model
  - Trend detection model
  - Probability calculation model
  - Question generation model

### 19.4 Data Sources Integration
- **News APIs:**
  - NewsAPI.org
  - Google News RSS
  - Custom news aggregators
- **Social Media:**
  - Twitter/X API
  - Reddit API
  - Trending topics APIs
- **Financial Data:**
  - Crypto price APIs
  - Sports odds APIs
  - Stock market APIs
- **Event Calendars:**
  - Google Calendar API
  - Event discovery APIs

## 20. Cross-Platform Design Implementation

### 20.1 Desktop (PC) Design
- **Layout:** Three-column layout (Sidebar + Main + Right Panel)
- **Navigation:** Persistent sidebar with icons and labels
- **Interactions:** Hover states, keyboard shortcuts, mouse interactions
- **Screen Real Estate:** Optimized for large screens (1920x1080+)
- **Features:**
  - Multi-window support (future)
  - Keyboard navigation
  - Right-click context menus
  - Drag and drop (future)

### 20.2 Mobile Design
- **Layout:** Single-column, full-width feed
- **Navigation:** Bottom navigation bar (fixed)
- **Interactions:** Touch gestures, swipe, pull-to-refresh
- **Screen Optimization:** Optimized for small screens (375px-428px)
- **Features:**
  - Swipe between views
  - Bottom sheet modals
  - Floating action button
  - Safe area support
  - Haptic feedback (where supported)

### 20.3 Responsive Breakpoints
```css
/* Mobile First Approach */
sm: '640px'   /* Small tablets */
md: '768px'   /* Tablets */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Large Desktop */
2xl: '1536px' /* Extra Large */
```

### 20.4 PWA Configuration
- **Manifest:** `manifest.json` for installability
- **Service Worker:** Offline support and caching
- **Icons:** Multiple sizes for different devices
- **Splash Screens:** Custom splash screens
- **App-like Experience:** Full-screen mode, standalone display

## 21. Instant Messaging Architecture (Enhanced with Cloudflare)

### 21.1 Messaging Infrastructure Leveraging Cloudflare Cloud Computing
- **Protocol:** WebSocket for real-time bidirectional communication
- **Backend:** 
  - **Cloudflare Durable Objects** for WebSocket management and state
  - Persistent connections across edge locations
  - Automatic scaling per conversation
  - State synchronization globally
- **Storage:** 
  - **Cloudflare D1** for message history
  - Edge-distributed database for fast access
  - Automatic replication
- **Encryption:** End-to-end encryption (E2EE) using Signal Protocol
- **Media Storage:** 
  - **Cloudflare R2** for images, files, voice messages
  - Global CDN for fast media delivery
  - Cost-effective object storage
- **Caching:** 
  - **Cloudflare KV** for message caching
  - User presence state
  - Quick message retrieval
  - Edge-based caching

### 21.2 Cloudflare-Enhanced Messaging Features
- **Real-time Delivery:**
  - WebSocket connections via Durable Objects
  - < 50ms message delivery latency
  - Automatic reconnection
  - Message queue via Cloudflare Workers
- **Scalability:**
  - Automatic scaling per conversation
  - Handles millions of concurrent connections
  - No infrastructure management
  - Pay-per-use model
- **Performance:**
  - Edge-based message routing
  - Global low-latency delivery
  - Optimized media delivery via CDN
  - Fast message history retrieval

### 21.2 Messaging Features
- **Message Types:**
  - Text messages
  - Images (JPEG, PNG, GIF, WebP)
  - Files (PDF, DOC, etc.)
  - Voice messages (Opus codec)
  - Emoji and stickers
- **Real-time Features:**
  - Typing indicators
  - Read receipts
  - Message reactions
  - Online/offline status
  - Last seen timestamps

### 21.3 Group Chat
- **Group Management:**
  - Create groups (up to 1000 members)
  - Add/remove members
  - Admin roles
  - Group settings
- **Group Features:**
  - Group name and avatar
  - Group description
  - Mute notifications
  - Leave group

## 22. Video Conferencing Architecture (Enhanced with Cloudflare Cloud Computing)

### 22.1 WebRTC Infrastructure Leveraging Cloudflare
- **Protocol:** WebRTC for peer-to-peer connections
- **SFU (Selective Forwarding Unit):** 
  - **Cloudflare Durable Objects** for stateful SFU instances
  - Automatic scaling per conference room
  - Global edge distribution for low latency
  - Persistent state across edge locations
- **TURN Servers:** 
  - **Cloudflare TURN** for reliable NAT traversal
  - Global TURN server network (300+ locations)
  - Automatic region selection for optimal performance
  - High availability with automatic failover
- **Signaling:** 
  - **Cloudflare Workers** for serverless signaling
  - WebSocket connections via Cloudflare Durable Objects
  - Edge-based routing for minimal latency
  - Real-time event processing
- **Recording & Streaming:**
  - **Cloudflare Stream** for video processing
  - Live streaming with < 1 second latency
  - Automatic transcoding and optimization
  - Global CDN for video delivery
  - Adaptive bitrate streaming

### 22.2 Cloudflare-Enhanced Conferencing Features
- **Video Quality:**
  - Adaptive bitrate (Cloudflare Stream optimization)
  - Resolution up to 4K (with Cloudflare processing)
  - Frame rate up to 60fps
  - Automatic quality adjustment based on network
  - Edge-based video processing
- **Audio Quality:**
  - Noise suppression (Cloudflare AI-powered)
  - Echo cancellation (edge processing)
  - Automatic gain control
  - Low-latency audio (< 100ms)
  - Spatial audio support (future)
- **Additional Features:**
  - Screen sharing (Cloudflare Stream)
  - Virtual backgrounds (edge processing)
  - Participant grid/list view
  - Mute/unmute controls
  - Participant limit: 50+ users (scalable to 1000+)
  - Real-time participant management (Durable Objects)
  - Connection quality indicators
  - Automatic reconnection on network issues

### 22.3 Conference Types
- **1-on-1 Calls:** 
  - Direct peer-to-peer with Cloudflare TURN fallback
  - Low-latency signaling via Cloudflare Workers
  - Optional Cloudflare Stream for recording
- **Group Calls:** 
  - SFU-based multi-party using Cloudflare Durable Objects
  - Automatic scaling for large groups
  - Edge-based participant management
- **Scheduled Conferences:** 
  - Calendar integration
  - Pre-configured rooms via Cloudflare D1
  - Automated room creation
- **Market Discussion Rooms:** 
  - Persistent rooms for market analysis
  - Stateful rooms via Cloudflare Durable Objects
  - Real-time collaboration features

### 22.4 Cloudflare Cloud Computing Benefits for Conferencing
- **Scalability:**
  - Automatic scaling for any number of participants
  - No infrastructure management required
  - Pay-per-use model
  - Handles traffic spikes automatically
- **Performance:**
  - Edge computing reduces latency globally
  - 300+ data centers worldwide
  - Automatic region selection
  - Low-latency streaming (< 1 second)
- **Reliability:**
  - High availability with automatic failover
  - DDoS protection built-in
  - Redundant infrastructure
  - 99.99% uptime SLA
- **Cost-Effectiveness:**
  - Serverless model (pay for what you use)
  - No idle server costs
  - Automatic resource optimization
  - Competitive pricing for video processing
- **Security:**
  - End-to-end encryption support
  - Built-in DDoS protection
  - SSL/TLS encryption
  - Compliance certifications (SOC 2, ISO 27001)

## 23. Native Application Architecture

### 23.1 Mobile Applications (iOS/Android)
- **Framework:** React Native
- **Platform Support:**
  - iOS 13.0+ (iPhone and iPad)
  - Android 8.0+ (API level 26+)
- **Features:**
  - Native performance
  - Push notifications (APNs, FCM)
  - Biometric authentication
  - Camera and media access
  - Background sync
  - Offline mode

### 23.2 Desktop Applications
- **Framework:** Electron (primary) or Tauri (alternative)
- **Platform Support:**
  - Windows 10/11 (64-bit)
  - macOS 11+ (Intel and Apple Silicon)
  - Linux (Ubuntu 20.04+, Debian 11+, Fedora 34+)
- **Features:**
  - Native window management
  - System tray integration
  - Auto-updater
  - File system access
  - Native notifications

### 23.3 Application Distribution
- **Mobile:**
  - iOS: App Store
  - Android: Google Play Store
  - Alternative: Direct APK download
- **Desktop:**
  - Windows: MSI installer, portable EXE
  - macOS: DMG with code signing
  - Linux: DEB, RPM, AppImage, Snap

## 24. SOS Token Architecture

### 24.1 Token Specifications
- **Token Name:** SocialBet Token
- **Token Symbol:** SOS
- **Total Supply:** 2,100,000,000 (2.1 billion)
- **Decimals:** 18 (Ethereum/BSC), 9 (Solana)

### 24.2 Multi-Chain Deployment
- **Ethereum:**
  - Standard: ERC-20
  - Contract address: TBD
  - Network: Ethereum Mainnet
- **Solana:**
  - Standard: SPL Token
  - Program: TBD
  - Network: Solana Mainnet
- **Binance Smart Chain:**
  - Standard: BEP-20
  - Contract address: TBD
  - Network: BSC Mainnet

### 24.3 Token Distribution Model
```
Total Supply: 2,100,000,000 SOS

Distribution:
- Community Rewards & Airdrops: 30% (630M)
- User Activity Rewards: 20% (420M)
- Creator Incentives: 15% (315M)
- Staking Rewards: 10% (210M)
- Liquidity Provision: 10% (210M)
- Platform Operations: 5% (105M)
- Team & Advisors (4-year vesting): 5% (105M)
- Marketing & Partnerships: 5% (105M)
```

### 24.4 Token Economics
- **Deflationary Mechanisms:**
  - Transaction fee burn (1-2% of fees)
  - Red envelope unclaimed burn
  - Periodic buyback and burn
- **Staking Rewards:**
  - APY: 5-15% (variable)
  - Lock periods: 30, 90, 180, 365 days
  - Tiered rewards based on lock period
- **Utility Functions:**
  - Betting on markets
  - Subscription payments
  - Premium content access
  - Red envelope creation
  - Fee discounts (up to 50%)
  - Governance voting (DAO-based)

### 24.5 Smart Contracts
- **Token Contracts:**
  - ERC-20 (Ethereum)
  - BEP-20 (BSC)
  - SPL Token (Solana)
- **Airdrop Contracts:**
  - Batch distribution
  - Eligibility verification
  - Claim mechanism
- **Red Envelope Contracts:**
  - Secure random distribution
  - Time-locked release
  - Refund mechanism
- **Staking Contracts:**
  - Lock mechanism
  - Reward calculation
  - Unlock schedule
- **DAO Governance Contracts:**
  - Proposal creation and management
  - Voting mechanism with token weighting
  - Proposal execution automation
  - Multi-signature wallet support
  - Token contribution and allocation

## 25. Airdrop System Architecture

### 25.1 Airdrop Types
- **Registration Airdrop:** New user rewards
- **Activity Airdrop:** Betting, market creation rewards
- **Referral Airdrop:** User referral bonuses
- **Event Airdrop:** Special event rewards
- **Community Airdrop:** General community rewards

### 25.2 Distribution Mechanism
- **Automated Distribution:**
  - Smart contract-based
  - Batch processing
  - Gas-efficient
- **Eligibility Engine:**
  - Rule-based system
  - Real-time checking
  - Historical tracking
- **Claim Process:**
  - User-initiated claim
  - Wallet verification
  - Automatic distribution

## 26. Red Envelope System Architecture

### 26.1 Red Envelope Types
- **Public Red Envelope:** Visible to all users
- **Group Red Envelope:** Specific chat/community
- **Private Red Envelope:** Direct message only
- **Creator Red Envelope:** Creator to subscribers

### 26.2 Distribution Algorithms
- **Random Distribution:**
  - Secure random number generation
  - Weighted random (optional)
  - Minimum/maximum per recipient
- **Equal Distribution:**
  - Split equally among recipients
  - Remainder handling
- **Lucky Draw:**
  - Special bonus for random recipient
  - Multi-tier rewards

### 26.3 Smart Contract Features
- **Security:**
  - Time-locked release
  - Password protection (optional)
  - Refund for unclaimed
- **Transparency:**
  - On-chain verification
  - Public claim history
  - Distribution statistics

## 27. White Paper & Documentation

### 27.1 White Paper Contents
- **Executive Summary**
- **Platform Overview**
- **Technical Architecture**
- **Token Economics (SOS)**
- **Token Distribution Model**
- **Roadmap**
- **Security & Privacy**
- **Team & Advisors**
- **Legal & Compliance**

### 27.2 Documentation Structure
- **User Guides:**
  - Getting started
  - Mobile app installation
  - Desktop app installation
  - Feature tutorials
- **Developer Documentation:**
  - API documentation
  - Smart contract documentation
  - Integration guides
- **Download Links:**
  - Mobile apps (App Store, Play Store)
  - Desktop installers
  - White paper PDF
  - API documentation

## 28. DAO Governance Architecture

### 28.1 DAO Governance System
- **Purpose:** Enable decentralized community governance for platform decisions
- **Platform:** Primarily PC (desktop) platform with full governance features
- **Token:** SOS tokens used for voting weight and proposal creation

### 28.2 Governance Smart Contracts

#### 28.2.1 Ethereum/BSC Governance Contract
```solidity
- Proposal creation with SOS token threshold
- Weighted voting based on SOS holdings
- Proposal execution after approval
- Timelock for proposal execution
- Multi-signature wallet integration
```

#### 28.2.2 Solana Governance Program
```typescript
- Proposal PDA (Program Derived Address)
- Token-weighted voting
- Proposal execution automation
- Multi-signature support
```

### 28.3 Token Contribution Mechanism
- **DAO Treasury:** Multi-signature wallet holding DAO SOS tokens
- **Platform Balance:** SOS tokens allocated to PC platform
- **Contribution Process:**
  1. DAO member creates proposal to add tokens
  2. Proposal specifies amount and allocation target
  3. Community votes on proposal
  4. If approved, tokens transferred from DAO treasury to platform
  5. Transaction recorded on blockchain
  6. Platform balance updated

### 28.4 Allocation Targets
- **Liquidity Pools:** Add SOS tokens to DEX liquidity pools
- **Reward Pools:** Fund community reward distributions
- **Platform Operations:** Fund platform development and maintenance
- **Community Initiatives:** Support community-driven projects
- **Staking Rewards:** Boost staking reward pools

### 28.5 Governance Interface (PC Platform)
- **Dashboard:**
  - DAO treasury balance
  - Platform SOS token balance
  - Active proposals
  - Voting statistics
  - Token contribution history
- **Proposal Creation:**
  - Form to create new proposals
  - Token amount input
  - Allocation target selection
  - Description and rationale
  - Proposal preview
- **Voting Interface:**
  - View proposal details
  - Vote with SOS tokens (Yes/No/Abstain)
  - See current voting results
  - Voting weight calculation
  - Time remaining display
- **Proposal Execution:**
  - Automatic execution after approval
  - Manual execution option
  - Transaction confirmation
  - Balance update notification

### 28.6 Governance Parameters
- **Proposal Threshold:** Minimum SOS tokens required to create proposal
- **Voting Period:** Configurable duration (e.g., 7 days)
- **Quorum:** Minimum voting participation required
- **Execution Delay:** Timelock period before execution (e.g., 24-48 hours)
- **Multi-signature:** Required for large token allocations (e.g., >1M SOS)

### 28.7 Security Features
- **Multi-signature Wallets:** DAO treasury requires multiple signatures
- **Timelock:** Delay between proposal approval and execution
- **Vote Snapshot:** Voting based on token holdings at proposal creation
- **Proposal Limits:** Maximum token amount per proposal
- **Audit Trail:** All transactions recorded on blockchain

### 28.8 Database Schema (DAO)
```sql
-- DAO Proposals table
CREATE TABLE dao_proposals (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  proposal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  token_amount REAL,
  allocation_target TEXT,
  voting_start DATETIME NOT NULL,
  voting_end DATETIME NOT NULL,
  quorum REAL NOT NULL,
  status TEXT DEFAULT 'active',
  yes_votes REAL DEFAULT 0,
  no_votes REAL DEFAULT 0,
  abstain_votes REAL DEFAULT 0,
  execution_tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DAO Votes table
CREATE TABLE dao_votes (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  vote_type TEXT NOT NULL,  -- 'yes', 'no', 'abstain'
  vote_weight REAL NOT NULL,  -- Based on SOS holdings
  transaction_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES dao_proposals(id)
);

-- DAO Token Contributions table
CREATE TABLE dao_contributions (
  id TEXT PRIMARY KEY,
  proposal_id TEXT,
  from_address TEXT NOT NULL,  -- DAO treasury
  to_address TEXT NOT NULL,    -- Platform address
  token_amount REAL NOT NULL,
  allocation_target TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number INTEGER,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES dao_proposals(id)
);
```

## 29. Future Technical Enhancements

- Cross-chain token bridges
- Advanced PWA capabilities
- Service worker for offline support
- Advanced analytics dashboard
- Testing framework setup
- CI/CD pipeline with Cloudflare
- Error tracking (Sentry)
- Analytics integration
- Multi-language support
- Push notifications
- AI model fine-tuning based on user feedback
- Machine learning for personalized recommendations
- Decentralized messaging storage
- Advanced video effects and filters
- Live streaming capabilities

