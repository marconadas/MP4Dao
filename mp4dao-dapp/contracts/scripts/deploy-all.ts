import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MP4DAO Smart Contracts...\n");

  // Obter contas
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy WorkRegistry
  console.log("1️⃣  Deploying WorkRegistry...");
  const WorkRegistry = await ethers.getContractFactory("WorkRegistry");
  const workRegistry = await WorkRegistry.deploy(deployer.address);
  await workRegistry.waitForDeployment();
  console.log("✅ WorkRegistry deployed to:", await workRegistry.getAddress());

  // 2. Deploy MusicNFT
  console.log("\n2️⃣  Deploying MusicNFT...");
  const feeRecipientAddress = process.env.FEE_RECIPIENT_ADDRESS || deployer.address;
  
  const MusicNFT = await ethers.getContractFactory("MusicNFT");
  const musicNFT = await MusicNFT.deploy(
    await workRegistry.getAddress(),
    feeRecipientAddress,
    deployer.address
  );
  await musicNFT.waitForDeployment();
  console.log("✅ MusicNFT deployed to:", await musicNFT.getAddress());

  // 3. Configurar integração entre contratos
  console.log("\n3️⃣  Configuring contract integration...");
  
  // Configurar WorkRegistry para usar MusicNFT
  const setNFTTx = await workRegistry.setMusicNFTContract(await musicNFT.getAddress());
  await setNFTTx.wait();
  console.log("✅ WorkRegistry configured to use MusicNFT");

  // Configurar auto-mint
  const autoMintTx = await workRegistry.setAutoMintNFT(true);
  await autoMintTx.wait();
  console.log("✅ Auto-mint NFT enabled");

  // 4. Configurações adicionais
  console.log("\n4️⃣  Additional configurations...");
  
  // Configurar taxas se necessário
  const registrationFee = ethers.parseEther("0.001"); // 0.001 ETH
  const disputeFee = ethers.parseEther("0.01"); // 0.01 ETH
  
  const setFeesTx = await workRegistry.setFees(registrationFee, disputeFee);
  await setFeesTx.wait();
  console.log("✅ Fees configured:", {
    registration: ethers.formatEther(registrationFee),
    dispute: ethers.formatEther(disputeFee)
  });

  // 5. Verificar configurações
  console.log("\n5️⃣  Verifying configurations...");
  
  const workCount = await workRegistry.workCount();
  const nftContract = await workRegistry.musicNFTContract();
  const autoMint = await workRegistry.autoMintNFT();
  const platformFee = await musicNFT.platformFeeBps();
  const defaultRoyalties = await musicNFT.defaultRoyaltiesBps();

  console.log("📋 Contract Status:");
  console.log("   - WorkRegistry works count:", workCount.toString());
  console.log("   - NFT contract address:", nftContract);
  console.log("   - Auto-mint enabled:", autoMint);
  console.log("   - Platform fee:", platformFee.toString(), "bps");
  console.log("   - Default royalties:", defaultRoyalties.toString(), "bps");

  // 6. Deployment summary
  const network = await ethers.provider.getNetwork();
  const workRegistryAddress = await workRegistry.getAddress();
  const musicNFTAddress = await musicNFT.getAddress();
  
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contracts: {
      WorkRegistry: {
        address: workRegistryAddress,
        owner: deployer.address,
      },
      MusicNFT: {
        address: musicNFTAddress,
        workRegistry: workRegistryAddress,
        feeRecipient: feeRecipientAddress,
        owner: deployer.address,
      },
    },
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasUsed: {
      // Seria calculado em implementação real
      total: "TBD"
    }
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 7. Verification commands
  console.log("\n🔍 Verification Commands:");
  console.log("WorkRegistry:");
  console.log(`npx hardhat verify --network ${network.name} ${workRegistryAddress} "${deployer.address}"`);
  
  console.log("\nMusicNFT:");
  console.log(`npx hardhat verify --network ${network.name} ${musicNFTAddress} "${workRegistryAddress}" "${feeRecipientAddress}" "${deployer.address}"`);

  // 8. Environment variables for frontend
  console.log("\n🔧 Environment Variables for Frontend:");
  console.log(`NEXT_PUBLIC_WORK_REGISTRY_ADDRESS=${workRegistryAddress}`);
  console.log(`NEXT_PUBLIC_MUSIC_NFT_ADDRESS=${musicNFTAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${network.chainId}`);

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
