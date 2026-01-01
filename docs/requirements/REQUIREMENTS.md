# SoulCast - Requirements Document

## 1. Project Overview

**Project Name:** SoulCast - KOL Intent Prediction Market  
**Version:** 1.0.0  
**Last Updated:** 2025

### 1.1 Description
SoulCast is a KOL (Key Opinion Leader) social intent prediction market platform where predicted intents are incorporated into AI avatars (digital souls) and can be injected into robots. The platform allows users to create, discover, and bet on KOL intentions across multiple categories including Crypto, Sports, Pop Culture, Politics, and Tech. Issued tokens are redeemed and destroyed by SoulCast as issuance fees. The platform features native mobile (iOS/Android) and desktop (Windows/macOS/Linux) applications, instant messaging and video conferencing capabilities, token airdrops, red envelope giveaways, and a native platform token (SOUL) with a comprehensive economic model.

### 1.2 Objectives
- Provide an intuitive social media-like interface for prediction markets
- Enable users to create and participate in prediction markets
- Display real-time market data, odds, and statistics
- Foster community engagement through social features
- Integrate AI assistant for market insights and assistance
- Support creator monetization through subscriptions and premium content
- Enable Web3 wallet authentication and payments
- Provide social media account login options
- Leverage Cloudflare services for AI and database operations
- Deliver native mobile and desktop applications for all major platforms
- Enable real-time communication through instant messaging and video conferencing
- Distribute platform tokens (SOS) through airdrops and red envelope giveaways
- Implement a sustainable token economic model for the SOS platform token

---

## 2. Functional Requirements

### 2.1 User Authentication & Profile Management
- **FR-1.1:** Users can authenticate using Web3 wallets (MetaMask, WalletConnect, Coinbase Wallet)
- **FR-1.2:** Users can authenticate using social media accounts (Google, Twitter/X, Discord, GitHub)
- **FR-1.3:** Users can view their profile with betting history and statistics
- **FR-1.4:** Users can see their verification status
- **FR-1.5:** Users can view their betting portfolio and performance
- **FR-1.6:** Users can manage their creator profile settings
- **FR-1.7:** Users can set up subscription tiers and pricing
- **FR-1.8:** Users can view subscription analytics and earnings

### 2.2 Market Creation & Discovery
- **FR-2.1:** Users can create new prediction markets with:
  - Question/statement
  - Category selection (Crypto, Sports, Pop Culture, Politics, Tech)
  - End date/time
  - Initial liquidity/pool size
  - Optional image attachment
- **FR-2.2:** Users can browse markets in a feed format
- **FR-2.3:** Users can explore markets by category
- **FR-2.4:** Markets display real-time statistics:
  - Yes/No percentages
  - Current prices for YES and NO positions
  - Total pool size
  - Trading volume
  - Number of likes and comments

### 2.3 Betting Functionality
- **FR-3.1:** Users can place bets on markets (YES or NO positions)
- **FR-3.2:** Users can view current market prices before betting
- **FR-3.3:** Users can see their pending bets
- **FR-3.4:** Betting interface shows:
  - Current odds
  - Potential payout
  - Market end date
  - Pool size and volume

### 2.4 Social Features
- **FR-4.1:** Users can like markets
- **FR-4.2:** Users can comment on markets
- **FR-4.3:** Users can view market creator information
- **FR-4.4:** Markets can be marked as "Hot" based on activity
- **FR-4.5:** Users can see verified creator badges

### 2.5 Navigation & Views
- **FR-5.1:** Home feed view showing all markets
- **FR-5.2:** Explore view for discovering markets
- **FR-5.3:** Leaderboard view showing top traders/users
- **FR-5.4:** Notifications view for user alerts
- **FR-5.5:** Profile view for user information
- **FR-5.6:** AI Assistant chat interface
- **FR-5.7:** Responsive design for mobile and desktop

### 2.6 AI Assistant Integration
- **FR-6.1:** Users can interact with AI assistant via chat interface
- **FR-6.2:** AI assistant provides market insights and analysis
- **FR-6.3:** AI assistant helps users understand market mechanics
- **FR-6.4:** Integration with Cloudflare AI Workers for enhanced AI capabilities
- **FR-6.5:** AI assistant can analyze market trends using Cloudflare AI
- **FR-6.6:** AI-powered content recommendations based on user behavior

### 2.7 AI Automatic Predictions & Market Generation
- **FR-7.1:** AI can automatically generate prediction markets based on:
  - Current news and trending topics
  - Social media trends
  - Real-world events and announcements
  - User interests and behavior patterns
  - Market gaps and opportunities
- **FR-7.2:** AI can automatically create markets with:
  - Relevant questions/statements
  - Appropriate categories
  - Suggested end dates based on event timelines
  - Initial pricing estimates
  - Supporting context and rationale
- **FR-7.3:** AI can make automatic predictions on existing markets:
  - Probability assessments
  - Betting recommendations (YES/NO)
  - Confidence levels
  - Risk analysis
- **FR-7.4:** AI-generated markets are clearly labeled as "AI Generated"
- **FR-7.5:** Users can review and approve AI-generated markets before publication
- **FR-7.6:** AI can continuously monitor and update predictions based on new information
- **FR-7.7:** AI predictions include reasoning and data sources
- **FR-7.8:** AI can generate markets in multiple languages (with translation)
- **FR-7.9:** AI market generation respects user preferences and filters

### 2.8 Right Panel Features
- **FR-8.1:** Display trending markets
- **FR-8.2:** Show market recommendations
- **FR-8.3:** Display additional market information
- **FR-8.4:** Show AI-generated market suggestions
- **FR-8.5:** Display AI prediction insights for active markets

### 2.9 Creator Monetization Features (OnlyFans-Inspired)
- **FR-9.1:** Creators can create subscription tiers with different pricing levels
- **FR-9.2:** Creators can offer premium content accessible only to subscribers
- **FR-9.3:** Creators can set up pay-per-view content for markets or insights
- **FR-9.4:** Creators can offer exclusive market predictions to subscribers
- **FR-9.5:** Users can subscribe to creators with recurring payments
- **FR-9.6:** Users can view their active subscriptions and manage them
- **FR-9.7:** Creators can see subscriber count and revenue analytics
- **FR-9.8:** Platform supports both crypto (via Web3 wallets) and fiat payments
- **FR-9.9:** Creators can offer free previews of premium content
- **FR-9.10:** Subscription badges and indicators on creator profiles

### 2.10 Premium Content & Access Control
- **FR-10.1:** Creators can mark markets or content as premium/subscriber-only
- **FR-10.2:** Premium content is locked for non-subscribers with preview
- **FR-10.3:** Subscribers can access exclusive creator content
- **FR-10.4:** Premium content indicators are clearly displayed
- **FR-10.5:** Users can upgrade subscription tiers to access more content

### 2.11 Platform Applications (Mobile & Desktop)
- **FR-11.1:** Native mobile applications available for:
  - iOS (iPhone and iPad)
  - Android (phones and tablets)
- **FR-11.2:** Native desktop applications available for:
  - Windows (10/11)
  - macOS (Intel and Apple Silicon)
  - Linux (Ubuntu, Debian, Fedora)
- **FR-11.3:** Download links and installation instructions provided:
  - App Store (iOS)
  - Google Play Store (Android)
  - Direct download links for desktop
  - Installation guides for each platform
- **FR-11.4:** Applications feature:
  - Full feature parity with web version
  - Offline mode capabilities
  - Push notifications
  - Native performance optimizations
  - Platform-specific UI/UX adaptations
- **FR-11.5:** White paper available:
  - Technical architecture documentation
  - Token economic model
  - Platform roadmap
  - Security and privacy policies
  - Downloadable PDF format
  - Available in multiple languages

### 2.12 Instant Messaging
- **FR-12.1:** Users can send direct messages to other users
- **FR-12.2:** Users can create and participate in group chats
- **FR-12.3:** Messaging features include:
  - Text messages
  - Image sharing
  - File attachments
  - Emoji and stickers
  - Voice messages
  - Message reactions
  - Read receipts
  - Typing indicators
- **FR-12.4:** Real-time message delivery and synchronization
- **FR-12.5:** Message history and search functionality
- **FR-12.6:** End-to-end encryption for private messages
- **FR-12.7:** Message notifications (push and in-app)
- **FR-12.8:** Block and report functionality for spam/abuse

### 2.13 Video Conferencing
- **FR-13.1:** Users can initiate one-on-one video calls
- **FR-13.2:** Users can create and join group video conferences
- **FR-13.3:** Conferencing features include:
  - HD video quality
  - Audio/video mute controls
  - Screen sharing
  - Chat during calls
  - Participant management (host controls)
  - Recording capabilities (with consent)
  - Virtual backgrounds
- **FR-13.4:** Integration with market discussions:
  - Create conference rooms for market analysis
  - Share market screens during calls
  - Collaborative betting discussions
- **FR-13.5:** Conference scheduling and calendar integration
- **FR-13.6:** Support for multiple participants (up to 50+)
- **FR-13.7:** Low-latency streaming for real-time interaction

### 2.14 Token Airdrops
- **FR-14.1:** Platform can distribute SOS tokens via airdrops
- **FR-14.2:** Airdrop eligibility criteria:
  - New user registration rewards
  - Activity-based rewards (betting, creating markets)
  - Referral program rewards
  - Community participation rewards
  - Special event airdrops
- **FR-14.3:** Airdrop distribution mechanism:
  - Automatic distribution to eligible wallets
  - Claim process for users
  - Airdrop history and tracking
  - Notification system for airdrops
- **FR-14.4:** Airdrop transparency:
  - Public airdrop announcements
  - Eligibility criteria clearly stated
  - Distribution amounts visible
  - Blockchain verification

### 2.15 Red Envelope (Hongbao) Giveaways
- **FR-15.1:** Users can create token-based red envelope giveaways
- **FR-15.2:** Red envelope features:
  - Set total amount of SOS tokens
  - Choose number of recipients
  - Random or equal distribution
  - Set expiration time
  - Add custom messages
  - Optional password protection
- **FR-15.3:** Red envelope participation:
  - Users can claim red envelopes
  - First-come-first-served or random selection
  - Real-time claim status
  - Claim history and statistics
- **FR-15.4:** Red envelope types:
  - Public red envelopes (visible to all)
  - Group red envelopes (specific chat/community)
  - Private red envelopes (direct message)
- **FR-15.5:** Creator red envelopes:
  - Creators can reward subscribers
  - Community engagement rewards
  - Event celebration giveaways

### 2.16 SOUL Platform Token & Economic Model
- **FR-16.1:** Platform token: SOUL (SoulCast Token)
- **FR-16.2:** Total supply: 2.1 billion SOS tokens
- **FR-16.3:** Token distribution model:
  - Community rewards and airdrops
  - User activity rewards
  - Creator incentives
  - Staking rewards
  - Liquidity provision rewards
  - Platform operations reserve
  - Team and advisors (vested)
  - Marketing and partnerships
- **FR-16.4:** Token utility:
  - Betting on prediction markets
  - Subscription payments
  - Premium content access
  - Red envelope giveaways
  - Staking for rewards
  - Governance voting (DAO-based)
  - Fee discounts
  - Creator monetization
- **FR-16.5:** Token economics:
  - Deflationary mechanisms (burn on transactions)
  - Staking rewards program
  - Liquidity mining incentives
  - Buyback and burn program
  - Token vesting schedules
- **FR-16.6:** Token management:
  - Wallet integration for SOS tokens
  - Balance display and tracking
  - Transaction history
  - Token swap functionality (SOS ↔ ETH/SOL/BNB)
- **FR-16.7:** Economic model documentation:
  - Detailed tokenomics in white paper
  - Distribution schedule
  - Vesting periods
  - Inflation/deflation rates
  - Economic sustainability analysis

### 2.17 DAO Governance & Token Management
- **FR-17.1:** DAO community can create governance proposals
- **FR-17.2:** DAO members can vote on proposals using SOS tokens
- **FR-17.3:** DAO can add/contribute SOS tokens to the PC platform:
  - Add tokens to platform liquidity pools
  - Contribute tokens to reward pools
  - Allocate tokens for community initiatives
  - Fund platform development and operations
- **FR-17.4:** Token contribution interface:
  - DAO proposal creation for token allocation
  - Multi-signature wallet support for security
  - Transparent transaction tracking
  - Real-time balance updates
- **FR-17.5:** DAO governance features:
  - Proposal submission and discussion
  - Voting period management
  - Quorum requirements
  - Voting weight based on SOS token holdings
  - Proposal execution after approval
- **FR-17.6:** DAO token management dashboard (PC platform):
  - View current platform SOS token balance
  - View DAO treasury balance
  - Track token contributions and allocations
  - View governance proposals and voting status
  - Historical transaction records
- **FR-17.7:** DAO voting mechanisms:
  - Simple majority voting
  - Weighted voting (based on SOS holdings)
  - Time-locked voting periods
  - Proposal categories (token allocation, platform changes, etc.)
- **FR-17.8:** DAO proposal types:
  - Token allocation proposals (add SOS to platform)
  - Platform parameter changes
  - Feature development funding
  - Community reward distribution
  - Treasury management

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-1.1:** Application should load within 2 seconds on standard broadband
- **NFR-1.2:** Market data updates should reflect within 1 second
- **NFR-1.3:** Smooth scrolling and interactions (60 FPS)

### 3.2 Usability
- **NFR-2.1:** Intuitive user interface following social media design patterns
- **NFR-2.2:** Mobile-responsive design for all screen sizes
- **NFR-2.3:** Clear visual hierarchy and information architecture
- **NFR-2.4:** Accessible design following WCAG guidelines

### 3.3 Reliability
- **NFR-3.1:** Application should handle errors gracefully
- **NFR-3.2:** Data persistence for user actions
- **NFR-3.3:** Offline capability considerations

### 3.4 Security
- **NFR-4.1:** Secure API key management (GEMINI_API_KEY)
- **NFR-4.2:** Input validation for all user-generated content
- **NFR-4.3:** Protection against XSS and injection attacks

### 3.5 Compatibility
- **NFR-5.1:** Support for modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-5.2:** Mobile browser support (iOS Safari, Chrome Mobile)
- **NFR-5.3:** Responsive breakpoints: mobile (< 640px), tablet (640px-1024px), desktop (> 1024px)
- **NFR-5.4:** Progressive Web App (PWA) capabilities for mobile app-like experience
- **NFR-5.5:** Touch gesture support (swipe, pinch, pull-to-refresh)
- **NFR-5.6:** Keyboard navigation and shortcuts for desktop
- **NFR-5.7:** Apple-style smooth animations and transitions (fluid, elegant, purposeful)

### 3.6 Maintainability
- **NFR-6.1:** Clean, modular code structure
- **NFR-6.2:** TypeScript for type safety
- **NFR-6.3:** Component-based architecture

---

## 4. Technical Constraints

### 4.1 Technology Stack
- **Frontend Framework:** React 18.3.1
- **Build Tool:** Vite 6.2.0
- **Language:** TypeScript 5.8.2
- **Styling:** Tailwind CSS 4.1.17
- **Icons:** Lucide React 0.460.0
- **AI Integration:** 
  - Cloudflare AI Workers (primary)
  - Google Gemini API (@google/genai) (fallback/alternative)
- **Database:** Cloudflare D1 (SQLite-based edge database)
- **Blockchain Support:**
  - **Ethereum (ETH):** wagmi, viem, ethers.js
  - **Solana (SOL):** @solana/web3.js, @solana/wallet-adapter
  - **Binance Smart Chain (BSC):** wagmi, viem (EVM-compatible)
- **Authentication:** 
  - Web3 wallet providers (MetaMask, Phantom, WalletConnect, Coinbase Wallet)
  - OAuth providers (Google, Twitter/X, Discord, GitHub)
- **Payment Processing:** 
  - Web3 wallet payments (crypto on ETH, SOL, BSC)
  - Stripe/PayPal integration (fiat)

### 4.2 Development Environment
- **Node.js:** Required (version not specified)
- **Package Manager:** npm
- **Development Server:** Vite dev server on port 3000
- **Host Configuration:** 0.0.0.0 (accessible from all interfaces)

### 4.3 Environment Variables
- **GEMINI_API_KEY:** Optional for AI assistant fallback functionality
- **CLOUDFLARE_ACCOUNT_ID:** Required for Cloudflare services
- **CLOUDFLARE_API_TOKEN:** Required for Cloudflare API access
- **CLOUDFLARE_D1_DATABASE_ID:** Required for database operations
- **CLOUDFLARE_AI_BINDING:** Required for Cloudflare AI Workers
- **WALLET_CONNECT_PROJECT_ID:** Required for WalletConnect integration
- **OAUTH_CLIENT_IDS:** Required for social media login (Google, Twitter, Discord, GitHub)
- Configuration via `.env.local` file

---

## 5. Data Models

### 5.1 Market Categories
- Crypto
- Sports
- Pop Culture
- Politics
- Tech

### 5.2 User Model
- ID
- Name
- Handle (username)
- Avatar URL
- Verification status
- Authentication methods (Web3 wallet addresses, OAuth provider IDs)
- Creator status (boolean)
- Subscription tier settings (if creator)
- Wallet addresses (primary and secondary)
- Social account links
- SOS token balance
- SOS token staking amount
- Airdrop eligibility status
- Red envelope creation/claim history

### 5.3 Prediction Market Model
- ID
- Creator (User or AI)
- Question
- Category
- End Date
- Pool Size (USD)
- Volume
- Likes count
- Comments count
- Optional image
- Outcome Statistics (Yes/No percentages and prices)
- Hot market flag
- **AI Generated flag** (boolean)
- **AI Prediction data:**
  - AI confidence level
  - AI recommended position (YES/NO)
  - AI reasoning/analysis
  - AI data sources
  - Last AI update timestamp
- **Platform flags:**
  - Desktop optimized
  - Mobile optimized
  - Cross-platform compatible

### 5.4 Bet Model
- Market ID
- Bet Type (YES/NO)
- Price at time of bet
- Status (pending/confirmed)
- Payment method (crypto wallet or fiat)
- Transaction hash (for crypto payments)

### 5.5 Subscription Model
- Creator ID
- Subscriber ID
- Tier level
- Price (monthly/recurring)
- Start date
- End date
- Status (active/cancelled/expired)
- Payment method
- Auto-renewal setting

### 5.6 Premium Content Model
- Content ID
- Creator ID
- Content type (market, insight, analysis)
- Subscription tier required
- Preview available (boolean)
- Access control rules

### 5.7 Message Model
- Message ID
- Sender ID
- Recipient ID (or Group ID for group chats)
- Message type (text, image, file, voice, etc.)
- Content
- Timestamp
- Read status
- Reactions
- Encryption status

### 5.8 Conference Model
- Conference ID
- Host ID
- Participants (array of user IDs)
- Start time
- End time
- Status (scheduled, active, ended)
- Recording URL (if recorded)
- Conference type (1-on-1, group)

### 5.9 Airdrop Model
- Airdrop ID
- Token amount (SOS)
- Eligibility criteria
- Distribution date
- Recipients (array of user IDs)
- Claim status per recipient
- Airdrop type (registration, activity, referral, event)

### 5.10 Red Envelope Model
- Red Envelope ID
- Creator ID
- Total amount (SOS tokens)
- Number of recipients
- Distribution type (random, equal)
- Expiration time
- Password (optional)
- Claimed recipients (array)
- Remaining amount
- Status (active, claimed, expired)

### 5.11 SOS Token Model
- Token symbol: SOS
- Total supply: 2,100,000,000 (2.1 billion)
- Distribution breakdown:
  - Community rewards: X%
  - User activity: X%
  - Creator incentives: X%
  - Staking rewards: X%
  - Liquidity provision: X%
  - Platform operations: X%
  - Team/Advisors (vested): X%
  - Marketing/Partnerships: X%
  - DAO Treasury: X%
- Token contract addresses (per blockchain)
- Burn mechanism details
- Staking parameters
- Platform balance (SOS tokens on PC platform)
- DAO treasury balance

### 5.12 DAO Governance Model
- Proposal ID
- Creator ID (DAO member)
- Proposal type (token allocation, platform change, etc.)
- Title and description
- Token amount (if applicable)
- Allocation target (liquidity pool, reward pool, etc.)
- Voting period (start and end dates)
- Voting options (Yes, No, Abstain)
- Current votes (weighted by SOS holdings)
- Quorum requirement
- Status (draft, active, passed, rejected, executed)
- Execution transaction hash
- Discussion thread ID

### 5.13 DAO Token Contribution Model
- Contribution ID
- Proposal ID (if from proposal)
- DAO treasury address
- Platform address (destination)
- Token amount (SOS)
- Contribution type (liquidity, rewards, operations, etc.)
- Transaction hash
- Block number
- Timestamp
- Status (pending, confirmed, failed)
- Contributor (DAO multisig address)

---

## 6. User Interface Requirements

### 6.1 Layout Structure (Apple-Inspired Design)
- **Design Philosophy:** Simple, elegant, and minimal - following Apple's design principles
- **Desktop (PC) Layout:**
  - **Left Sidebar:** Clean navigation (80px/275px width, collapsible) with subtle shadows
  - **Main Feed:** Content area (max 600px width, scrollable) with generous white space
  - **Right Panel:** Additional information (350px width, sticky) with light background
  - **Top Bar:** Minimal header with search, notifications, profile (sticky, translucent)
- **Mobile Layout:**
  - **Bottom Navigation:** Clean navigation bar (fixed, safe area aware) with rounded corners
  - **Top Bar:** Minimal header with logo and search (translucent blur effect)
  - **Full-Width Feed:** Optimized for mobile scrolling with card-based layout
  - **Swipe Gestures:** Smooth swipe between views (Apple-style)
  - **Floating Action Button:** Prominent bright yellow button for quick actions
- **Design Patterns:**
  - **Minimalism:** Clean, uncluttered interface with generous white space
  - **Card-based layout:** Subtle shadows, rounded corners, light backgrounds
  - **Smooth animations:** Fluid transitions (200-300ms) with ease-in-out curves
  - **Light theme:** Clean white/light gray backgrounds with bright yellow accents
  - **Typography:** San Francisco font family (or system font) with clear hierarchy
  - **Touch-friendly:** Large touch targets (44px minimum) for mobile
  - **Keyboard shortcuts:** Comprehensive shortcuts for desktop power users

### 6.2 Color Scheme (Apple-Inspired with Bright Yellow)
- **Primary Color:** Bright Yellow (#FFD700 / #FFC107 / #FFEB3B)
  - Primary actions, buttons, highlights
  - Accent elements and call-to-action buttons
  - Active states and selected items
- **Background:**
  - Main: White (#FFFFFF) or very light gray (#F5F5F7)
  - Secondary: Light gray (#FAFAFA)
  - Cards: White with subtle shadows
- **Text:**
  - Primary: Dark gray/black (#1D1D1F) for main content
  - Secondary: Medium gray (#86868B) for supporting text
  - Tertiary: Light gray (#C7C7CC) for hints and labels
- **Borders & Dividers:**
  - Subtle gray (#E5E5EA) for borders
  - Light dividers (#F2F2F7) for section separation
- **Interactive Elements:**
  - Hover: Light yellow tint (#FFF9E6)
  - Active: Bright yellow (#FFD700)
  - Disabled: Light gray (#E5E5EA)
- **Status Colors:**
  - Success: Green (#34C759)
  - Error: Red (#FF3B30)
  - Warning: Orange (#FF9500)
  - Info: Blue (#007AFF)
- **Special Elements:**
  - Premium Indicators: Bright yellow with subtle glow
  - AI Indicators: Light yellow background (#FFF9E6) with yellow border
  - Notifications: Bright yellow badge
- **Shadows:**
  - Subtle shadows for depth (0-8px blur, low opacity)
  - Elevation-based shadow system

### 6.3 Navigation Items
- **Desktop Sidebar:**
  - Home (Feed)
  - Explore
  - Leaderboard
  - Notifications
  - Profile
  - AI Assistant
  - Create Market (prominent button)
  - AI Predictions (new section)
  - **DAO Governance** (new section, PC platform only)
- **Mobile Bottom Nav:**
  - Home
  - Explore
  - Create (center, floating)
  - AI Assistant
  - Profile
- **Additional UI Elements:**
  - AI prediction badge/indicator on markets
  - Quick AI market generation button
  - AI prediction insights panel
  - DAO governance dashboard (PC platform)
  - DAO token balance display
  - Active proposals indicator

---

## 7. Integration Requirements

### 7.1 Cloudflare Services & Cloud Computing
- **IR-1.1:** Integration with Cloudflare AI Workers for AI-powered features
- **IR-1.2:** Cloudflare D1 database for data persistence
- **IR-1.3:** Cloudflare Workers for serverless API endpoints and edge computing
- **IR-1.4:** Cloudflare R2 for media storage (images, premium content)
- **IR-1.5:** Cloudflare KV for caching and session management
- **IR-1.6:** Edge computing for low-latency responses globally
- **IR-1.7:** Cloudflare Durable Objects for stateful real-time applications:
  - Real-time collaboration features
  - WebSocket connection management
  - State synchronization across edge locations
  - Enhanced conferencing capabilities
- **IR-1.8:** Cloudflare's global edge network:
  - Reduced latency for all features
  - Improved performance for video conferencing
  - Faster content delivery
  - Better user experience worldwide
- **IR-1.9:** Cloudflare's cloud computing infrastructure:
  - Scalable serverless computing
  - Automatic scaling for high demand
  - Cost-effective resource utilization
  - Enhanced reliability and uptime

### 7.2 Web3 Wallet Integration
- **IR-2.1:** MetaMask wallet connection and authentication
- **IR-2.2:** WalletConnect protocol support for mobile wallets
- **IR-2.3:** Coinbase Wallet integration
- **IR-2.4:** Phantom wallet integration (Solana)
- **IR-2.5:** Wallet signature-based authentication
- **IR-2.6:** Crypto payment processing via smart contracts or payment gateways
- **IR-2.7:** Multi-chain support for mainstream blockchain platforms:
  - **Ethereum (ETH):** Primary EVM chain with full support
  - **Solana (SOL):** Native Solana blockchain support
  - **Binance Smart Chain (BSC):** EVM-compatible chain support
  - Additional chains: Polygon, Arbitrum, Base (optional)
- **IR-2.8:** Chain switching functionality for users
- **IR-2.9:** Network detection and automatic chain selection
- **IR-2.10:** Transaction status tracking and confirmation across all supported chains
- **IR-2.11:** Gas fee estimation and optimization per chain

### 7.3 Social Media Authentication
- **IR-3.1:** Google OAuth 2.0 integration
- **IR-3.2:** Twitter/X OAuth integration
- **IR-3.3:** Discord OAuth integration
- **IR-3.4:** GitHub OAuth integration
- **IR-3.5:** Account linking (multiple auth methods per user)
- **IR-3.6:** Profile data import from social accounts

### 7.4 Payment Processing
- **IR-4.1:** Crypto payments via Web3 wallets
- **IR-4.2:** Fiat payment processing (Stripe/PayPal)
- **IR-4.3:** Subscription billing and recurring payments
- **IR-4.4:** Payment history and receipts
- **IR-4.5:** Refund processing
- **IR-4.6:** Revenue sharing between platform and creators

### 7.5 AI Assistant & Automatic Predictions
- **IR-5.1:** Primary integration with Cloudflare AI Workers
- **IR-5.2:** Fallback integration with Google Gemini API
- **IR-5.3:** Chat interface for user interactions
- **IR-5.4:** Context-aware responses about markets
- **IR-5.5:** AI-powered content recommendations
- **IR-5.6:** AI automatic market generation:
  - Real-time news monitoring and analysis
  - Social media trend detection
  - Event calendar integration
  - Market gap identification
  - Automatic question formulation
  - Category assignment
  - End date estimation
- **IR-5.7:** AI automatic predictions:
  - Continuous market analysis
  - Probability calculations
  - Betting recommendations
  - Confidence scoring
  - Risk assessment
  - Update frequency based on market volatility
- **IR-5.8:** AI data sources integration:
  - News APIs (NewsAPI, Google News)
  - Social media APIs (Twitter/X, Reddit)
  - Financial data APIs (for crypto/sports markets)
  - Event calendars
  - Real-time data feeds
- **IR-5.9:** AI prediction accuracy tracking:
  - Historical prediction performance
  - Confidence calibration
  - Learning from outcomes
  - User feedback integration

### 7.6 Instant Messaging Integration (Enhanced with Cloudflare)
- **IR-6.1:** Real-time messaging infrastructure leveraging Cloudflare:
  - **WebSocket connections:** Cloudflare Durable Objects for persistent connections
  - **Message queue system:** Cloudflare Workers for reliable message processing
  - **End-to-end encryption (E2EE):** Enhanced with Cloudflare's security infrastructure
  - **Message storage:** Cloudflare D1 for message history
  - **Real-time synchronization:** Cloudflare Durable Objects for state management
- **IR-6.2:** Cloudflare-powered messaging features:
  - **Cloudflare Durable Objects:**
    - Persistent WebSocket connections
    - Real-time message delivery
    - Connection state management
    - Automatic scaling per conversation
  - **Cloudflare Workers:**
    - Serverless message routing
    - Real-time event processing
    - Message queue management
    - Edge-based message delivery
  - **Cloudflare R2:**
    - Media file storage (images, files, voice)
    - Global CDN for fast media delivery
    - Cost-effective storage solution
  - **Cloudflare KV:**
    - Message caching for performance
    - User presence state
    - Quick message retrieval
- **IR-6.3:** Enhanced media handling with Cloudflare:
  - Image upload and storage (Cloudflare R2)
  - Image optimization and resizing (Cloudflare Images)
  - File attachment processing (Cloudflare Workers)
  - Voice message encoding/decoding (edge processing)
  - Global CDN for media delivery
  - Low-latency media streaming

### 7.7 Video Conferencing Integration (Enhanced with Cloudflare Cloud Computing)
- **IR-7.1:** Video conferencing infrastructure leveraging Cloudflare:
  - **WebRTC for peer-to-peer connections:** Enhanced with Cloudflare's edge network
  - **SFU (Selective Forwarding Unit):** Cloudflare Durable Objects for scalable group calls
  - **TURN servers:** Cloudflare TURN for reliable NAT traversal globally
  - **Recording and storage:** Cloudflare Stream for video processing and storage
  - **Real-time signaling:** Cloudflare Workers for low-latency signaling
- **IR-7.2:** Cloudflare-powered conferencing features:
  - **Cloudflare Stream:**
    - Live video streaming and recording
    - Video transcoding and optimization
    - Adaptive bitrate streaming
    - Global CDN for video delivery
    - Low-latency streaming (< 1 second)
  - **Cloudflare Durable Objects:**
    - Stateful SFU instances for group calls
    - Real-time participant management
    - Connection state synchronization
    - Automatic failover and scaling
  - **Cloudflare TURN:**
    - Global TURN server network
    - Low-latency NAT traversal
    - High availability and reliability
    - Automatic region selection
  - **Cloudflare Workers:**
    - Serverless signaling server
    - Real-time event processing
    - WebSocket management
    - Edge-based routing
- **IR-7.3:** Enhanced conferencing features:
  - Screen sharing with Cloudflare Stream
  - Virtual backgrounds with edge processing
  - Noise suppression (AI-powered via Cloudflare AI)
  - Bandwidth adaptation based on network conditions
  - Low-latency audio/video (< 100ms)
  - HD/4K video quality support
  - Automatic quality adjustment
- **IR-7.4:** Cloudflare cloud computing benefits:
  - **Scalability:** Automatic scaling for any number of participants
  - **Performance:** Edge computing reduces latency globally
  - **Reliability:** High availability with automatic failover
  - **Cost-effectiveness:** Pay-per-use serverless model
  - **Global reach:** 300+ data centers worldwide
  - **Security:** Built-in DDoS protection and encryption

### 7.8 Token Airdrop System
- **IR-8.1:** Airdrop distribution mechanism:
  - Smart contract integration for token distribution
  - Multi-chain support (ETH, SOL, BSC)
  - Automated eligibility checking
  - Batch distribution for efficiency
- **IR-8.2:** Airdrop management:
  - Admin dashboard for airdrop creation
  - Eligibility rule engine
  - Distribution tracking and analytics
  - Claim verification system

### 7.9 Red Envelope System
- **IR-9.1:** Red envelope smart contracts:
  - Multi-chain token contracts (ETH, SOL, BSC)
  - Secure random distribution algorithm
  - Time-locked release mechanism
  - Refund functionality for unclaimed envelopes
- **IR-9.2:** Red envelope infrastructure:
  - Real-time claim processing
  - Distribution algorithm (random/equal)
  - Expiration handling
  - Statistics and analytics

### 7.10 SOS Token Integration
- **IR-10.1:** Token contract deployment:
  - ERC-20 contract on Ethereum
  - SPL token on Solana
  - BEP-20 contract on BSC
  - Cross-chain bridge support (future)
- **IR-10.2:** Token management:
  - Token balance tracking
  - Transaction history
  - Staking contract integration
  - Burn mechanism implementation
- **IR-10.3:** Token economics:
  - Automated distribution for rewards
  - Staking reward calculations
  - Burn event tracking
  - Liquidity pool integration

### 7.11 Application Distribution
- **IR-11.1:** Mobile app distribution:
  - iOS App Store submission and management
  - Google Play Store submission and management
  - App signing and certificates
  - Update distribution system
- **IR-11.2:** Desktop app distribution:
  - Windows installer (MSI/EXE)
  - macOS app bundle (DMG)
  - Linux packages (DEB, RPM, AppImage)
  - Auto-update mechanisms
- **IR-11.3:** Documentation hosting:
  - White paper hosting and distribution
  - Installation guides
  - API documentation
  - User manuals

### 7.12 DAO Governance Integration
- **IR-12.1:** DAO smart contract integration:
  - Governance contract (multi-chain: ETH, SOL, BSC)
  - Proposal creation and management
  - Voting mechanism with SOS token weighting
  - Proposal execution automation
  - Multi-signature wallet support
- **IR-12.2:** Token contribution system:
  - DAO treasury wallet management
  - Platform token balance tracking
  - Automated token transfer on proposal execution
  - Transaction verification and confirmation
  - Balance reconciliation
- **IR-12.3:** Governance interface (PC platform):
  - Proposal creation and submission
  - Voting interface with token-weighted votes
  - Real-time voting results
  - Proposal discussion forum
  - Historical proposal archive
- **IR-12.4:** DAO dashboard features:
  - DAO treasury balance display
  - Platform SOS token balance
  - Token contribution history
  - Active proposals list
  - Voting participation statistics
  - Token allocation tracking
- **IR-12.5:** Governance parameters:
  - Minimum proposal threshold (SOS tokens required)
  - Voting period duration (configurable)
  - Quorum requirements
  - Proposal execution delay (timelock)
  - Multi-signature requirements for large allocations

### 7.13 Future Integrations (Potential)
- Oracle services for market resolution
- Advanced analytics and reporting
- Push notifications via Cloudflare Workers
- Email notifications
- Cross-chain token bridges
- Decentralized storage for messages

---

## 8. Out of Scope (v1.0)

- Market resolution automation (manual resolution for v1.0)
- Advanced analytics dashboard (basic analytics only)
- Multi-language support (English only for v1.0)
- Email notifications (in-app and push only)
- Cross-chain token bridges (single-chain per transaction)
- Decentralized storage for all messages (hybrid approach)
- Advanced video effects and filters
- Live streaming (video conferencing only)

---

## 9. Success Criteria

- Users can successfully create prediction markets
- Users can place bets on markets
- Real-time market data is displayed accurately
- Application is responsive across all device types (PC and mobile)
- AI assistant provides helpful market insights
- AI automatically generates relevant prediction markets
- AI predictions are accurate and useful for users
- User interface is intuitive and engaging (Apple-inspired simple and elegant design with bright yellow accents)
- Smooth cross-platform experience (desktop and mobile)
- AI-generated content is clearly labeled and trustworthy

---

## 10. Dependencies

### 10.1 External Dependencies
- **Cloudflare Services:**
  - Cloudflare AI Workers (for AI features)
  - Cloudflare D1 Database (for data persistence)
  - Cloudflare Workers (for API endpoints)
  - Cloudflare R2 (for media storage)
  - Cloudflare KV (for caching)
- **Web3 Infrastructure:**
  - **Mainstream Blockchain Platforms:**
    - Ethereum (ETH) - Mainnet and testnets
    - Solana (SOL) - Mainnet and devnet
    - Binance Smart Chain (BSC) - Mainnet and testnet
  - **Additional Supported Chains:**
    - Polygon (MATIC)
    - Arbitrum
    - Base
  - **Wallet Providers:**
    - MetaMask (Ethereum, BSC, Polygon, Arbitrum, Base)
    - Phantom (Solana)
    - WalletConnect (multi-chain mobile wallets)
    - Coinbase Wallet (Ethereum, BSC, Polygon)
    - Trust Wallet (multi-chain)
    - Rainbow Wallet (Ethereum)
- **OAuth Providers:**
  - Google OAuth
  - Twitter/X OAuth
  - Discord OAuth
  - GitHub OAuth
- **Payment Processors:**
  - Stripe (for fiat payments)
  - PayPal (optional, for fiat payments)
- **AI Services:**
  - Google Gemini API (fallback/alternative AI)
- Internet connection (for API calls and data fetching)

### 10.2 Internal Dependencies
- All components must be properly typed (TypeScript)
- Components must follow the established design system
- State management must be consistent across views

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024 | Initial | Initial requirements document |
| 1.1.0 | 2024 | Update | Added OnlyFans-inspired monetization features, Cloudflare services integration, Web3 wallet support, and social media authentication |
| 1.2.0 | 2024 | Update | Added AI automatic predictions and market generation, OnlyFans-inspired cross-platform design (PC and mobile), AI prediction tracking and accuracy metrics |
| 1.3.0 | 2024 | Update | Added support for mainstream blockchain platforms: Solana (SOL), Binance Smart Chain (BSC), and Ethereum (ETH) with multi-chain wallet integration |
| 1.4.0 | 2024 | Update | Added native mobile/desktop applications, instant messaging, video conferencing, token airdrops, red envelope giveaways, and SOS platform token (2.1B) with economic model |
| 1.5.0 | 2024 | Update | Updated UI design to Apple-inspired simple and elegant style with bright yellow (#FFD700) as primary color, replacing dark theme with clean light theme |
| 1.6.0 | 2024 | Update | Added DAO governance system enabling community to add SOS tokens to PC platform through proposals and voting, with multi-signature wallet support and token allocation management |
| 1.7.0 | 2024 | Update | Enhanced Cloudflare cloud computing integration, particularly for video conferencing, with Cloudflare Stream, Durable Objects, TURN servers, and Workers for improved scalability, performance, and reliability |

