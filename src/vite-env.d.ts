/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Chain Configuration
  readonly VITE_DEFAULT_CHAIN?: string;
  readonly VITE_SEPOLIA_RPC_URL?: string;
  readonly VITE_ETH_MAINNET_RPC_URL?: string;
  readonly VITE_MOON_ISLAND_RPC_URL?: string;
  readonly VITE_MOON_ISLAND_CHAIN_ID?: string;
  readonly VITE_MOON_ISLAND_BLOCK_EXPLORER?: string;
  
  // Solana Configuration
  readonly VITE_SOLANA_RPC_URL?: string;
  readonly VITE_SOUL_TOKEN_SOLANA?: string;
  
  // Smart Contract Addresses
  readonly VITE_SOUL_TOKEN_SEPOLIA?: string;
  readonly VITE_SOUL_TOKEN_MAINNET?: string;
  readonly VITE_SOUL_TOKEN_LOCAL?: string;
  readonly VITE_SOUL_GOVERNOR_LOCAL?: string;
  readonly VITE_SOUL_TIMELOCK_LOCAL?: string;
  readonly VITE_PREDICTION_MARKET_SEPOLIA?: string;
  readonly VITE_PREDICTION_MARKET_MAINNET?: string;
  readonly VITE_PREDICTION_MARKET_LOCAL?: string;
  
  // Web3Auth Configuration
  readonly VITE_WEB3AUTH_CLIENT_ID?: string;
  readonly VITE_WEB3AUTH_NETWORK?: string;
  
  // API Configuration
  readonly VITE_API_URL?: string;
  readonly VITE_FRONTEND_URL?: string;
  
  // Fiat On-Ramp API Keys
  readonly VITE_MOONPAY_API_KEY?: string;
  readonly VITE_TRANSAK_API_KEY?: string;
  readonly VITE_RAMP_API_KEY?: string;
  
  // AI Configuration
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
