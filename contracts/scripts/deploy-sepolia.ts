import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log("Deploying to network:", network.name, "Chain ID:", network.chainId);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying SOUL Token contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy SOUL Token
    console.log("\n1. Deploying SoulCastToken...");
    const SoulCastToken = await ethers.getContractFactory("SoulCastToken");
    
    // Deploy the implementation contract first
    const soulTokenImpl = await SoulCastToken.deploy();
    await soulTokenImpl.waitForDeployment();
    const implAddress = await soulTokenImpl.getAddress();
    console.log("   Implementation deployed to:", implAddress);

    // Initialize the token (must be done during deployment for upgradeable contracts)
    console.log("\n2. Initializing token...");
    try {
        const initTx = await soulTokenImpl.initialize(deployer.address);
        await initTx.wait();
        console.log("   Token initialized");
    } catch (error: any) {
        // If already initialized, that's okay
        if (error.message?.includes('InvalidInitialization') || error.message?.includes('already initialized')) {
            console.log("   Token already initialized, continuing...");
        } else {
            throw error;
        }
    }

    const tokenAddress = implAddress;
    
    // Get the contract instance for queries
    const soulToken = await ethers.getContractAt("SoulCastToken", tokenAddress);

    // Get token stats
    const stats = await soulToken.getTokenStats();
    console.log("\n   Token Statistics:");
    console.log("   - Total Supply:", ethers.formatEther(stats[0]), "SOUL");
    console.log("   - Circulating Supply:", ethers.formatEther(stats[1]), "SOUL");
    console.log("   - Total Staked:", ethers.formatEther(stats[2]), "SOUL");
    console.log("   - Total Burned:", ethers.formatEther(stats[3]), "SOUL");
    console.log("   - Issuance Fee Burned:", ethers.formatEther(stats[4]), "SOUL");
    console.log("   - Staking Rewards Pool:", ethers.formatEther(stats[5]), "SOUL");

    // Log allocation info
    console.log("\n   Token Allocations:");
    const allocationCount = await soulToken.allocationCount();
    for (let i = 0; i < allocationCount; i++) {
        const allocation = await soulToken.getAllocation(i);
        console.log(`   ${i + 1}. ${allocation[0]}: ${ethers.formatEther(allocation[1])} SOUL`);
    }

    console.log("\n✅ Deployment complete!");
    console.log("\nContract Addresses:");
    console.log("==================");
    console.log("SoulCastToken:", tokenAddress);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        contracts: {
            SoulCastToken: tokenAddress,
        },
        timestamp: new Date().toISOString(),
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\nDeployment info saved to:", deploymentFile);

    // Also save to .env format
    const envContent = `VITE_SOUL_TOKEN_SEPOLIA=${tokenAddress}\n`;
    const envFile = path.join(__dirname, "../../.env.local");
    if (fs.existsSync(envFile)) {
        const existingEnv = fs.readFileSync(envFile, "utf-8");
        if (!existingEnv.includes("VITE_SOUL_TOKEN_SEPOLIA")) {
            fs.appendFileSync(envFile, envContent);
            console.log("Added SOUL token address to .env.local");
        }
    } else {
        fs.writeFileSync(envFile, envContent);
        console.log("Created .env.local with SOUL token address");
    }

    console.log("\nDeployment Info:", JSON.stringify(deploymentInfo, null, 2));

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

