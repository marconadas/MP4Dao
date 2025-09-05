import { expect } from "chai";
import { ethers } from "hardhat";
import { WorkRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("WorkRegistry", function () {
  let workRegistry: WorkRegistry;
  let owner: SignerWithAddress;
  let artist1: SignerWithAddress;
  let artist2: SignerWithAddress;
  let mediator: SignerWithAddress;
  let claimant: SignerWithAddress;
  
  const registrationFee = ethers.parseEther("0.001");
  const disputeFee = ethers.parseEther("0.01");
  
  beforeEach(async function () {
    [owner, artist1, artist2, mediator, claimant] = await ethers.getSigners();
    
    const WorkRegistryFactory = await ethers.getContractFactory("WorkRegistry");
    workRegistry = await WorkRegistryFactory.deploy(owner.address);
    await workRegistry.waitForDeployment();
    
    // Configurar taxas
    await workRegistry.setFees(registrationFee, disputeFee);
    
    // Autorizar mediador
    await workRegistry.setMediatorAuthorization(mediator.address, true);
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await workRegistry.owner()).to.equal(owner.address);
    });
    
    it("Should set correct initial fees", async function () {
      expect(await workRegistry.registrationFee()).to.equal(registrationFee);
      expect(await workRegistry.disputeFee()).to.equal(disputeFee);
    });
    
    it("Should authorize owner as initial mediator", async function () {
      expect(await workRegistry.authorizedMediators(owner.address)).to.be.true;
    });
  });
  
  describe("Work Registration", function () {
    const workHash = ethers.keccak256(ethers.toUtf8Bytes("test-work-content"));
    const metadataURI = "ipfs://QmTest123";
    const workType = 0; // MUSIC
    
    it("Should register a work successfully", async function () {
      const authors = [artist1.address];
      const splits = [10000]; // 100%
      
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          metadataURI,
          authors,
          splits,
          workType,
          true,
          { value: registrationFee }
        )
      ).to.emit(workRegistry, "WorkRegistered");
      
      expect(await workRegistry.workCount()).to.equal(1);
      expect(await workRegistry.workIdByHash(workHash)).to.equal(1);
    });
    
    it("Should register work with multiple authors", async function () {
      const authors = [artist1.address, artist2.address];
      const splits = [7000, 3000]; // 70% e 30%
      
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          metadataURI,
          authors,
          splits,
          workType,
          false,
          { value: registrationFee }
        )
      ).to.emit(workRegistry, "WorkRegistered");
      
      const work = await workRegistry.getWork(1);
      expect(work.authors).to.deep.equal(authors);
      expect(work.splitsBps).to.deep.equal(splits);
    });
    
    it("Should fail with insufficient fee", async function () {
      const authors = [artist1.address];
      const splits = [10000];
      
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          metadataURI,
          authors,
          splits,
          workType,
          true,
          { value: registrationFee - 1n }
        )
      ).to.be.revertedWith("WorkRegistry: insufficient fee");
    });
    
    it("Should fail if sender is not an author", async function () {
      const authors = [artist2.address];
      const splits = [10000];
      
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          metadataURI,
          authors,
          splits,
          workType,
          true,
          { value: registrationFee }
        )
      ).to.be.revertedWith("WorkRegistry: sender must be an author");
    });
    
    it("Should fail with invalid splits total", async function () {
      const authors = [artist1.address, artist2.address];
      const splits = [5000, 4000]; // Total = 9000 (should be 10000)
      
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          metadataURI,
          authors,
          splits,
          workType,
          true,
          { value: registrationFee }
        )
      ).to.be.revertedWith("WorkRegistry: splits must sum to 10000 bps");
    });
    
    it("Should fail with duplicate hash", async function () {
      const authors = [artist1.address];
      const splits = [10000];
      
      // Primeiro registo
      await workRegistry.connect(artist1).registerWork(
        workHash,
        metadataURI,
        authors,
        splits,
        workType,
        true,
        { value: registrationFee }
      );
      
      // Segundo registo com mesmo hash
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          "ipfs://QmDifferent",
          authors,
          splits,
          workType,
          true,
          { value: registrationFee }
        )
      ).to.be.revertedWith("WorkRegistry: hash already registered");
    });
    
    it("Should refund excess payment", async function () {
      const authors = [artist1.address];
      const splits = [10000];
      const excessPayment = registrationFee * 2n;
      
      const balanceBefore = await artist1.provider.getBalance(artist1.address);
      
      const tx = await workRegistry.connect(artist1).registerWork(
        workHash,
        metadataURI,
        authors,
        splits,
        workType,
        true,
        { value: excessPayment }
      );
      
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await artist1.provider.getBalance(artist1.address);
      
      // Deve ter pago apenas a taxa de registo + gas
      const expectedBalance = balanceBefore - registrationFee - gasUsed;
      expect(balanceAfter).to.equal(expectedBalance);
    });
  });
  
  describe("Work Queries", function () {
    beforeEach(async function () {
      const workHash = ethers.keccak256(ethers.toUtf8Bytes("test-work"));
      const authors = [artist1.address, artist2.address];
      const splits = [6000, 4000];
      
      await workRegistry.connect(artist1).registerWork(
        workHash,
        "ipfs://QmTest",
        authors,
        splits,
        0,
        true,
        { value: registrationFee }
      );
    });
    
    it("Should return correct work data", async function () {
      const work = await workRegistry.getWork(1);
      
      expect(work.metadataURI).to.equal("ipfs://QmTest");
      expect(work.authors.length).to.equal(2);
      expect(work.authors[0]).to.equal(artist1.address);
      expect(work.authors[1]).to.equal(artist2.address);
      expect(work.splitsBps[0]).to.equal(6000);
      expect(work.splitsBps[1]).to.equal(4000);
      expect(work.workType).to.equal(0);
      expect(work.publicListing).to.be.true;
      expect(work.disputed).to.be.false;
    });
    
    it("Should correctly identify authors", async function () {
      expect(await workRegistry.isAuthor(1, artist1.address)).to.be.true;
      expect(await workRegistry.isAuthor(1, artist2.address)).to.be.true;
      expect(await workRegistry.isAuthor(1, claimant.address)).to.be.false;
    });
    
    it("Should return works by author", async function () {
      // Registar segunda obra apenas com artist1
      const workHash2 = ethers.keccak256(ethers.toUtf8Bytes("test-work-2"));
      await workRegistry.connect(artist1).registerWork(
        workHash2,
        "ipfs://QmTest2",
        [artist1.address],
        [10000],
        0,
        false,
        { value: registrationFee }
      );
      
      const artist1Works = await workRegistry.getWorksByAuthor(artist1.address);
      const artist2Works = await workRegistry.getWorksByAuthor(artist2.address);
      
      expect(artist1Works.length).to.equal(2);
      expect(artist1Works[0]).to.equal(1);
      expect(artist1Works[1]).to.equal(2);
      
      expect(artist2Works.length).to.equal(1);
      expect(artist2Works[0]).to.equal(1);
    });
  });
  
  describe("Metadata Updates", function () {
    beforeEach(async function () {
      const workHash = ethers.keccak256(ethers.toUtf8Bytes("test-work"));
      await workRegistry.connect(artist1).registerWork(
        workHash,
        "ipfs://QmOriginal",
        [artist1.address],
        [10000],
        0,
        true,
        { value: registrationFee }
      );
    });
    
    it("Should allow author to update metadata", async function () {
      const newMetadataURI = "ipfs://QmUpdated";
      
      await expect(
        workRegistry.connect(artist1).updateMetadata(1, newMetadataURI)
      ).to.emit(workRegistry, "MetadataUpdated")
        .withArgs(1, newMetadataURI, artist1.address);
      
      const work = await workRegistry.getWork(1);
      expect(work.metadataURI).to.equal(newMetadataURI);
    });
    
    it("Should fail if not author", async function () {
      await expect(
        workRegistry.connect(artist2).updateMetadata(1, "ipfs://QmHacked")
      ).to.be.revertedWith("WorkRegistry: not an author");
    });
    
    it("Should fail with empty URI", async function () {
      await expect(
        workRegistry.connect(artist1).updateMetadata(1, "")
      ).to.be.revertedWith("WorkRegistry: empty metadata URI");
    });
  });
  
  describe("Disputes", function () {
    beforeEach(async function () {
      const workHash = ethers.keccak256(ethers.toUtf8Bytes("disputed-work"));
      await workRegistry.connect(artist1).registerWork(
        workHash,
        "ipfs://QmDisputed",
        [artist1.address],
        [10000],
        0,
        true,
        { value: registrationFee }
      );
    });
    
    it("Should create dispute successfully", async function () {
      const reason = "Copyright infringement claim";
      const evidenceURI = "ipfs://QmEvidence";
      
      await expect(
        workRegistry.connect(claimant).createDispute(
          1,
          reason,
          evidenceURI,
          { value: disputeFee }
        )
      ).to.emit(workRegistry, "DisputeCreated")
        .withArgs(1, 1, claimant.address, reason);
      
      const dispute = await workRegistry.getDispute(1);
      expect(dispute.workId).to.equal(1);
      expect(dispute.claimant).to.equal(claimant.address);
      expect(dispute.reason).to.equal(reason);
      expect(dispute.evidenceURI).to.equal(evidenceURI);
      expect(dispute.status).to.equal(0); // PENDING
      
      // Work should be marked as disputed
      const work = await workRegistry.getWork(1);
      expect(work.disputed).to.be.true;
    });
    
    it("Should fail if author tries to dispute own work", async function () {
      await expect(
        workRegistry.connect(artist1).createDispute(
          1,
          "Self dispute",
          "ipfs://QmSelf",
          { value: disputeFee }
        )
      ).to.be.revertedWith("WorkRegistry: authors cannot dispute own work");
    });
    
    it("Should fail with insufficient fee", async function () {
      await expect(
        workRegistry.connect(claimant).createDispute(
          1,
          "Insufficient fee",
          "ipfs://QmEvidence",
          { value: disputeFee - 1n }
        )
      ).to.be.revertedWith("WorkRegistry: insufficient dispute fee");
    });
    
    it("Should allow mediator to resolve dispute", async function () {
      // Criar disputa
      await workRegistry.connect(claimant).createDispute(
        1,
        "Test dispute",
        "ipfs://QmEvidence",
        { value: disputeFee }
      );
      
      // Resolver como mediador
      await expect(
        workRegistry.connect(mediator).resolveDispute(1, 3) // RESOLVED
      ).to.emit(workRegistry, "DisputeResolved")
        .withArgs(1, 1, 3, mediator.address);
      
      const dispute = await workRegistry.getDispute(1);
      expect(dispute.status).to.equal(3); // RESOLVED
      expect(dispute.mediator).to.equal(mediator.address);
      
      // Work should no longer be disputed
      const work = await workRegistry.getWork(1);
      expect(work.disputed).to.be.false;
    });
    
    it("Should fail if non-mediator tries to resolve", async function () {
      await workRegistry.connect(claimant).createDispute(
        1,
        "Test dispute",
        "ipfs://QmEvidence",
        { value: disputeFee }
      );
      
      await expect(
        workRegistry.connect(artist2).resolveDispute(1, 3)
      ).to.be.revertedWith("WorkRegistry: not authorized mediator");
    });
  });
  
  describe("Administrative Functions", function () {
    it("Should allow owner to update fees", async function () {
      const newRegFee = ethers.parseEther("0.002");
      const newDispFee = ethers.parseEther("0.02");
      
      await expect(
        workRegistry.setFees(newRegFee, newDispFee)
      ).to.emit(workRegistry, "FeesUpdated")
        .withArgs(newRegFee, newDispFee);
      
      expect(await workRegistry.registrationFee()).to.equal(newRegFee);
      expect(await workRegistry.disputeFee()).to.equal(newDispFee);
    });
    
    it("Should allow owner to authorize mediators", async function () {
      expect(await workRegistry.authorizedMediators(artist1.address)).to.be.false;
      
      await workRegistry.setMediatorAuthorization(artist1.address, true);
      expect(await workRegistry.authorizedMediators(artist1.address)).to.be.true;
      
      await workRegistry.setMediatorAuthorization(artist1.address, false);
      expect(await workRegistry.authorizedMediators(artist1.address)).to.be.false;
    });
    
    it("Should allow owner to pause and unpause", async function () {
      await workRegistry.pause();
      
      const workHash = ethers.keccak256(ethers.toUtf8Bytes("paused-test"));
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          "ipfs://QmPaused",
          [artist1.address],
          [10000],
          0,
          true,
          { value: registrationFee }
        )
      ).to.be.revertedWithCustomError(workRegistry, "EnforcedPause");
      
      await workRegistry.unpause();
      
      // Should work after unpause
      await expect(
        workRegistry.connect(artist1).registerWork(
          workHash,
          "ipfs://QmPaused",
          [artist1.address],
          [10000],
          0,
          true,
          { value: registrationFee }
        )
      ).to.emit(workRegistry, "WorkRegistered");
    });
    
    it("Should allow owner to withdraw funds", async function () {
      // Register some works to accumulate fees
      const workHash1 = ethers.keccak256(ethers.toUtf8Bytes("work1"));
      const workHash2 = ethers.keccak256(ethers.toUtf8Bytes("work2"));
      
      await workRegistry.connect(artist1).registerWork(
        workHash1,
        "ipfs://QmWork1",
        [artist1.address],
        [10000],
        0,
        true,
        { value: registrationFee }
      );
      
      await workRegistry.connect(artist2).registerWork(
        workHash2,
        "ipfs://QmWork2",
        [artist2.address],
        [10000],
        0,
        true,
        { value: registrationFee }
      );
      
      const contractBalance = await ethers.provider.getBalance(workRegistry);
      expect(contractBalance).to.equal(registrationFee * 2n);
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner);
      const tx = await workRegistry.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const ownerBalanceAfter = await ethers.provider.getBalance(owner);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance - gasUsed);
    });
  });
});

// Helper para anyValue em testes - usando regex para timestamp
const anyValue = /^\d+$/;
