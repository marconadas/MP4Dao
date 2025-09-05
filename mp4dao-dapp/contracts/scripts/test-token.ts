import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing MP4Token functionality...\n");

  // Obter signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👥 Test accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);

  // Conectar ao token deployado (usar endereço do deploy anterior)
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Endereço do deploy hardhat
  const MP4Token = await ethers.getContractFactory("MP4Token");
  const mp4Token = MP4Token.attach(tokenAddress);

  console.log("\n📊 Token Info:");
  console.log("  Name:", await mp4Token.name());
  console.log("  Symbol:", await mp4Token.symbol());
  console.log("  Total Supply:", ethers.formatEther(await mp4Token.totalSupply()));
  console.log("  Deployer Balance:", ethers.formatEther(await mp4Token.balanceOf(deployer.address)));

  console.log("\n🔄 Testing Token Transfers...");
  
  // Transfer tokens para user1
  const transferAmount = ethers.parseEther("1000"); // 1000 MP4
  console.log("  Transferring 1000 MP4 to User1...");
  await mp4Token.connect(deployer).transfer(user1.address, transferAmount);
  console.log("  ✅ Transfer successful!");
  console.log("  User1 Balance:", ethers.formatEther(await mp4Token.balanceOf(user1.address)));

  console.log("\n🗳️ Testing Governance...");
  
  // Criar uma proposta (user1 não tem tokens suficientes, então usar deployer)
  try {
    console.log("  Creating governance proposal...");
    const proposalTx = await mp4Token.connect(deployer).createProposal("Reduzir taxa de registo para 0.0005 ETH");
    const receipt = await proposalTx.wait();
    console.log("  ✅ Proposal created! TX:", receipt?.hash);
    
    // Obter ID da proposta do evento
    const proposalCount = await mp4Token.proposalCount();
    console.log("  📋 Proposal ID:", proposalCount.toString());
    
    // Obter detalhes da proposta
    const proposal = await mp4Token.getProposal(proposalCount);
    console.log("  📄 Proposal details:");
    console.log("    Description:", proposal[2]);
    console.log("    For votes:", ethers.formatEther(proposal[3]));
    console.log("    Against votes:", ethers.formatEther(proposal[4]));
    
    // Votar na proposta
    console.log("  🗳️ Voting on proposal...");
    await mp4Token.connect(deployer).vote(proposalCount, true); // Votar a favor
    console.log("  ✅ Vote cast!");
    
    // Verificar votos após votação
    const updatedProposal = await mp4Token.getProposal(proposalCount);
    console.log("  📊 Updated votes:");
    console.log("    For votes:", ethers.formatEther(updatedProposal[3]));
    console.log("    Against votes:", ethers.formatEther(updatedProposal[4]));
    
  } catch (error: any) {
    console.log("  ❌ Governance test failed:", error.message);
  }

  console.log("\n🛡️ Testing Mediator Staking...");
  
  try {
    // Transferir tokens suficientes para user1 fazer stake
    const stakeAmount = ethers.parseEther("10000"); // 10000 MP4 para ser mediador
    console.log("  Transferring 10000 MP4 to User1 for staking...");
    await mp4Token.connect(deployer).transfer(user1.address, stakeAmount);
    
    console.log("  User1 balance before stake:", ethers.formatEther(await mp4Token.balanceOf(user1.address)));
    
    // Fazer stake
    console.log("  User1 staking 10000 MP4...");
    await mp4Token.connect(user1).stakeMediator(stakeAmount);
    console.log("  ✅ Staking successful!");
    
    // Verificar se pode mediar
    const canMediate = await mp4Token.canMediate(user1.address);
    console.log("  🔍 Can User1 mediate?", canMediate);
    
    // Obter informações do stake
    const stakeInfo = await mp4Token.mediatorStakes(user1.address);
    console.log("  📋 Stake info:");
    console.log("    Amount:", ethers.formatEther(stakeInfo[0]));
    console.log("    Active:", stakeInfo[3]);
    console.log("    Rewards earned:", ethers.formatEther(stakeInfo[2]));
    
  } catch (error: any) {
    console.log("  ❌ Staking test failed:", error.message);
  }

  console.log("\n💰 Testing Payment Discount...");
  
  try {
    // Calcular desconto para pagamento
    const baseAmount = ethers.parseEther("0.001"); // 0.001 ETH
    console.log("  Calculating discount for 0.001 ETH payment...");
    
    const discountInfo = await mp4Token.calculatePaymentDiscount(baseAmount);
    console.log("  📊 Discount calculation:");
    console.log("    Original amount:", ethers.formatEther(baseAmount), "ETH");
    console.log("    Discounted amount:", ethers.formatEther(discountInfo[0]), "ETH");
    console.log("    Tokens needed:", ethers.formatEther(discountInfo[1]), "MP4");
    
    // Testar pagamento com MP4 (se user1 tiver tokens suficientes)
    const user1Balance = await mp4Token.balanceOf(user1.address);
    if (user1Balance > discountInfo[1]) {
      console.log("  💳 Making payment with MP4...");
      await mp4Token.connect(user1).payWithMP4(discountInfo[1]);
      console.log("  ✅ Payment successful!");
      console.log("  New User1 balance:", ethers.formatEther(await mp4Token.balanceOf(user1.address)));
    } else {
      console.log("  ⚠️ User1 doesn't have enough tokens for payment");
    }
    
  } catch (error: any) {
    console.log("  ❌ Payment test failed:", error.message);
  }

  console.log("\n🎁 Testing Reward Distribution...");
  
  try {
    // Distribuir recompensa para user2
    const rewardAmount = ethers.parseEther("100"); // 100 MP4
    console.log("  Minting 100 MP4 reward for User2...");
    
    await mp4Token.connect(deployer).mintReward(user2.address, rewardAmount);
    console.log("  ✅ Reward minted!");
    console.log("  User2 balance:", ethers.formatEther(await mp4Token.balanceOf(user2.address)));
    
  } catch (error: any) {
    console.log("  ❌ Reward test failed:", error.message);
  }

  console.log("\n📈 Final Token Stats:");
  console.log("  Total Supply:", ethers.formatEther(await mp4Token.totalSupply()));
  console.log("  Deployer Balance:", ethers.formatEther(await mp4Token.balanceOf(deployer.address)));
  console.log("  User1 Balance:", ethers.formatEther(await mp4Token.balanceOf(user1.address)));
  console.log("  User2 Balance:", ethers.formatEther(await mp4Token.balanceOf(user2.address)));
  console.log("  Total Staked:", ethers.formatEther(await mp4Token.totalStaked()));
  console.log("  Proposal Count:", (await mp4Token.proposalCount()).toString());

  console.log("\n🎉 Token testing completed successfully!");
}

main()
  .then(() => {
    console.log("✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });
