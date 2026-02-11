import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying Molfi Perpetual DEX...\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // 1. Deploy ChainlinkOracle
    console.log("📡 Deploying ChainlinkOracle...");
    const ChainlinkOracle = await ethers.getContractFactory("ChainlinkOracle");
    const oracle = await ChainlinkOracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("✅ ChainlinkOracle deployed to:", oracleAddress);

    // 2. Deploy MolfiPerpDEX
    console.log("\n💱 Deploying MolfiPerpDEX...");
    const MolfiPerpDEX = await ethers.getContractFactory("MolfiPerpDEX");
    const perpDex = await MolfiPerpDEX.deploy(oracleAddress);
    await perpDex.waitForDeployment();
    const perpDexAddress = await perpDex.getAddress();
    console.log("✅ MolfiPerpDEX deployed to:", perpDexAddress);

    // 3. Configure price feeds (Monad Testnet addresses - UPDATE THESE!)
    console.log("\n⚙️  Configuring price feeds...");

    // NOTE: Replace these with actual Chainlink feed addresses for Monad Testnet
    // These are placeholder addresses - you need to get the real ones
    const BTC_USD_FEED = "0x0000000000000000000000000000000000000001"; // PLACEHOLDER
    const ETH_USD_FEED = "0x0000000000000000000000000000000000000002"; // PLACEHOLDER

    console.log("Setting BTC/USDT feed...");
    await oracle.setPriceFeed("BTC/USDT", BTC_USD_FEED);
    console.log("✅ BTC/USDT feed configured");

    console.log("Setting ETH/USDT feed...");
    await oracle.setPriceFeed("ETH/USDT", ETH_USD_FEED);
    console.log("✅ ETH/USDT feed configured");

    // 4. Verify deployments
    console.log("\n🔍 Verifying deployments...");

    const hasBTCFeed = await oracle.hasPriceFeed("BTC/USDT");
    const hasETHFeed = await oracle.hasPriceFeed("ETH/USDT");

    console.log("BTC/USDT feed configured:", hasBTCFeed);
    console.log("ETH/USDT feed configured:", hasETHFeed);

    // 5. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("ChainlinkOracle:", oracleAddress);
    console.log("MolfiPerpDEX:", perpDexAddress);
    console.log("=".repeat(60));

    console.log("\n📝 Add these to your .env.local:");
    console.log(`NEXT_PUBLIC_CHAINLINK_ORACLE=${oracleAddress}`);
    console.log(`NEXT_PUBLIC_PERP_DEX=${perpDexAddress}`);

    console.log("\n⚠️  IMPORTANT: Update Chainlink feed addresses in the deployment script!");
    console.log("   Find real feed addresses at: https://docs.chain.link/data-feeds/price-feeds/addresses");

    console.log("\n✅ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
