import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("Deploying SoulCast Governance System");
    console.log("Network:", network.name);
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // 1. Deploy SoulCastToken
    console.log("\n1. Deploying SoulCastToken...");
    const SoulCastToken = await ethers.getContractFactory("SoulCastToken");
    // Initialize with deployer as admin
    const soulToken = await upgrades.deployProxy(SoulCastToken, [deployer.address], {
        kind: "uups",
        initializer: "initialize",
    });
    await soulToken.waitForDeployment();
    const tokenAddress = await soulToken.getAddress();
    console.log("   ✅ SoulCastToken deployed to:", tokenAddress);

    // 2. Deploy SoulCastTimelock
    console.log("\n2. Deploying SoulCastTimelock...");
    const SoulCastTimelock = await ethers.getContractFactory("SoulCastTimelock");
    // Initialize with:
    // minDelay = 0 (for testing) or 1 day (86400)
    // proposers = [] (will add Governor later)
    // executors = [] (will add anyone later)
    // admin = deployer
    const minDelay = 0; // Set to 0 for testing convenience, change for prod
    const soulTimelock = await upgrades.deployProxy(
        SoulCastTimelock, 
        [minDelay, [], [], deployer.address], 
        { kind: "uups" }
    );
    await soulTimelock.waitForDeployment();
    const timelockAddress = await soulTimelock.getAddress();
    console.log("   ✅ SoulCastTimelock deployed to:", timelockAddress);

    // 3. Deploy SoulCastGovernor
    console.log("\n3. Deploying SoulCastGovernor...");
    const SoulCastGovernor = await ethers.getContractFactory("SoulCastGovernor");
    const soulGovernor = await upgrades.deployProxy(
        SoulCastGovernor,
        [tokenAddress, timelockAddress],
        { kind: "uups" }
    );
    await soulGovernor.waitForDeployment();
    const governorAddress = await soulGovernor.getAddress();
    console.log("   ✅ SoulCastGovernor deployed to:", governorAddress);

    // 4. Setup Governance Roles
    console.log("\n4. Setting up Governance Roles...");
    
    // Timelock roles
    const PROPOSER_ROLE = ethers.id("PROPOSER_ROLE");
    const EXECUTOR_ROLE = ethers.id("EXECUTOR_ROLE");
    const TIMELOCK_ADMIN_ROLE = ethers.id("TIMELOCK_ADMIN_ROLE");

    // Grant Proposer role to Governor
    console.log("   Granting Proposer role to Governor...");
    await soulTimelock.grantRole(PROPOSER_ROLE, governorAddress);
    
    // Grant Executor role to address(0) (allows anyone to execute)
    console.log("   Granting Executor role to anyone...");
    await soulTimelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);

    // (Optional) Revoke admin role from deployer so only Governor can control Timelock
    // console.log("   Revoking Admin role from deployer...");
    // await soulTimelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);

    console.log("\n✅ Deployment & Setup Complete!");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        contracts: {
            SoulCastToken: tokenAddress,
            SoulCastTimelock: timelockAddress,
            SoulCastGovernor: governorAddress,
        },
        timestamp: new Date().toISOString(),
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    const deploymentFile = path.join(deploymentsDir, `governance-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\nDeployment info saved to: ${deploymentFile}`);

    // Update .env.local if deploying to a persistent network
    // Note: We don't overwrite .env.local blindly, but we can log what to add
    console.log("\nUpdate your .env.local with:");
    console.log(`VITE_SOUL_TOKEN_${network.name.toUpperCase()}=${tokenAddress}`);
    console.log(`VITE_SOUL_GOVERNOR_${network.name.toUpperCase()}=${governorAddress}`);
    console.log(`VITE_SOUL_TIMELOCK_${network.name.toUpperCase()}=${timelockAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
