/**
 * MP4 DAO - Plataforma de Registo de Copyright Musical em Angola
 * 
 * Copyright (c) 2024 Marcos de Jesus Araújo Cândido dos Santos
 * Rua Luís Simões 55A 2ºEsq, Pendão, Queluz, 2745-035, Lisboa
 * 
 * This file is part of the MP4 DAO project.
 * 
 * Licensed under the MIT License. See LICENSE file for details.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    // Initialize provider (use environment variables in production)
    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Contract ABI (simplified for this example)
    const abi = [
      'function getWork(uint256 workId) view returns (tuple(bytes32 workHash, string metadataURI, address[] authors, uint16[] splitsBps, uint64 registeredAt, uint32 workType, bool disputed, bool publicListing))',
      'function workCount() view returns (uint256)',
      'function registrationFee() view returns (uint256)',
      'event WorkRegistered(uint256 indexed workId, bytes32 indexed workHash, string metadataURI, address[] authors, uint16[] splitsBps, uint32 workType, uint64 timestamp, bool publicListing)'
    ];

    const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  async getWorkFromBlockchain(txHash: string): Promise<{
    workHash: string;
    workId: number;
    blockNumber: number;
    timestamp: Date;
    chainId: number;
    contractAddress: string;
  }> {
    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      // Get block details
      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) {
        throw new Error('Block not found');
      }

      // Parse logs to find WorkRegistered event
      const workRegisteredEvent = this.contract.interface.parseLog(receipt.logs[0]);
      if (!workRegisteredEvent || workRegisteredEvent.name !== 'WorkRegistered') {
        throw new Error('WorkRegistered event not found');
      }

      const workId = workRegisteredEvent.args.workId;
      const workHash = workRegisteredEvent.args.workHash;

      return {
        workHash,
        workId: Number(workId),
        blockNumber: receipt.blockNumber,
        timestamp: new Date(Number(block.timestamp) * 1000),
        chainId: (await this.provider.getNetwork()).chainId,
        contractAddress: receipt.to || '',
      };

    } catch (error) {
      this.logger.error(`Failed to get work from blockchain: ${error.message}`);
      throw error;
    }
  }

  async getWorkById(workId: number): Promise<any> {
    try {
      const work = await this.contract.getWork(workId);
      return {
        workHash: work.workHash,
        metadataURI: work.metadataURI,
        authors: work.authors,
        splitsBps: work.splitsBps.map((split: any) => Number(split)),
        registeredAt: new Date(Number(work.registeredAt) * 1000),
        workType: Number(work.workType),
        disputed: work.disputed,
        publicListing: work.publicListing,
      };
    } catch (error) {
      this.logger.error(`Failed to get work ${workId}: ${error.message}`);
      throw error;
    }
  }

  async getRegistrationFee(): Promise<string> {
    try {
      const fee = await this.contract.registrationFee();
      return ethers.formatEther(fee);
    } catch (error) {
      this.logger.error(`Failed to get registration fee: ${error.message}`);
      throw error;
    }
  }

  async getTotalWorks(): Promise<number> {
    try {
      const count = await this.contract.workCount();
      return Number(count);
    } catch (error) {
      this.logger.error(`Failed to get total works: ${error.message}`);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt?.status === 1;
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${error.message}`);
      return false;
    }
  }

  async getNetworkInfo(): Promise<{
    chainId: bigint;
    name: string;
    blockNumber: number;
  }> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to get network info: ${error.message}`);
      throw error;
    }
  }
}
