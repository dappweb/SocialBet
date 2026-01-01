<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SocialBet - Prediction Market Feed

A decentralized social prediction market feed platform where users can create, discover, and bet on real-world outcomes across multiple categories including Crypto, Sports, Pop Culture, Politics, and Tech.

View your app in AI Studio: https://ai.studio/apps/drive/1zSxZ5A3StMHBNCmaPbDWNL-8tkM3UwcN

## 📚 Documentation

Comprehensive project documentation is available in the [`docs/`](./docs/) directory:

- **[Requirements](./docs/requirements/REQUIREMENTS.md)** - Complete functional and non-functional requirements
- **[Technical Specifications](./docs/technical/TECHNICAL_SPEC.md)** - Architecture, tech stack, and implementation details
- **[User Stories](./docs/user-stories/USER_STORIES.md)** - User-centric feature descriptions and acceptance criteria
- **[Documentation Index](./docs/README.md)** - Overview of all documentation

## 🚀 Quick Start

### Prerequisites
- Node.js (latest LTS version recommended)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the project root and add your Gemini API key:
   ```
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

## 🛠️ Technology Stack

- **Frontend:** React 18.3.1 + TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS 4.1.17
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React

## 📁 Project Structure

```
SocialBet/
├── components/          # React components
├── docs/               # Project documentation
│   ├── requirements/   # Requirements documents
│   ├── technical/      # Technical specifications
│   └── user-stories/   # User stories
├── public/             # Static assets
└── ...                 # Configuration files
```

## 🎯 Features

- **Market Feed:** Browse prediction markets in a social media-like feed
- **Market Creation:** Create new prediction markets with custom parameters
- **Betting:** Place YES/NO bets on markets with real-time pricing
- **Social Features:** Like, comment, and engage with markets
- **AI Assistant:** Chat with AI for market insights and assistance
- **Responsive Design:** Works seamlessly on mobile and desktop
- **Multiple Categories:** Crypto, Sports, Pop Culture, Politics, Tech

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the project maintainers.
