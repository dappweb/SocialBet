import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const network = await ethers.provider.getNetwork();
    console.log("Deploying CPMM Prediction Market to:", network.name, "Chain ID:", network.chainId);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    console.log("\n📦 Deploying CPMM Prediction Market Contract...\n");

    // Configuration - Use native ETH for payment
    const useNativeToken = true;
    const paymentToken = ethers.ZeroAddress; // Use native ETH
    console.log("Payment Token: Native ETH");
    const feeRecipient = deployer.address;

    console.log("\n1. Deploying PredictionMarketCPMM...");
    const PredictionMarketCPMM = await ethers.getContractFactory("PredictionMarketCPMM");
    const predictionMarket = await PredictionMarketCPMM.deploy(
        paymentToken,
        feeRecipient,
        deployer.address // Owner
    );
    await predictionMarket.waitForDeployment();

    const marketAddress = await predictionMarket.getAddress();
    console.log("   ✅ PredictionMarketCPMM deployed to:", marketAddress);

    // Get contract info
    console.log("\n2. Contract Information:");
    console.log("   Payment Token:", paymentToken === ethers.ZeroAddress ? "Native ETH" : paymentToken);
    console.log("   Fee Recipient:", feeRecipient);
    console.log("   Owner:", deployer.address);
    console.log("   Fee:", await predictionMarket.FEE_BPS(), "bps (2%)");
    console.log("   Max Slippage:", await predictionMarket.MAX_SLIPPAGE_BPS(), "bps (10%)");
    console.log("   Min Liquidity:", ethers.formatEther(await predictionMarket.MIN_LIQUIDITY()), "tokens");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        contracts: {
            PredictionMarketCPMM: marketAddress,
        },
        configuration: {
            paymentToken: paymentToken,
            useNativeToken: useNativeToken,
            feeRecipient: feeRecipient,
            feeBps: "200", // 2%
            maxSlippageBps: "1000", // 10%
        },
        features: [
            "CPMM (Constant Product Market Maker)",
            "Slippage Protection",
            "Price Impact Calculation",
            "Dynamic Pricing (x * y = k)",
        ],
        timestamp: new Date().toISOString(),
    };

    // Save to file
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `prediction-market-cpmm-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\nDeployment info saved to:", deploymentFile);

    // Update .env.local
    const envFile = path.join(__dirname, "../../.env.local");
    const envVar = "VITE_PREDICTION_MARKET_CPMM_SEPOLIA";
    
    if (fs.existsSync(envFile)) {
        let envContent = fs.readFileSync(envFile, "utf-8");
        envContent = envContent.replace(new RegExp(`^${envVar}=.*$`, "m"), "");
        envContent += `\n${envVar}=${marketAddress}\n`;
        fs.writeFileSync(envFile, envContent);
        console.log(`Added ${envVar} to .env.local`);
    } else {
        fs.writeFileSync(envFile, `${envVar}=${marketAddress}\n`);
        console.log(`Created .env.local with ${envVar}`);
    }

    console.log("\n✅ CPMM Deployment complete!");
    console.log("\n🎯 Contract Address:");
    console.log("==================");
    console.log("PredictionMarketCPMM:", marketAddress);
    
    console.log("\n📊 CPMM Algorithm Features:");
    console.log("- Constant Product: x * y = k");
    console.log("- Slippage Protection: Max 10%");
    console.log("- Fee: 2% per trade");
    console.log("- Price Impact: Calculated per trade");

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend with VITE_PREDICTION_MARKET_CPMM_SEPOLIA");
    console.log("2. Update predictionMarketService.ts to use new contract");
    console.log("3. Test market creation with CPMM pricing");

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
