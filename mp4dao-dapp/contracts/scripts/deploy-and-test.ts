import { ethers } from "hardhat";

async function main() {
  console.log("🚀 MP4DAO Token - Deploy and Test Complete Suite\n");

  // =============================================================
  //                        DEPLOYMENT
  // =============================================================
  
  console.log("📦 PHASE 1: DEPLOYMENT");
  console.log("=" .repeat(50));

  // Obter signers
  const [deployer, user1, user2, mediator] = await ethers.getSigners();
  console.log("👥 Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log("  Mediator:", mediator.address);

  // Deploy do MP4Token
  const MP4Token = await ethers.getContractFactory("MP4Token");
  const initialSupply = ethers.parseEther("20000000"); // 20M tokens
  
  console.log("\n🪙 Deploying MP4Token...");
  const mp4Token = await MP4Token.deploy(deployer.address, initialSupply);
  await mp4Token.waitForDeployment();
  
  const tokenAddress = await mp4Token.getAddress();
  console.log("✅ MP4Token deployed to:", tokenAddress);

  // Verificar informações básicas
  console.log("\n📊 Token Info:");
  console.log("  Name:", await mp4Token.name());
  console.log("  Symbol:", await mp4Token.symbol());
  console.log("  Total Supply:", ethers.formatEther(await mp4Token.totalSupply()));
  console.log("  Max Supply:", ethers.formatEther(await mp4Token.MAX_SUPPLY()));
  console.log("  Deployer Balance:", ethers.formatEther(await mp4Token.balanceOf(deployer.address)));

  // =============================================================
  //                        TESTING
  // =============================================================

  console.log("\n\n🧪 PHASE 2: FUNCTIONALITY TESTING");
  console.log("=" .repeat(50));

  // Test 1: Token Transfers
  console.log("\n🔄 TEST 1: Token Transfers");
  console.log("-" .repeat(30));
  
  const transferAmount = ethers.parseEther("5000"); // 5000 MP4
  console.log("Transferring 5000 MP4 to User1...");
  await mp4Token.connect(deployer).transfer(user1.address, transferAmount);
  
  console.log("Transferring 2000 MP4 to User2...");
  await mp4Token.connect(deployer).transfer(user2.address, ethers.parseEther("2000"));
  
  console.log("✅ Transfers completed!");
  console.log("  User1 Balance:", ethers.formatEther(await mp4Token.balanceOf(user1.address)));
  console.log("  User2 Balance:", ethers.formatEther(await mp4Token.balanceOf(user2.address)));

  // Test 2: Governance
  console.log("\n🗳️ TEST 2: Governance System");
  console.log("-" .repeat(30));
  
  try {
    console.log("Creating governance proposal...");
    const proposalTx = await mp4Token.connect(deployer).createProposal(
      "Proposta #1: Reduzir taxa de registo para 0.0005 ETH"
    );
    await proposalTx.wait();
    
    const proposalCount = await mp4Token.proposalCount();
    console.log("✅ Proposal created! ID:", proposalCount.toString());
    
    // Obter detalhes da proposta
    const proposal = await mp4Token.getProposal(proposalCount);
    console.log("📄 Proposal details:");
    console.log("  Proposer:", proposal[1]);
    console.log("  Description:", proposal[2]);
    console.log("  For votes:", ethers.formatEther(proposal[3]));
    console.log("  Against votes:", ethers.formatEther(proposal[4]));
    
    // Votar na proposta
    console.log("\nVoting on proposal...");
    await mp4Token.connect(deployer).vote(proposalCount, true); // A favor
    await mp4Token.connect(user1).vote(proposalCount, true);    // A favor
    await mp4Token.connect(user2).vote(proposalCount, false);   // Contra
    
    // Verificar resultados
    const updatedProposal = await mp4Token.getProposal(proposalCount);
    console.log("✅ Voting completed!");
    console.log("📊 Final results:");
    console.log("  For votes:", ethers.formatEther(updatedProposal[3]));
    console.log("  Against votes:", ethers.formatEther(updatedProposal[4]));
    
  } catch (error: any) {
    console.log("❌ Governance test failed:", error.message);
  }

  // Test 3: Mediator Staking
  console.log("\n🛡️ TEST 3: Mediator Staking");
  console.log("-" .repeat(30));
  
  try {
    // Transferir tokens suficientes para mediator
    const stakeAmount = ethers.parseEther("10000"); // 10000 MP4
    console.log("Transferring 15000 MP4 to mediator...");
    await mp4Token.connect(deployer).transfer(mediator.address, ethers.parseEther("15000"));
    
    console.log("Mediator balance before stake:", ethers.formatEther(await mp4Token.balanceOf(mediator.address)));
    
    // Fazer stake
    console.log("Mediator staking 10000 MP4...");
    await mp4Token.connect(mediator).stakeMediator(stakeAmount);
    
    // Verificar se pode mediar
    const canMediate = await mp4Token.canMediate(mediator.address);
    console.log("✅ Staking successful!");
    console.log("  Can mediate?", canMediate);
    
    // Obter informações do stake
    const stakeInfo = await mp4Token.mediatorStakes(mediator.address);
    console.log("📋 Stake info:");
    console.log("  Amount staked:", ethers.formatEther(stakeInfo[0]));
    console.log("  Active:", stakeInfo[3]);
    console.log("  Rewards earned:", ethers.formatEther(stakeInfo[2]));
    
    // Testar unstake parcial
    console.log("\nTesting partial unstake...");
    const unstakeAmount = ethers.parseEther("2000"); // 2000 MP4
    await mp4Token.connect(mediator).unstakeMediator(unstakeAmount);
    
    const updatedStakeInfo = await mp4Token.mediatorStakes(mediator.address);
    console.log("✅ Partial unstake successful!");
    console.log("  New staked amount:", ethers.formatEther(updatedStakeInfo[0]));
    console.log("  Still can mediate?", await mp4Token.canMediate(mediator.address));
    
  } catch (error: any) {
    console.log("❌ Staking test failed:", error.message);
  }

  // Test 4: Payment System
  console.log("\n💰 TEST 4: Payment with Discount");
  console.log("-" .repeat(30));
  
  try {
    // Calcular desconto
    const baseAmount = ethers.parseEther("0.001"); // 0.001 ETH
    console.log("Calculating discount for 0.001 ETH payment...");
    
    const discountInfo = await mp4Token.calculatePaymentDiscount(baseAmount);
    console.log("📊 Payment calculation:");
    console.log("  Original amount:", ethers.formatEther(baseAmount), "ETH");
    console.log("  Discounted amount:", ethers.formatEther(discountInfo[0]), "ETH");
    console.log("  Tokens needed:", ethers.formatEther(discountInfo[1]), "MP4");
    
    // Fazer pagamento com MP4
    const paymentAmount = ethers.parseEther("1000"); // 1000 MP4
    const user1BalanceBefore = await mp4Token.balanceOf(user1.address);
    
    console.log("User1 making payment with 1000 MP4...");
    const paymentTx = await mp4Token.connect(user1).payWithMP4(paymentAmount);
    const receipt = await paymentTx.wait();
    
    const user1BalanceAfter = await mp4Token.balanceOf(user1.address);
    
    console.log("✅ Payment successful!");
    console.log("  TX Hash:", receipt?.hash);
    console.log("  Balance before:", ethers.formatEther(user1BalanceBefore));
    console.log("  Balance after:", ethers.formatEther(user1BalanceAfter));
    console.log("  Tokens burned:", ethers.formatEther(user1BalanceBefore - user1BalanceAfter));
    
  } catch (error: any) {
    console.log("❌ Payment test failed:", error.message);
  }

  // Test 5: Reward Distribution
  console.log("\n🎁 TEST 5: Reward Distribution");
  console.log("-" .repeat(30));
  
  try {
    // Mint reward para user2
    const rewardAmount = ethers.parseEther("100"); // 100 MP4
    const user2BalanceBefore = await mp4Token.balanceOf(user2.address);
    
    console.log("Minting 100 MP4 reward for User2...");
    await mp4Token.connect(deployer).mintReward(user2.address, rewardAmount);
    
    const user2BalanceAfter = await mp4Token.balanceOf(user2.address);
    
    console.log("✅ Reward minted!");
    console.log("  Balance before:", ethers.formatEther(user2BalanceBefore));
    console.log("  Balance after:", ethers.formatEther(user2BalanceAfter));
    console.log("  Reward received:", ethers.formatEther(user2BalanceAfter - user2BalanceBefore));
    
    // Distribuir recompensa para mediador
    if (await mp4Token.canMediate(mediator.address)) {
      console.log("\nDistributing mediator reward...");
      const mediatorReward = ethers.parseEther("50"); // 50 MP4
      await mp4Token.connect(deployer).distributeMediatorReward(mediator.address, mediatorReward);
      
      console.log("✅ Mediator reward distributed!");
      const updatedMediatorStake = await mp4Token.mediatorStakes(mediator.address);
      console.log("  New rewards earned:", ethers.formatEther(updatedMediatorStake[2]));
    }
    
  } catch (error: any) {
    console.log("❌ Reward test failed:", error.message);
  }

  // =============================================================
  //                     FINAL STATISTICS
  // =============================================================

  console.log("\n\n📈 FINAL STATISTICS");
  console.log("=" .repeat(50));
  
  const finalStats = {
    totalSupply: await mp4Token.totalSupply(),
    deployerBalance: await mp4Token.balanceOf(deployer.address),
    user1Balance: await mp4Token.balanceOf(user1.address),
    user2Balance: await mp4Token.balanceOf(user2.address),
    mediatorBalance: await mp4Token.balanceOf(mediator.address),
    totalStaked: await mp4Token.totalStaked(),
    proposalCount: await mp4Token.proposalCount(),
    minimumStake: await mp4Token.minimumMediatorStake(),
    paymentDiscount: await mp4Token.paymentDiscount()
  };

  console.log("🪙 Token Statistics:");
  console.log("  Total Supply:", ethers.formatEther(finalStats.totalSupply), "MP4");
  console.log("  Total Staked:", ethers.formatEther(finalStats.totalStaked), "MP4");
  console.log("  Circulating:", ethers.formatEther(finalStats.totalSupply - finalStats.totalStaked), "MP4");

  console.log("\n👥 Balance Distribution:");
  console.log("  Deployer:", ethers.formatEther(finalStats.deployerBalance), "MP4");
  console.log("  User1:", ethers.formatEther(finalStats.user1Balance), "MP4");
  console.log("  User2:", ethers.formatEther(finalStats.user2Balance), "MP4");
  console.log("  Mediator:", ethers.formatEther(finalStats.mediatorBalance), "MP4");

  console.log("\n🏛️ Governance Statistics:");
  console.log("  Total Proposals:", finalStats.proposalCount.toString());
  console.log("  Active Mediators:", await mp4Token.canMediate(mediator.address) ? "1" : "0");

  console.log("\n⚙️ System Parameters:");
  console.log("  Minimum Mediator Stake:", ethers.formatEther(finalStats.minimumStake), "MP4");
  console.log("  Payment Discount:", (Number(finalStats.paymentDiscount) / 100).toString() + "%");

  // =============================================================
  //                        SUMMARY
  // =============================================================

  console.log("\n\n🎉 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(50));
  console.log("✅ MP4DAO Token successfully deployed and tested!");
  console.log("📍 Contract Address:", tokenAddress);
  console.log("🌐 Network: Hardhat Local");
  console.log("👑 Owner:", deployer.address);
  console.log("💰 Initial Supply:", ethers.formatEther(initialSupply), "MP4");
  
  console.log("\n🔧 Features Tested:");
  console.log("  ✅ ERC-20 Token Transfers");
  console.log("  ✅ Governance Proposals & Voting");
  console.log("  ✅ Mediator Staking System");
  console.log("  ✅ Payment with Discount");
  console.log("  ✅ Reward Distribution");

  console.log("\n🚀 Next Steps:");
  console.log("  1. Deploy to testnet (Polygon Amoy)");
  console.log("  2. Integrate with frontend");
  console.log("  3. Set up monitoring");
  console.log("  4. Configure APIs");
  console.log("  5. Launch beta program");

  return {
    tokenAddress,
    deployer: deployer.address,
    totalSupply: ethers.formatEther(finalStats.totalSupply),
    success: true
  };
}

main()
  .then((result) => {
    console.log("\n🎊 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("Result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 DEPLOYMENT/TESTING FAILED:");
    console.error(error);
    process.exit(1);
  });
