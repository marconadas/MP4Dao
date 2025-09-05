import { ethers } from "hardhat";
import { WorkRegistry } from "../typechain-types";

async function main() {
  console.log("🚀 Iniciando deploy do Mp4Dao WorkRegistry...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`📍 Network: ${network.name} (${network.chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  
  // Deploy WorkRegistry
  console.log("\n📜 Deploying WorkRegistry contract...");
  
  const WorkRegistryFactory = await ethers.getContractFactory("WorkRegistry");
  const workRegistry = await WorkRegistryFactory.deploy(deployer.address);
  
  await workRegistry.waitForDeployment();
  const workRegistryAddress = await workRegistry.getAddress();
  
  console.log(`✅ WorkRegistry deployed to: ${workRegistryAddress}`);
  
  // Configurações iniciais
  console.log("\n⚙️ Setting up initial configuration...");
  
  try {
    // Definir taxas iniciais
    const registrationFee = ethers.parseEther("0.001"); // 0.001 ETH (~$2.50)
    const disputeFee = ethers.parseEther("0.01");      // 0.01 ETH (~$25)
    
    console.log(`💰 Setting registration fee: ${ethers.formatEther(registrationFee)} ETH`);
    console.log(`⚖️ Setting dispute fee: ${ethers.formatEther(disputeFee)} ETH`);
    
    const setFeesTx = await workRegistry.setFees(registrationFee, disputeFee);
    await setFeesTx.wait();
    
    console.log("✅ Fees configured successfully");
    
    // Verificar configuração
    const currentRegFee = await workRegistry.registrationFee();
    const currentDispFee = await workRegistry.disputeFee();
    
    console.log(`📊 Current registration fee: ${ethers.formatEther(currentRegFee)} ETH`);
    console.log(`📊 Current dispute fee: ${ethers.formatEther(currentDispFee)} ETH`);
    
  } catch (error) {
    console.error("❌ Error during configuration:", error);
  }
  
  // Informações de verificação
  console.log("\n🔍 Contract Verification Info:");
  console.log(`Network: ${network.name}`);
  console.log(`Contract Address: ${workRegistryAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  
  // Salvar endereços para uso posterior
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: workRegistryAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    registrationFee: ethers.formatEther(await workRegistry.registrationFee()),
    disputeFee: ethers.formatEther(await workRegistry.disputeFee()),
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Comandos para verificação
  if (network.chainId === 80002n || network.chainId === 137n) {
    console.log("\n🔍 To verify contract on PolygonScan:");
    console.log(`npx hardhat verify --network ${network.name === "unknown" ? "amoy" : network.name} ${workRegistryAddress} "${deployer.address}"`);
  }
  
  console.log("\n✨ Deploy completed successfully!");
  console.log("🎵 Mp4Dao is ready to revolutionize music copyright in Angola! 🇦🇴");
}

// Executar deploy com tratamento de erros
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy failed:", error);
    process.exit(1);
  });
