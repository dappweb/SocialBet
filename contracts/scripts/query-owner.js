// Simple script to query contract owner using public RPC
const { ethers } = require("ethers");

const SOUL_TOKEN_ADDRESS = "0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

// Minimal ABI for querying
const ABI = [
    "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
];

async function main() {
    console.log("🔍 Querying SOUL Token Contract Owner");
    console.log("Contract:", SOUL_TOKEN_ADDRESS);
    console.log("Network: Sepolia Testnet\n");

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(SOUL_TOKEN_ADDRESS, ABI, provider);

    try {
        // Get DEFAULT_ADMIN_ROLE
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        console.log("✅ DEFAULT_ADMIN_ROLE:", adminRole);
        console.log("");

        // Get total supply to verify contract is initialized
        const totalSupply = await contract.totalSupply();
        console.log("✅ Total Supply:", ethers.formatEther(totalSupply), "SOUL");
        console.log("");

        console.log("💡 To find the admin address:");
        console.log("1. Check Etherscan for the contract creation transaction");
        console.log("2. Look at the 'initialize' transaction - the sender is the admin");
        console.log("3. Or check the first transaction that minted tokens");
        console.log("\n🔗 Etherscan URLs:");
        console.log(`   Contract: https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}`);
        console.log(`   Transactions: https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}#internaltx`);
        console.log(`   Read Contract: https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}#readContract`);
        console.log("\n📝 Note: The admin is the address that called 'initialize()' during deployment");
        console.log("   This address received all 2.1 billion SOUL tokens and all admin roles.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("\n💡 Alternative: Check Etherscan directly");
        console.log(`https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}`);
    }
}

main().catch(console.error);

