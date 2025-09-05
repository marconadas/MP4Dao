import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MP4Token...");

  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy do MP4Token
  const MP4Token = await ethers.getContractFactory("MP4Token");
  
  // Supply inicial: 20 milhões de tokens (20% do supply máximo)
  const initialSupply = ethers.parseEther("20000000"); // 20M tokens
  
  console.log("Deploying MP4Token with initial supply:", ethers.formatEther(initialSupply));
  
  const mp4Token = await MP4Token.deploy(
    deployer.address, // initialOwner
    initialSupply      // initialSupply
  );

  await mp4Token.waitForDeployment();
  const tokenAddress = await mp4Token.getAddress();

  console.log("✅ MP4Token deployed to:", tokenAddress);
  console.log("📊 Token Details:");
  console.log("  - Name:", await mp4Token.name());
  console.log("  - Symbol:", await mp4Token.symbol());
  console.log("  - Decimals:", await mp4Token.decimals());
  console.log("  - Total Supply:", ethers.formatEther(await mp4Token.totalSupply()));
  console.log("  - Max Supply:", ethers.formatEther(await mp4Token.MAX_SUPPLY()));
  console.log("  - Owner:", await mp4Token.owner());

  // Verificar se existe WorkRegistry deployado para integração
  const networkName = (await ethers.provider.getNetwork()).name;
  console.log("🌐 Network:", networkName);

  // Salvar endereços para uso posterior
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`MP4Token: ${tokenAddress}`);
  console.log("=".repeat(50));

  // Verificar balance do deployer
  const deployerBalance = await mp4Token.balanceOf(deployer.address);
  console.log(`💰 Deployer MP4 Balance: ${ethers.formatEther(deployerBalance)}`);

  return {
    mp4Token: tokenAddress,
    deployer: deployer.address
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((addresses) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
