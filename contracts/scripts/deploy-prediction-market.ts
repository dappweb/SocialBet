import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log("Deploying Prediction Market contracts to:", network.name, "Chain ID:", network.chainId);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Get SOUL token address from environment
    const soulTokenAddress = process.env.SOUL_TOKEN_ADDRESS || process.env.VITE_SOUL_TOKEN_SEPOLIA || "";
    if (!soulTokenAddress) {
        console.error("❌ SOUL_TOKEN_ADDRESS or VITE_SOUL_TOKEN_SEPOLIA not set in environment");
        console.log("Please set it in .env.local:");
        console.log("VITE_SOUL_TOKEN_SEPOLIA=0x...");
        process.exit(1);
    }

    console.log("\n📦 Deploying Prediction Market Contract...\n");
    console.log("SOUL Token Address:", soulTokenAddress);

    // Deploy PredictionMarket contract
    // Using SOUL token as payment token, or use native ETH (address(0))
    const useNativeToken = false; // Set to true to use ETH instead of SOUL
    const paymentToken = useNativeToken ? ethers.ZeroAddress : soulTokenAddress;
    const platformFeeRecipient = deployer.address; // Platform fee recipient

    console.log("\n1. Deploying PredictionMarket...");
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const predictionMarket = await PredictionMarket.deploy(
        paymentToken,
        platformFeeRecipient,
        deployer.address // Owner
    );
    await predictionMarket.waitForDeployment();

    const marketAddress = await predictionMarket.getAddress();
    console.log("   ✅ PredictionMarket deployed to:", marketAddress);

    // Get contract info
    console.log("\n2. Contract Information:");
    console.log("   Payment Token:", paymentToken === ethers.ZeroAddress ? "Native ETH" : paymentToken);
    console.log("   Platform Fee Recipient:", platformFeeRecipient);
    console.log("   Owner:", deployer.address);
    console.log("   Platform Fee:", await predictionMarket.PLATFORM_FEE_BPS(), "bps (2.5%)");
    console.log("   Min Bet:", ethers.formatEther(await predictionMarket.MIN_BET_AMOUNT()), "tokens");
    console.log("   Max Bet:", ethers.formatEther(await predictionMarket.MAX_BET_AMOUNT()), "tokens");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        contracts: {
            PredictionMarket: marketAddress,
        },
        configuration: {
            paymentToken: paymentToken,
            useNativeToken: useNativeToken,
            platformFeeRecipient: platformFeeRecipient,
            platformFeeBps: "250", // 2.5%
        },
        timestamp: new Date().toISOString(),
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `prediction-market-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\nDeployment info saved to:", deploymentFile);

    // Also update .env.local
    const envFile = path.join(__dirname, "../../.env.local");
    const envVar = "VITE_PREDICTION_MARKET_SEPOLIA";
    
    if (fs.existsSync(envFile)) {
        let envContent = fs.readFileSync(envFile, "utf-8");
        
        // Remove old entry if exists
        envContent = envContent.replace(new RegExp(`^${envVar}=.*$`, "m"), "");
        
        // Add new entry
        envContent += `\n${envVar}=${marketAddress}\n`;
        
        fs.writeFileSync(envFile, envContent);
        console.log(`Added ${envVar} to .env.local`);
    } else {
        fs.writeFileSync(envFile, `${envVar}=${marketAddress}\n`);
        console.log(`Created .env.local with ${envVar}`);
    }

    console.log("\n✅ Deployment complete!");
    console.log("\nContract Addresses:");
    console.log("==================");
    console.log("PredictionMarket:", marketAddress);
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend .env with VITE_PREDICTION_MARKET_SEPOLIA");
    console.log("2. Integrate contract into frontend services");
    console.log("3. Test market creation and betting");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

