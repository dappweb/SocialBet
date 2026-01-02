import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log("Deploying fundraising contracts to:", network.name, "Chain ID:", network.chainId);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Get SOUL token address from environment or previous deployment
    const soulTokenAddress = process.env.SOUL_TOKEN_ADDRESS || "";
    if (!soulTokenAddress) {
        console.error("❌ SOUL_TOKEN_ADDRESS not set. Deploy SOUL token first.");
        process.exit(1);
    }

    console.log("\n📦 Deploying Fundraising Contracts...\n");

    // 1. Deploy Token Sale Contract
    console.log("1. Deploying SoulTokenSale...");
    const SoulTokenSale = await ethers.getContractFactory("SoulTokenSale");
    
    // Sale configuration
    const paymentToken = ethers.ZeroAddress; // Use ETH
    const softCap = ethers.parseEther("500"); // 500 ETH
    const hardCap = ethers.parseEther("5000"); // 5000 ETH
    const tokenPrice = ethers.parseEther("0.000025"); // 0.000025 ETH per SOUL (assuming ETH = $2000, SOUL = $0.05)
    const minPurchase = ethers.parseEther("0.005"); // 0.005 ETH minimum
    const maxPurchase = ethers.parseEther("50"); // 50 ETH maximum per wallet

    const tokenSale = await SoulTokenSale.deploy(
        soulTokenAddress,
        paymentToken,
        softCap,
        hardCap,
        tokenPrice,
        minPurchase,
        maxPurchase,
        deployer.address
    );
    await tokenSale.waitForDeployment();
    const tokenSaleAddress = await tokenSale.getAddress();
    console.log("   ✅ SoulTokenSale deployed to:", tokenSaleAddress);

    // 2. Deploy Vesting Contract
    console.log("\n2. Deploying SoulVesting...");
    const SoulVesting = await ethers.getContractFactory("SoulVesting");
    const vesting = await SoulVesting.deploy(soulTokenAddress, deployer.address);
    await vesting.waitForDeployment();
    const vestingAddress = await vesting.getAddress();
    console.log("   ✅ SoulVesting deployed to:", vestingAddress);

    // 3. Deploy Liquidity Manager
    console.log("\n3. Deploying SoulLiquidityManager...");
    const SoulLiquidityManager = await ethers.getContractFactory("SoulLiquidityManager");
    const liquidityManager = await SoulLiquidityManager.deploy(soulTokenAddress, deployer.address);
    await liquidityManager.waitForDeployment();
    const liquidityManagerAddress = await liquidityManager.getAddress();
    console.log("   ✅ SoulLiquidityManager deployed to:", liquidityManagerAddress);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        soulToken: soulTokenAddress,
        contracts: {
            SoulTokenSale: tokenSaleAddress,
            SoulVesting: vestingAddress,
            SoulLiquidityManager: liquidityManagerAddress,
        },
        configuration: {
            tokenSale: {
                softCap: ethers.formatEther(softCap),
                hardCap: ethers.formatEther(hardCap),
                tokenPrice: ethers.formatEther(tokenPrice),
                minPurchase: ethers.formatEther(minPurchase),
                maxPurchase: ethers.formatEther(maxPurchase),
            },
        },
        timestamp: new Date().toISOString(),
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `fundraising-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentFile);

    // Update .env.local
    const envContent = `
# Fundraising Contracts
VITE_TOKEN_SALE_CONTRACT=${tokenSaleAddress}
VITE_VESTING_CONTRACT=${vestingAddress}
VITE_LIQUIDITY_MANAGER_CONTRACT=${liquidityManagerAddress}
`;
    const envFile = path.join(__dirname, "../../.env.local");
    if (fs.existsSync(envFile)) {
        const existingEnv = fs.readFileSync(envFile, "utf-8");
        if (!existingEnv.includes("VITE_TOKEN_SALE_CONTRACT")) {
            fs.appendFileSync(envFile, envContent);
            console.log("✅ Added contract addresses to .env.local");
        }
    }

    console.log("\n✅ Fundraising Contracts Deployment Complete!");
    console.log("\nContract Addresses:");
    console.log("==================");
    console.log("SoulTokenSale:", tokenSaleAddress);
    console.log("SoulVesting:", vestingAddress);
    console.log("SoulLiquidityManager:", liquidityManagerAddress);
    console.log("\n📋 Next Steps:");
    console.log("   1. Transfer SOUL tokens to SoulTokenSale contract");
    console.log("   2. Configure whitelist for private sale");
    console.log("   3. Start the token sale");
    console.log("   4. Set up liquidity pools after sale");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

