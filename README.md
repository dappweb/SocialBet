# KOL Market - KOL Social Intent Prediction Market

<div align="center">
<img width="1200" height="475" alt="KOL Market Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A decentralized KOL (Key Opinion Leader) social intent prediction market platform where predicted intents are incorporated into AI avatars (digital souls) and can be injected into robots. Users can predict, discover, and bet on KOL intentions across multiple categories.

## 🌟 Vision

KOL Market bridges the gap between social prediction markets and AI avatar technology:
- **Predict KOL Intent**: Bet on what influencers will do next
- **AI Avatar Creation**: Generate digital souls from KOL prediction data
- **Robot Integration**: Inject AI avatars into physical robots

## 📚 Documentation

Comprehensive project documentation is available in the [`docs/`](./docs/) directory:

- **[Execution Plan](./docs/EXECUTION_PLAN.md)** - Current status, completed features, and roadmap
- **[Requirements](./docs/requirements/REQUIREMENTS.md)** - Complete functional and non-functional requirements
- **[Technical Specifications](./docs/technical/TECHNICAL_SPEC.md)** - Architecture, tech stack, and implementation details
- **[User Stories](./docs/user-stories/USER_STORIES.md)** - User-centric feature descriptions and acceptance criteria
- **[Documentation Index](./docs/README.md)** - Overview of all documentation

## 🌐 Live Deployment

- **Production Frontend**: https://kolmarket.ai
- **Backend API**: https://api.kolmarket.ai
- **API Health Check**: https://api.kolmarket.ai/health

### Smart Contracts (Sepolia Testnet)
- **SOUL Token Contract**: `0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66`
- **Block Explorer**: https://sepolia.etherscan.io/address/0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66

## 🚀 Quick Start

### Prerequisites
- Node.js (latest LTS version recommended)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the project root and add your configuration:
   ```env
   VITE_DEFAULT_CHAIN=sepolia
   VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   VITE_SOUL_TOKEN_SEPOLIA=0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66
   VITE_API_URL=https://api.kolmarket.ai
   VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## 📦 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy:sepolia` - Deploy contracts to Sepolia testnet
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production (monthly only)

## 🛠️ Technology Stack

- **Frontend:** React 18.3.1 + TypeScript 5.9.3
- **Build Tool:** Vite 7.3.1
- **Styling:** Tailwind CSS 4.1.18
- **AI Integration:** Google Gemini API 1.34.0
- **Icons:** Lucide React 0.562.0
- **Web3:** Wagmi 3.2.0 + Viem 2.43.5
- **Solana:** @solana/web3.js 1.98.4 + @coral-xyz/anchor 0.32.1

## 📁 Project Structure

```
SoulCast/
├── components/          # React components
├── docs/               # Project documentation
│   ├── requirements/   # Requirements documents
│   ├── technical/      # Technical specifications
│   └── user-stories/   # User stories
├── public/             # Static assets
└── ...                 # Configuration files
```

## 🎯 Features

- **Intent Prediction Feed:** Browse KOL intent prediction markets in a social media-like feed
- **Market Creation:** Create new prediction markets for KOL intentions
- **Prediction:** Place YES/NO bets on KOL intent markets with real-time pricing
- **AI Avatar System:** Generate digital souls from KOL prediction data
- **Robot Integration:** API for injecting AI avatars into physical robots
- **Social Features:** Like, comment, and engage with markets
- **AI Assistant:** Chat with AI for market insights and KOL analysis
- **Responsive Design:** Works seamlessly on mobile and desktop
- **Multiple Categories:** Crypto, Sports, Pop Culture, Politics, Tech

## 💰 SOUL Token

The SOUL token powers the SoulCast ecosystem:
- **Total Supply:** 2.1 billion SOUL
- **Use Cases:** Intent prediction, AI avatar creation, governance, staking
- **Multi-Chain:** Ethereum, Solana, BSC

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the project maintainers.

## 📚 Additional Documentation

- **[Deployment Guide](./DEPLOYMENT_COMPLETE.md)** - Complete deployment status
- **[Testing Report](./TESTING_REPORT.md)** - Testing results and checklist
- **[Performance Monitoring](./PERFORMANCE_MONITORING.md)** - Performance metrics
- **[Contract Documentation](./CONTRACT_DOCUMENTATION.md)** - Smart contract details
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
