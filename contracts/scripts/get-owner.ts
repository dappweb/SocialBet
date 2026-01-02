import { ethers } from "hardhat";

async function main() {
    const SOUL_TOKEN_ADDRESS = "0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66";
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    console.log("Querying SOUL Token Contract:", SOUL_TOKEN_ADDRESS);
    console.log("");

    // Get contract instance
    const SoulCastToken = await ethers.getContractFactory("SoulCastToken");
    const soulToken = SoulCastToken.attach(SOUL_TOKEN_ADDRESS);

    try {
        // Get DEFAULT_ADMIN_ROLE
        const DEFAULT_ADMIN_ROLE = await soulToken.DEFAULT_ADMIN_ROLE();
        console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
        console.log("");

        // Try to get owner (if contract has owner function)
        try {
            const owner = await soulToken.owner();
            console.log("✅ Contract Owner (via owner()):", owner);
        } catch (e) {
            console.log("ℹ️  Contract doesn't have owner() function (uses AccessControl)");
        }

        // Get all roles
        console.log("\n📋 Role Identifiers:");
        console.log("MINTER_ROLE:", await soulToken.MINTER_ROLE());
        console.log("BURNER_ROLE:", await soulToken.BURNER_ROLE());
        console.log("STAKING_ROLE:", await soulToken.STAKING_ROLE());
        console.log("FEE_MANAGER_ROLE:", await soulToken.FEE_MANAGER_ROLE());
        console.log("UPGRADER_ROLE:", await soulToken.UPGRADER_ROLE());
        console.log("");

        // Check who has DEFAULT_ADMIN_ROLE
        // We need to check common addresses or get from events
        console.log("🔍 Checking admin role holders...");
        
        // Get contract creation transaction to find deployer
        const code = await ethers.provider.getCode(SOUL_TOKEN_ADDRESS);
        if (code === "0x") {
            console.log("❌ Contract not found at this address");
            return;
        }

        // Try to get from contract events or check initialization
        // Since we can't easily enumerate role holders, let's check the deployment transaction
        console.log("\n💡 To find the admin address:");
        console.log("1. Check Etherscan for the contract creation transaction");
        console.log("2. Look at the 'initialize' transaction");
        console.log("3. The address that called 'initialize' is the admin");
        console.log("\n🔗 Etherscan URL:");
        console.log(`https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}`);
        console.log(`https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}#readContract`);

        // Try to get total supply to verify contract is initialized
        try {
            const totalSupply = await soulToken.totalSupply();
            console.log("\n✅ Contract is initialized");
            console.log("Total Supply:", ethers.formatEther(totalSupply), "SOUL");
        } catch (e) {
            console.log("\n⚠️  Could not read totalSupply - contract may not be initialized");
        }

    } catch (error: any) {
        console.error("Error querying contract:", error.message);
        console.log("\n💡 Alternative: Check Etherscan directly");
        console.log(`https://sepolia.etherscan.io/address/${SOUL_TOKEN_ADDRESS}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

