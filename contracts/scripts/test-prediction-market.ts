import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0x04fC67aA613253Ec04d90426Dd61365415861b2f";
    const [signer] = await ethers.getSigners();
    
    console.log("Testing PredictionMarket contract...");
    console.log("Contract:", contractAddress);
    console.log("Signer:", signer.address);
    console.log("");
    
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const market = PredictionMarket.attach(contractAddress);
    
    try {
        // Test 1: Get market count
        console.log("Test 1: Get market count...");
        const count = await market.getMarketCount();
        console.log("✅ Market count:", count.toString());
        
        // Test 2: Get platform fee
        console.log("\nTest 2: Get platform fee...");
        const fee = await market.PLATFORM_FEE_BPS();
        console.log("✅ Platform fee:", fee.toString(), "bps (2.5%)");
        
        // Test 3: Get payment token
        console.log("\nTest 3: Get payment token...");
        const paymentToken = await market.paymentToken();
        console.log("✅ Payment token:", paymentToken);
        
        // Test 4: Get min/max bet
        console.log("\nTest 4: Get bet limits...");
        const minBet = await market.MIN_BET_AMOUNT();
        const maxBet = await market.MAX_BET_AMOUNT();
        console.log("✅ Min bet:", ethers.formatEther(minBet), "tokens");
        console.log("✅ Max bet:", ethers.formatEther(maxBet), "tokens");
        
        console.log("\n✅ All contract read functions working!");
        
    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
