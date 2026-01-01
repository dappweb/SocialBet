import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config({ path: '../.env.local' });

// Handle private key format - strip 0x prefix if present
const getPrivateKey = () => {
    const key = process.env.PRIVATE_KEY;
    if (!key) {
        throw new Error("PRIVATE_KEY is not set in .env.local");
    }
    // Remove 0x prefix if present
    return key.startsWith('0x') ? key.slice(2) : key;
};

const PRIVATE_KEY = process.env.PRIVATE_KEY ? getPrivateKey() : undefined;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: "cancun",
        },
    },
    networks: {
        // Local development
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hardhat: {
            chainId: 31337,
        },

        // Ethereum
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 11155111,
        },
        mainnet: {
            url: process.env.ETH_MAINNET_RPC_URL || "https://eth.llamarpc.com",
            accounts: [PRIVATE_KEY],
            chainId: 1,
        },

        // BSC (Binance Smart Chain)
        bsc: {
            url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
            accounts: [PRIVATE_KEY],
            chainId: 56,
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts: [PRIVATE_KEY],
            chainId: 97,
        },

        // Moon Island ETH Testnet
        moonisland: {
            url: process.env.MOON_ISLAND_RPC_URL || "https://rpc.moonisland.eth",
            accounts: [PRIVATE_KEY],
            chainId: parseInt(process.env.MOON_ISLAND_CHAIN_ID || "0x123456", 16),
        },
    },

    etherscan: {
        apiKey: {
            mainnet: ETHERSCAN_API_KEY,
            sepolia: ETHERSCAN_API_KEY,
            bsc: BSCSCAN_API_KEY,
            bscTestnet: BSCSCAN_API_KEY,
        },
    },

    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
    },
};

export default config;
