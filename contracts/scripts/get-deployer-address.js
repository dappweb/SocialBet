// Get deployer address from private key
const { ethers } = require("ethers");

const PRIVATE_KEY = "b24a73b993f8836a9279b9ae6c3a693ef2cc4a0731d4ec900cd96e93614dfac2";

// Ensure private key has 0x prefix
const privateKeyWithPrefix = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY;

// Create wallet from private key
const wallet = new ethers.Wallet(privateKeyWithPrefix);

console.log("🔑 Deployer Account Information");
console.log("================================\n");
console.log("Private Key:", PRIVATE_KEY);
console.log("Address:", wallet.address);
console.log("\n✅ This is the SOUL Token Contract Owner/Admin");
console.log("\n📋 Details:");
console.log("  - This address called initialize() during deployment");
console.log("  - Received all 2.1 billion SOUL tokens");
console.log("  - Has DEFAULT_ADMIN_ROLE and all other roles");
console.log("  - Can mint, burn, manage fees, upgrade contract, etc.");
console.log("\n🔗 Check on Etherscan:");
console.log(`  https://sepolia.etherscan.io/address/${wallet.address}`);

