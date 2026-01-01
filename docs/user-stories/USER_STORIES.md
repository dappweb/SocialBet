# SoulCast - User Stories

## Overview
This document contains user stories that describe the features and functionality of SoulCast from the user's perspective. Each story follows the format: "As a [user type], I want [goal] so that [benefit]."

---

## 1. Market Discovery & Browsing

### US-1.1: Browse Market Feed
**As a** user  
**I want** to see a feed of prediction markets  
**So that** I can discover interesting markets to bet on

**Acceptance Criteria:**
- Feed displays markets in chronological order
- Each market shows question, creator, category, and statistics
- Feed is scrollable and loads smoothly
- Markets are visually distinct and easy to scan

---

### US-1.2: Explore Markets by Category
**As a** user  
**I want** to filter markets by category  
**So that** I can find markets in topics I'm interested in

**Categories:**
- Crypto
- Sports
- Pop Culture
- Politics
- Tech

**Acceptance Criteria:**
- Can select a category to filter markets
- Filtered view shows only markets in selected category
- Can clear filter to see all markets
- Category is clearly displayed on each market card

---

### US-1.3: View Market Details
**As a** user  
**I want** to see detailed information about a market  
**So that** I can make informed betting decisions

**Acceptance Criteria:**
- Market displays:
  - Full question/statement
  - Creator information with verification badge
  - Current YES/NO percentages
  - Current prices for YES and NO positions
  - Total pool size
  - Trading volume
  - End date/time
  - Number of likes and comments
  - Optional image
- Information is clearly organized and easy to read

---

## 2. Market Creation

### US-2.1: Create a New Market
**As a** user  
**I want** to create a new prediction market  
**So that** I can start a market on a topic I'm interested in

**Acceptance Criteria:**
- Can access create market modal from navigation
- Form includes:
  - Question/statement input (required)
  - Category selection dropdown (required)
  - End date/time picker (required)
  - Initial liquidity/pool size input (required)
  - Optional image upload
- Form validates all required fields
- Successfully created market appears in feed
- Market is added to top of feed

---

### US-2.2: Set Market Parameters
**As a** market creator  
**I want** to set market parameters (category, end date, liquidity)  
**So that** my market is properly configured

**Acceptance Criteria:**
- Can select from predefined categories
- Can set end date in the future
- Can specify initial liquidity amount
- All parameters are validated before submission
- Clear error messages for invalid inputs

---

## 3. Betting

### US-3.1: Place a Bet
**As a** user  
**I want** to place a bet on a market  
**So that** I can participate and potentially profit

**Acceptance Criteria:**
- Can open betting modal from market card
- Can choose YES or NO position
- Can select blockchain for payment (ETH, SOL, BSC)
- See current price before confirming
- See potential payout information
- See gas/fee estimates for selected chain
- Can confirm or cancel bet
- Transaction sent to selected blockchain
- Bet is recorded and reflected in market statistics
- Transaction hash/signature is displayed

---

### US-3.2: View Current Market Prices
**As a** potential bettor  
**I want** to see current market prices  
**So that** I know what I'll pay for a position

**Acceptance Criteria:**
- Current YES price is displayed
- Current NO price is displayed
- Prices update in real-time (or near real-time)
- Prices are clearly visible and easy to understand
- Price format is consistent (e.g., 0.65 = $0.65)

---

### US-3.3: View Betting History
**As a** user  
**I want** to see my betting history  
**So that** I can track my activity and performance

**Acceptance Criteria:**
- Can view list of all my bets
- Each bet shows:
  - Market question
  - Bet type (YES/NO)
  - Price at time of bet
  - Current status
- History is accessible from profile view

---

## 4. Social Features

### US-4.1: Like a Market
**As a** user  
**I want** to like markets  
**So that** I can show interest and save favorites

**Acceptance Criteria:**
- Can click like button on any market
- Like count increases
- Can unlike a market
- Visual feedback when liking/unliking

---

### US-4.2: Comment on Markets
**As a** user  
**I want** to comment on markets  
**So that** I can discuss and share opinions

**Acceptance Criteria:**
- Can view comments on a market
- Can add a new comment
- Comments display author and timestamp
- Comment count is visible on market card

---

### US-4.3: View Creator Information
**As a** user  
**I want** to see who created a market  
**So that** I can evaluate credibility

**Acceptance Criteria:**
- Creator name and handle are displayed
- Creator avatar is shown
- Verification badge appears for verified creators
- Can click to view creator profile (future feature)

---

## 5. Navigation & Views

### US-5.1: Navigate Between Views
**As a** user  
**I want** to easily navigate between different sections  
**So that** I can access all features

**Views:**
- Home (Feed)
- Explore
- Leaderboard
- Notifications
- Profile
- AI Assistant

**Acceptance Criteria:**
- Navigation is accessible from sidebar (desktop) or bottom nav (mobile)
- Current view is highlighted
- Navigation is intuitive and consistent
- Can switch views quickly without page reload

---

### US-5.2: View Leaderboard
**As a** user  
**I want** to see top traders/users  
**So that** I can see who's performing well

**Acceptance Criteria:**
- Leaderboard displays ranked list of users
- Shows relevant metrics (wins, profit, etc.)
- Rankings update based on performance
- Can view user profiles from leaderboard

---

### US-5.3: View Notifications
**As a** user  
**I want** to see my notifications  
**So that** I stay updated on market activity

**Acceptance Criteria:**
- Notification list is accessible
- Notifications show relevant information
- Can mark notifications as read
- Notification count badge is visible

---

### US-5.4: View My Profile
**As a** user  
**I want** to view my profile  
**So that** I can see my stats and activity

**Acceptance Criteria:**
- Profile displays:
  - User information (name, handle, avatar)
  - Verification status
  - Betting statistics
  - Activity history
- Can navigate back to feed from profile

---

## 6. AI Assistant

### US-6.1: Chat with AI Assistant
**As a** user  
**I want** to chat with an AI assistant  
**So that** I can get help understanding markets and making decisions

**Acceptance Criteria:**
- Can access chat interface from navigation
- Can type messages and send them
- AI responds with helpful information
- Chat history is maintained during session
- Interface is intuitive and easy to use

---

### US-6.2: Get Market Insights
**As a** user  
**I want** to ask the AI about market insights  
**So that** I can make better betting decisions

**Acceptance Criteria:**
- Can ask questions about specific markets
- AI provides relevant analysis
- AI explains market mechanics when asked
- Responses are clear and helpful

---

## 7. Responsive Design

### US-7.1: Use on Mobile Device
**As a** mobile user  
**I want** to use SocialBet on my phone  
**So that** I can bet on markets anywhere

**Acceptance Criteria:**
- Interface is fully functional on mobile
- Navigation is accessible via bottom bar
- All features work on small screens
- Touch interactions are responsive
- Text and buttons are appropriately sized

---

### US-7.2: Use on Desktop
**As a** desktop user  
**I want** to use SocialBet on my computer  
**So that** I can have a full-featured experience

**Acceptance Criteria:**
- Full sidebar navigation is visible
- Right panel with additional info is shown
- Layout utilizes screen space effectively
- All features are easily accessible

---

## 8. Market Information

### US-8.1: See Market Statistics
**As a** user  
**I want** to see market statistics  
**So that** I understand market dynamics

**Statistics Include:**
- YES/NO percentages
- Current prices
- Pool size
- Trading volume
- Number of participants (if available)

**Acceptance Criteria:**
- Statistics are clearly displayed
- Statistics update in real-time (or near real-time)
- Statistics are easy to understand
- Visual indicators (charts, progress bars) help comprehension

---

### US-8.2: Identify Hot Markets
**As a** user  
**I want** to identify trending/hot markets  
**So that I can find popular markets

**Acceptance Criteria:**
- Hot markets are visually distinguished
- Hot markets appear in trending sections
- Hot status is based on activity (volume, engagement)

---

## 9. User Experience

### US-9.1: Fast Loading
**As a** user  
**I want** the app to load quickly  
**So that** I don't waste time waiting

**Acceptance Criteria:**
- Initial load time < 2 seconds
- Navigation between views is instant
- Market data loads quickly
- Smooth scrolling and interactions

---

### US-9.2: Intuitive Interface
**As a** user  
**I want** an intuitive interface  
**So that** I can use the app without training

**Acceptance Criteria:**
- Interface follows familiar social media patterns
- Actions are discoverable
- Feedback is provided for user actions
- Error messages are clear and helpful

---

## 10. Authentication & Account Management

### US-10.1: Connect Web3 Wallet
**As a** user  
**I want** to connect my Web3 wallet (MetaMask, WalletConnect, Phantom, etc.)  
**So that** I can authenticate and make crypto payments

**Acceptance Criteria:**
- Can see wallet connection button
- Modal shows available wallet options for each blockchain
- **Ethereum/BSC:** Can connect MetaMask, WalletConnect, Coinbase Wallet
- **Solana:** Can connect Phantom, Solflare, Backpack
- Wallet address is displayed after connection
- Selected blockchain is clearly shown
- Signature request for authentication
- Connection persists across sessions
- Can connect multiple wallets (one per blockchain)

---

### US-10.2: Social Media Login
**As a** user  
**I want** to log in with my social media account  
**So that** I can quickly access the platform without creating a new account

**Supported Providers:**
- Google
- Twitter/X
- Discord
- GitHub

**Acceptance Criteria:**
- Can see social login buttons
- OAuth flow redirects to provider
- After authorization, returns to app
- Profile data is imported (name, avatar)
- Account is created or linked automatically

---

### US-10.3: Link Multiple Accounts
**As a** user  
**I want** to link multiple authentication methods to my account  
**So that** I can use different login methods flexibly

**Acceptance Criteria:**
- Can link wallet to existing social account
- Can link social account to existing wallet
- Can link wallets from different blockchains (ETH, SOL, BSC)
- All linked accounts shown in profile settings
- Can unlink accounts
- Primary account is clearly indicated

---

### US-10.4: Select Blockchain for Payments
**As a** user  
**I want** to choose which blockchain to use for payments  
**So that** I can use my preferred chain (Ethereum, Solana, or BSC)

**Acceptance Criteria:**
- Can see available blockchain options (ETH, SOL, BSC)
- Can select preferred blockchain in payment modal
- Gas/fee estimates shown for each chain
- Can switch chains before completing payment
- Selected chain is saved as preference
- Supported tokens shown per chain:
  - Ethereum: ETH, USDC, USDT
  - Solana: SOL, USDC (SPL), USDT (SPL)
  - BSC: BNB, USDT, USDC, BUSD

---

### US-10.5: View Multi-Chain Wallet Balances
**As a** user  
**I want** to see my wallet balances across all connected chains  
**So that** I know how much I have available for betting

**Acceptance Criteria:**
- Can view balances for each connected wallet
- Shows native tokens (ETH, SOL, BNB) and major tokens (USDC, USDT)
- Balances update in real-time
- Can see which chain each balance is on
- Total portfolio value displayed (if applicable)

---

## 11. Creator Monetization Features

### US-11.1: Become a Creator
**As a** user  
**I want** to become a creator  
**So that** I can monetize my content and markets

**Acceptance Criteria:**
- Can enable creator mode in profile settings
- Creator verification process (if required)
- Creator badge appears on profile
- Access to creator dashboard/analytics

---

### US-11.2: Create Subscription Tiers
**As a** creator  
**I want** to create subscription tiers with different pricing  
**So that** I can offer different levels of access to my content

**Acceptance Criteria:**
- Can create multiple subscription tiers (e.g., Basic, Premium, VIP)
- Can set monthly price for each tier
- Can set benefits/features for each tier
- Can edit or delete tiers
- Tiers are displayed on creator profile
- Pricing can be in crypto or fiat

---

### US-11.3: Offer Premium Content
**As a** creator  
**I want** to mark content as premium/subscriber-only  
**So that** only my subscribers can access it

**Acceptance Criteria:**
- Can mark markets as premium when creating
- Can set which subscription tier can access content
- Premium content shows lock icon/badge
- Non-subscribers see preview only
- Subscribers can access full content

---

### US-11.4: View Subscription Analytics
**As a** creator  
**I want** to see my subscription analytics  
**So that** I can track my earnings and subscriber growth

**Acceptance Criteria:**
- Can view total subscribers count
- Can see revenue (daily, weekly, monthly)
- Can see subscriber growth over time
- Can see which tiers are most popular
- Can see subscription retention rates

---

### US-11.5: Subscribe to Creator
**As a** user  
**I want** to subscribe to a creator  
**So that** I can access their premium content

**Acceptance Criteria:**
- Can view creator's subscription tiers
- Can select a tier and see pricing
- Can pay with crypto wallet (ETH, SOL, BSC) or fiat
- Can choose blockchain for crypto payments
- Subscription activates immediately after payment confirmation
- Can see active subscriptions in profile
- Auto-renewal is enabled by default (can disable)
- Payment method (blockchain/token) is displayed

---

### US-11.6: Manage Subscriptions
**As a** user  
**I want** to manage my active subscriptions  
**So that** I can cancel or change my subscription level

**Acceptance Criteria:**
- Can view all active subscriptions
- Can see subscription details (tier, price, renewal date)
- Can cancel subscription
- Can upgrade/downgrade subscription tier
- Can enable/disable auto-renewal
- Cancelled subscriptions remain active until period ends

---

### US-11.7: Access Premium Content
**As a** subscriber  
**I want** to access premium content from creators I subscribe to  
**So that** I get value from my subscription

**Acceptance Criteria:**
- Premium content is unlocked for subscribers
- Can see which tier is required for each piece of content
- Can access all content at or below subscription tier
- Premium badge/indicator is visible
- Non-subscribers see preview with subscribe CTA

---

### US-11.8: Pay-Per-View Content
**As a** creator  
**I want** to offer pay-per-view content  
**So that** I can monetize individual pieces of content

**Acceptance Criteria:**
- Can set one-time price for specific content
- Users can purchase access without subscription
- Payment can be crypto or fiat
- Purchased content remains accessible
- Purchase history is tracked

---

## 12. AI Automatic Predictions & Market Generation

### US-12.1: View AI-Generated Markets
**As a** user  
**I want** to see AI-generated prediction markets  
**So that** I can discover new betting opportunities based on current events

**Acceptance Criteria:**
- AI-generated markets are clearly labeled with "AI Generated" badge
- Markets appear in feed alongside user-created markets
- Can see AI's confidence level and reasoning
- Markets are relevant and timely
- Can filter to show only AI-generated markets

---

### US-12.2: View AI Predictions on Markets
**As a** user  
**I want** to see AI predictions on existing markets  
**So that** I can make informed betting decisions

**Acceptance Criteria:**
- AI predictions visible on market cards
- Shows recommended position (YES/NO)
- Displays confidence level (percentage)
- Shows reasoning/analysis
- Predictions update as new information becomes available
- Can view prediction history

---

### US-12.3: Request AI Market Generation
**As a** user  
**I want** to request AI to generate markets on specific topics  
**So that** I can explore new prediction opportunities

**Acceptance Criteria:**
- Can input topic or keyword
- AI generates relevant market questions
- Can review and approve generated markets
- Can edit AI-generated markets before publishing
- Multiple market suggestions provided

---

### US-12.4: View AI Prediction Accuracy
**As a** user  
**I want** to see AI prediction accuracy statistics  
**So that** I can evaluate the reliability of AI predictions

**Acceptance Criteria:**
- Can view overall AI accuracy percentage
- Can see accuracy by category
- Can view historical prediction performance
- Accuracy metrics are transparent and up-to-date
- Shows confidence calibration

---

### US-12.5: AI Automatic Market Updates
**As a** user  
**I want** AI to automatically update predictions as events unfold  
**So that** I have the most current information

**Acceptance Criteria:**
- Predictions update automatically
- Updates are clearly indicated (timestamp)
- Can see what changed and why
- Update frequency is appropriate (not too frequent)
- Historical predictions are preserved

---

## 13. Cross-Platform Experience (OnlyFans-Inspired Design)

### US-13.1: Seamless Desktop Experience
**As a** desktop user  
**I want** an optimized experience for PC  
**So that** I can efficiently browse and interact with markets

**Acceptance Criteria:**
- Three-column layout (sidebar, main, right panel)
- Persistent navigation sidebar
- Keyboard shortcuts work
- Hover effects on interactive elements
- Efficient use of screen space
- Smooth animations and transitions

---

### US-13.2: Optimized Mobile Experience
**As a** mobile user  
**I want** an app-like experience on my phone  
**So that** I can easily use SocialBet on the go

**Acceptance Criteria:**
- Bottom navigation bar (fixed)
- Swipe gestures between views
- Pull-to-refresh functionality
- Touch-friendly button sizes
- Full-width feed optimized for mobile
- Floating action button for quick actions
- Safe area support (notches, etc.)

---

### US-13.3: Install as PWA
**As a** mobile user  
**I want** to install SocialBet as an app  
**So that** I can access it like a native app

**Acceptance Criteria:**
- Can install from browser
- App icon appears on home screen
- Launches in standalone mode (no browser UI)
- Works offline (with cached content)
- Fast loading and smooth performance

---

### US-13.4: Smooth Transitions Between Views
**As a** user  
**I want** smooth transitions when navigating  
**So that** the app feels polished and professional

**Acceptance Criteria:**
- Fade-in animations for content
- Slide transitions between views (mobile)
- Loading states with skeleton screens
- No jarring jumps or layout shifts
- Consistent animation timing

---

### US-13.5: Responsive Design Across Devices
**As a** user  
**I want** the app to work well on any device  
**So that** I can use it regardless of screen size

**Acceptance Criteria:**
- Works on phones (375px+)
- Works on tablets (768px+)
- Works on desktops (1024px+)
- Works on large screens (1440px+)
- Layout adapts appropriately
- Content is readable on all sizes

---

## 14. Cloudflare-Powered Features

### US-14.1: Fast Global Access
**As a** user  
**I want** the app to load quickly from anywhere in the world  
**So that** I have a smooth experience

**Acceptance Criteria:**
- App loads quickly regardless of location
- Market data updates are fast
- Images and media load quickly
- No noticeable latency

---

### US-14.2: AI-Powered Recommendations
**As a** user  
**I want** to receive AI-powered market recommendations  
**So that** I can discover relevant markets

**Acceptance Criteria:**
- Recommendations appear in right panel
- Recommendations are personalized
- Based on betting history and interests
- Updates as preferences change

---

## 15. Instant Messaging

### US-15.1: Send Direct Messages
**As a** user  
**I want** to send direct messages to other users  
**So that** I can communicate privately

**Acceptance Criteria:**
- Can search for users to message
- Can send text messages
- Can send images and files
- Messages deliver in real-time
- Can see read receipts
- Can see typing indicators
- Message history is saved

---

### US-15.2: Create Group Chats
**As a** user  
**I want** to create group chats  
**So that** I can discuss markets with multiple people

**Acceptance Criteria:**
- Can create group with multiple users
- Can add/remove members
- Can set group name and avatar
- All members can send messages
- Group message history is maintained
- Can leave group

---

### US-15.3: Send Voice Messages
**As a** user  
**I want** to send voice messages  
**So that** I can communicate more naturally

**Acceptance Criteria:**
- Can record voice messages
- Can play received voice messages
- Voice messages are clear quality
- Can see duration before sending
- Can cancel recording

---

## 16. Video Conferencing

### US-16.1: Start Video Call
**As a** user  
**I want** to start a video call with another user  
**So that** I can have face-to-face discussions

**Acceptance Criteria:**
- Can initiate video call from profile or chat
- Other user receives call notification
- Can accept or decline call
- Video and audio work properly
- Can mute/unmute audio/video
- Can end call

---

### US-16.2: Join Group Video Conference
**As a** user  
**I want** to join group video conferences  
**So that** I can participate in market discussions

**Acceptance Criteria:**
- Can create group conference room
- Can invite multiple participants
- Can join via link or invitation
- Can see all participants
- Can share screen
- Can chat during conference
- Host can manage participants

---

### US-16.3: Share Screen During Conference
**As a** user  
**I want** to share my screen during video calls  
**So that** I can show market analysis

**Acceptance Criteria:**
- Can start screen sharing
- Can choose which window/screen to share
- Other participants see shared screen
- Can stop screen sharing
- Audio continues during screen share

---

## 17. Token Airdrops

### US-17.1: Receive Registration Airdrop
**As a** new user  
**I want** to receive SOS tokens when I register  
**So that** I can start using the platform

**Acceptance Criteria:**
- Automatically receive airdrop on registration
- Airdrop amount is clearly stated
- Tokens appear in wallet
- Can see airdrop in transaction history
- Notification confirms receipt

---

### US-17.2: Claim Activity-Based Airdrop
**As a** user  
**I want** to claim airdrops based on my activity  
**So that** I'm rewarded for participation

**Acceptance Criteria:**
- Can see available airdrops in profile
- Eligibility criteria is clear
- Can claim eligible airdrops
- Tokens distributed to wallet
- Claim history is tracked

---

### US-17.3: View Airdrop History
**As a** user  
**I want** to view my airdrop history  
**So that** I can track my rewards

**Acceptance Criteria:**
- Can see all received airdrops
- Shows date, amount, and type
- Can see transaction details
- Can filter by airdrop type
- Total airdrop amount displayed

---

## 18. Red Envelope Giveaways

### US-18.1: Create Red Envelope
**As a** user  
**I want** to create a red envelope giveaway  
**So that** I can reward my community

**Acceptance Criteria:**
- Can set total SOS token amount
- Can choose number of recipients
- Can select distribution type (random/equal)
- Can set expiration time
- Can add custom message
- Can set password (optional)
- Can choose visibility (public/group/private)

---

### US-18.2: Claim Red Envelope
**As a** user  
**I want** to claim red envelopes  
**So that** I can receive token rewards

**Acceptance Criteria:**
- Can see available red envelopes
- Can claim if eligible
- Tokens distributed immediately
- Can see claim amount
- Can see remaining amount
- Cannot claim if expired or fully claimed

---

### US-18.3: View Red Envelope Statistics
**As a** creator  
**I want** to see statistics for my red envelopes  
**So that** I can track engagement

**Acceptance Criteria:**
- Can see total created
- Can see total distributed
- Can see average claim amount
- Can see claim rate
- Can see recipient list (if public)

---

## 19. SOS Token Management

### US-19.1: View SOS Token Balance
**As a** user  
**I want** to see my SOS token balance  
**So that** I know how much I have

**Acceptance Criteria:**
- Balance displayed in profile
- Shows balance for each chain (ETH, SOL, BSC)
- Updates in real-time
- Can see transaction history
- Can see balance breakdown (available, staked)

---

### US-19.2: Stake SOS Tokens
**As a** user  
**I want** to stake my SOS tokens  
**So that** I can earn rewards

**Acceptance Criteria:**
- Can stake tokens from wallet
- Can choose lock period (30, 90, 180, 365 days)
- Can see expected APY
- Staked tokens are locked
- Rewards accumulate over time
- Can see staking history

---

### US-19.3: Use SOS Tokens for Betting
**As a** user  
**I want** to use SOS tokens to place bets  
**So that** I can participate in markets

**Acceptance Criteria:**
- Can select SOS as payment method
- Token balance is checked
- Transaction processes on blockchain
- Tokens deducted from balance
- Bet is confirmed

---

### US-19.4: Swap SOS Tokens
**As a** user  
**I want** to swap SOS tokens for other tokens  
**So that** I can manage my portfolio

**Acceptance Criteria:**
- Can swap SOS ↔ ETH/SOL/BNB
- Can swap SOS ↔ USDC/USDT
- Exchange rates shown
- Slippage protection
- Transaction fees displayed
- Swap executes on blockchain

---

## 20. DAO Governance (PC Platform)

### US-20.1: Create Governance Proposal
**As a** DAO member  
**I want** to create a proposal to add SOS tokens to the platform  
**So that** the community can vote on token allocation

**Acceptance Criteria:**
- Can access proposal creation interface (PC platform)
- Can specify token amount to add
- Can select allocation target (liquidity, rewards, operations, etc.)
- Can add proposal title and description
- Proposal requires minimum SOS token threshold
- Can preview proposal before submission
- Proposal is submitted to blockchain

---

### US-20.2: Vote on DAO Proposals
**As a** DAO member  
**I want** to vote on governance proposals  
**So that** I can participate in platform decisions

**Acceptance Criteria:**
- Can view active proposals
- Can see proposal details (amount, target, description)
- Can vote Yes, No, or Abstain
- Voting weight based on SOS token holdings
- Can see current voting results
- Can see time remaining for voting
- Vote is recorded on blockchain

---

### US-20.3: View DAO Token Contribution
**As a** DAO member  
**I want** to view token contributions to the platform  
**So that** I can track how tokens are allocated

**Acceptance Criteria:**
- Can see DAO treasury balance
- Can see platform SOS token balance
- Can view contribution history
- Can see which proposals led to contributions
- Can see transaction details (hash, block number)
- Can filter by allocation target
- Real-time balance updates

---

### US-20.4: Execute Approved Proposal
**As a** DAO member  
**I want** approved proposals to be executed automatically  
**So that** tokens are added to the platform as decided

**Acceptance Criteria:**
- Approved proposals execute after timelock period
- Tokens transferred from DAO treasury to platform
- Transaction confirmed on blockchain
- Platform balance updates automatically
- Notification sent when execution completes
- Execution transaction hash recorded

---

### US-20.5: View DAO Governance Dashboard
**As a** DAO member  
**I want** to view the DAO governance dashboard  
**So that** I can see all governance activity

**Acceptance Criteria:**
- Dashboard shows active proposals
- Shows voting statistics
- Shows DAO treasury and platform balances
- Shows recent contributions
- Shows proposal history
- Shows voting participation rates
- Available on PC platform

---

## 21. Native Applications

### US-21.1: Download Mobile App
**As a** user  
**I want** to download the mobile app  
**So that** I can use SocialBet on my phone

**Acceptance Criteria:**
- Download link available on website
- Can download from App Store (iOS)
- Can download from Play Store (Android)
- Installation instructions provided
- App installs successfully
- Can log in with existing account

---

### US-21.2: Download Desktop App
**As a** user  
**I want** to download the desktop app  
**So that** I can use SocialBet on my computer

**Acceptance Criteria:**
- Download links for Windows, macOS, Linux
- Installation instructions provided
- App installs successfully
- Can log in with existing account
- Auto-update functionality works

---

### US-21.3: Access White Paper
**As a** user  
**I want** to access the platform white paper  
**So that** I can understand the platform and tokenomics

**Acceptance Criteria:**
- White paper link available on website
- Can download PDF version
- Contains token economics
- Contains technical details
- Contains roadmap
- Available in multiple languages (future)

---

## 22. Future Features (Out of Scope v1.0)

### US-21.1: Market Resolution
**As a** user  
**I want** markets to resolve automatically  
**So that** I receive payouts when I win

### US-21.2: Advanced Analytics
**As a** user  
**I want** detailed analytics on my performance  
**So that** I can improve my betting strategy

---

## Story Priority

### High Priority (MVP)
- US-1.1, US-1.2, US-1.3 (Market Discovery)
- US-2.1, US-2.2 (Market Creation)
- US-3.1, US-3.2 (Betting)
- US-5.1 (Navigation)
- US-7.1, US-7.2 (Responsive Design)
- US-10.1, US-10.2 (Authentication - Web3 & Social)
- US-11.1, US-11.2, US-11.3 (Creator Monetization - Basic)
- US-12.1, US-12.2 (AI Predictions - Core)
- US-13.1, US-13.2 (Cross-Platform Design)
- US-15.1, US-15.2 (Instant Messaging - Core)
- US-17.1, US-17.2 (Token Airdrops - Core)
- US-19.1, US-19.3 (SOS Token - Core)
- US-20.1, US-20.2, US-20.3 (DAO Governance - Core, PC Platform)

### Medium Priority
- US-4.1, US-4.2, US-4.3 (Social Features)
- US-5.2, US-5.3, US-5.4 (Additional Views)
- US-6.1, US-6.2 (AI Assistant)
- US-8.1, US-8.2 (Market Information)
- US-10.3 (Account Linking)
- US-11.4, US-11.5, US-11.6, US-11.7 (Subscription Management)
- US-12.3, US-12.4, US-12.5 (AI Predictions - Advanced)
- US-13.3, US-13.4, US-13.5 (Cross-Platform - Enhanced)
- US-14.1, US-14.2 (Cloudflare Features)
- US-15.3 (Voice Messages)
- US-16.1, US-16.2 (Video Conferencing - Core)
- US-18.1, US-18.2 (Red Envelopes - Core)
- US-19.2, US-19.4 (SOS Token - Advanced)
- US-20.4, US-20.5 (DAO Governance - Advanced)
- US-21.1, US-21.2 (Native Apps)

### Low Priority
- US-3.3 (Betting History - detailed)
- US-9.1, US-9.2 (Performance optimizations)
- US-11.8 (Pay-Per-View Content)
- US-16.3 (Screen Sharing)
- US-17.3 (Airdrop History)
- US-18.3 (Red Envelope Statistics)
- US-20.3 (White Paper Access)

---

## Definition of Done

A user story is considered "Done" when:
- ✅ All acceptance criteria are met
- ✅ Code is reviewed and merged
- ✅ Feature works on all target devices
- ✅ No critical bugs exist
- ✅ UI/UX matches design specifications
- ✅ TypeScript types are properly defined
- ✅ Component is properly tested (when testing is implemented)

