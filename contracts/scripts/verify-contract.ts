import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66";
    const [signer] = await ethers.getSigners();
    
    console.log("🔍 Verifying Contract Functionality");
    console.log("=====================================");
    console.log("Contract Address:", contractAddress);
    console.log("Using Account:", signer.address);
    console.log("Account Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");
    console.log("");
    
    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        console.log("❌ Contract not found at address");
        return;
    }
    console.log("✅ Contract exists at address");
    console.log("");
    
    // Try to load contract ABI and interact
    try {
        // Get contract factory
        const SoulCastToken = await ethers.getContractFactory("SoulCastToken");
        const contract = SoulCastToken.attach(contractAddress);
        
        // Try to read contract state
        console.log("📊 Reading Contract State:");
        console.log("---------------------------");
        
        try {
            const name = await contract.name();
            console.log("✅ Token Name:", name);
        } catch (e: any) {
            console.log("⚠️  Could not read name:", e.message);
        }
        
        try {
            const symbol = await contract.symbol();
            console.log("✅ Token Symbol:", symbol);
        } catch (e: any) {
            console.log("⚠️  Could not read symbol:", e.message);
        }
        
        try {
            const totalSupply = await contract.totalSupply();
            console.log("✅ Total Supply:", ethers.formatEther(totalSupply), "SOUL");
        } catch (e: any) {
            console.log("⚠️  Could not read totalSupply:", e.message);
        }
        
        try {
            const balance = await contract.balanceOf(signer.address);
            console.log("✅ Deployer Balance:", ethers.formatEther(balance), "SOUL");
        } catch (e: any) {
            console.log("⚠️  Could not read balance:", e.message);
        }
        
        console.log("");
        console.log("✅ Contract verification complete!");
        console.log("Note: Contract may need initialization if functions are not accessible");
        
    } catch (error: any) {
        console.log("⚠️  Error interacting with contract:", error.message);
        console.log("This may indicate the contract needs initialization");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });






