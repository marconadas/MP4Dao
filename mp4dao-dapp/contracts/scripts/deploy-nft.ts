import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MusicNFT contract...");

  // Obter contas
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Endereços necessários (ajustar conforme necessário)
  const workRegistryAddress = process.env.WORK_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
  const feeRecipientAddress = process.env.FEE_RECIPIENT_ADDRESS || deployer.address;
  
  if (workRegistryAddress === "0x0000000000000000000000000000000000000000") {
    console.warn("⚠️  WORK_REGISTRY_ADDRESS not set, using zero address");
  }

  // Deploy do contrato MusicNFT
  const MusicNFT = await ethers.getContractFactory("MusicNFT");
  const musicNFT = await MusicNFT.deploy(
    workRegistryAddress,
    feeRecipientAddress,
    deployer.address
  );

  await musicNFT.deployed();

  console.log("✅ MusicNFT deployed to:", musicNFT.address);
  console.log("   - WorkRegistry:", workRegistryAddress);
  console.log("   - Fee Recipient:", feeRecipientAddress);
  console.log("   - Owner:", deployer.address);

  // Se o WorkRegistry foi fornecido, configurá-lo para usar o contrato NFT
  if (workRegistryAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      const WorkRegistry = await ethers.getContractFactory("WorkRegistry");
      const workRegistry = WorkRegistry.attach(workRegistryAddress);
      
      console.log("Configuring WorkRegistry to use MusicNFT...");
      const tx = await workRegistry.setMusicNFTContract(musicNFT.address);
      await tx.wait();
      
      console.log("✅ WorkRegistry configured to use MusicNFT");
    } catch (error) {
      console.error("❌ Error configuring WorkRegistry:", error);
    }
  }

  // Verificar configuração
  console.log("\n📋 Contract Configuration:");
  console.log("   - Platform Fee:", await musicNFT.platformFeeBps(), "bps");
  console.log("   - Default Royalties:", await musicNFT.defaultRoyaltiesBps(), "bps");
  console.log("   - Fee Recipient:", await musicNFT.feeRecipient());

  // Salvar endereços para uso posterior
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    musicNFTAddress: musicNFT.address,
    workRegistryAddress: workRegistryAddress,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instruções de verificação
  console.log("\n🔍 To verify the contract on Etherscan:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${musicNFT.address} "${workRegistryAddress}" "${feeRecipientAddress}" "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
