import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying SOUL Token contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy SOUL Token
    console.log("\n1. Deploying SoulCastToken...");
    const SoulCastToken = await ethers.getContractFactory("SoulCastToken");
    const soulToken = await SoulCastToken.deploy(deployer.address);
    await soulToken.waitForDeployment();

    const tokenAddress = await soulToken.getAddress();
    console.log("   SoulCastToken deployed to:", tokenAddress);

    // Get token stats
    const stats = await soulToken.getTokenStats();
    console.log("\n   Token Statistics:");
    console.log("   - Total Supply:", ethers.formatEther(stats[0]), "SOUL");
    console.log("   - Circulating Supply:", ethers.formatEther(stats[1]), "SOUL");
    console.log("   - Total Staked:", ethers.formatEther(stats[2]), "SOUL");
    console.log("   - Total Burned:", ethers.formatEther(stats[3]), "SOUL");

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
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        contracts: {
            SoulCastToken: tokenAddress,
        },
        timestamp: new Date().toISOString(),
    };

    console.log("\nDeployment Info:", JSON.stringify(deploymentInfo, null, 2));

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
