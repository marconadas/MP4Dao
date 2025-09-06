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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly provider: ethers.JsonRpcProvider;
  private readonly mp4TokenAddress: string;
  private readonly mp4TokenAbi = [
    // Funções essenciais do MP4Token
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    
    // Funções de governança
    "function createProposal(string description) returns (uint256)",
    "function vote(uint256 proposalId, bool support)",
    "function executeProposal(uint256 proposalId)",
    "function getProposal(uint256 proposalId) view returns (uint256, address, string, uint256, uint256, uint256, uint256, bool, bool)",
    "function proposalCount() view returns (uint256)",
    
    // Funções de staking
    "function stakeMediator(uint256 amount)",
    "function unstakeMediator(uint256 amount)",
    "function canMediate(address account) view returns (bool)",
    "function mediatorStakes(address) view returns (uint256, uint256, uint256, bool)",
    "function minimumMediatorStake() view returns (uint256)",
    
    // Funções de pagamento
    "function payWithMP4(uint256 amount) returns (uint256)",
    "function calculatePaymentDiscount(uint256 baseAmount) view returns (uint256, uint256)",
    "function paymentDiscount() view returns (uint256)",
    
    // Funções administrativas
    "function mintReward(address to, uint256 amount)",
    "function distributeMediatorReward(address mediator, uint256 amount)",
    
    // Eventos
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)",
    "event MediatorStaked(address indexed mediator, uint256 amount)",
    "event PaymentMade(address indexed payer, uint256 tokenAmount, uint256 discountApplied)"
  ];

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.mp4TokenAddress = process.env.MP4_TOKEN_ADDRESS || '';
    
    if (!this.mp4TokenAddress) {
      this.logger.warn('MP4_TOKEN_ADDRESS not configured');
    }
  }

  /**
   * Obter contrato MP4Token
   */
  private getMP4TokenContract(signer?: ethers.Signer) {
    if (!this.mp4TokenAddress) {
      throw new Error('MP4Token address not configured');
    }
    
    return new ethers.Contract(
      this.mp4TokenAddress,
      this.mp4TokenAbi,
      signer || this.provider
    );
  }

  /**
   * Obter informações básicas do token
   */
  async getTokenInfo() {
    try {
      const contract = this.getMP4TokenContract();
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        contractAddress: this.mp4TokenAddress
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações do token:', error);
      throw error;
    }
  }

  /**
   * Obter balance de um endereço
   */
  async getBalance(address: string): Promise<string> {
    try {
      const contract = this.getMP4TokenContract();
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Erro ao obter balance de ${address}:`, error);
      throw error;
    }
  }

  /**
   * Verificar se um endereço pode ser mediador
   */
  async canMediate(address: string): Promise<boolean> {
    try {
      const contract = this.getMP4TokenContract();
      return await contract.canMediate(address);
    } catch (error) {
      this.logger.error(`Erro ao verificar se ${address} pode mediar:`, error);
      return false;
    }
  }

  /**
   * Obter informações de stake de mediador
   */
  async getMediatorStake(address: string) {
    try {
      const contract = this.getMP4TokenContract();
      const [amount, stakedAt, rewardsEarned, active] = await contract.mediatorStakes(address);
      
      return {
        amount: ethers.formatEther(amount),
        stakedAt: Number(stakedAt),
        rewardsEarned: ethers.formatEther(rewardsEarned),
        active
      };
    } catch (error) {
      this.logger.error(`Erro ao obter stake de ${address}:`, error);
      throw error;
    }
  }

  /**
   * Calcular desconto para pagamento em MP4
   */
  async calculatePaymentDiscount(baseAmountWei: string) {
    try {
      const contract = this.getMP4TokenContract();
      const [discountedAmount, tokenAmount] = await contract.calculatePaymentDiscount(baseAmountWei);
      
      return {
        originalAmount: ethers.formatEther(baseAmountWei),
        discountedAmount: ethers.formatEther(discountedAmount),
        tokenAmount: ethers.formatEther(tokenAmount),
        savings: ethers.formatEther(BigInt(baseAmountWei) - discountedAmount)
      };
    } catch (error) {
      this.logger.error('Erro ao calcular desconto:', error);
      throw error;
    }
  }

  /**
   * Obter todas as propostas de governança
   */
  async getProposals(limit: number = 10, offset: number = 0) {
    try {
      const contract = this.getMP4TokenContract();
      const proposalCount = await contract.proposalCount();
      const totalProposals = Number(proposalCount);
      
      const proposals = [];
      const start = Math.max(1, totalProposals - offset - limit + 1);
      const end = Math.min(totalProposals, totalProposals - offset);
      
      for (let i = end; i >= start; i--) {
        try {
          const proposalData = await contract.getProposal(i);
          const [id, proposer, description, forVotes, againstVotes, startTime, endTime, executed, cancelled] = proposalData;
          
          proposals.push({
            id: Number(id),
            proposer,
            description,
            forVotes: ethers.formatEther(forVotes),
            againstVotes: ethers.formatEther(againstVotes),
            startTime: Number(startTime),
            endTime: Number(endTime),
            executed,
            cancelled,
            status: this.getProposalStatus(Number(startTime), Number(endTime), executed, cancelled)
          });
        } catch (error) {
          this.logger.warn(`Erro ao carregar proposta ${i}:`, error);
        }
      }

      return {
        proposals,
        total: totalProposals,
        hasMore: offset + limit < totalProposals
      };
    } catch (error) {
      this.logger.error('Erro ao obter propostas:', error);
      throw error;
    }
  }

  /**
   * Obter proposta específica
   */
  async getProposal(proposalId: number) {
    try {
      const contract = this.getMP4TokenContract();
      const proposalData = await contract.getProposal(proposalId);
      const [id, proposer, description, forVotes, againstVotes, startTime, endTime, executed, cancelled] = proposalData;
      
      return {
        id: Number(id),
        proposer,
        description,
        forVotes: ethers.formatEther(forVotes),
        againstVotes: ethers.formatEther(againstVotes),
        startTime: Number(startTime),
        endTime: Number(endTime),
        executed,
        cancelled,
        status: this.getProposalStatus(Number(startTime), Number(endTime), executed, cancelled)
      };
    } catch (error) {
      this.logger.error(`Erro ao obter proposta ${proposalId}:`, error);
      throw new NotFoundException('Proposta não encontrada');
    }
  }

  /**
   * Distribuir recompensa para mediador
   */
  async distributeMediatorReward(mediatorAddress: string, amount: string, signerPrivateKey: string) {
    try {
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      const contract = this.getMP4TokenContract(wallet);
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.distributeMediatorReward(mediatorAddress, amountWei);
      const receipt = await tx.wait();
      
      this.logger.log(`Recompensa distribuída para ${mediatorAddress}: ${amount} MP4`);
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount: amount,
        recipient: mediatorAddress
      };
    } catch (error) {
      this.logger.error('Erro ao distribuir recompensa:', error);
      throw error;
    }
  }

  /**
   * Mintar tokens de recompensa
   */
  async mintReward(toAddress: string, amount: string, signerPrivateKey: string) {
    try {
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      const contract = this.getMP4TokenContract(wallet);
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.mintReward(toAddress, amountWei);
      const receipt = await tx.wait();
      
      this.logger.log(`Tokens mintados para ${toAddress}: ${amount} MP4`);
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount: amount,
        recipient: toAddress
      };
    } catch (error) {
      this.logger.error('Erro ao mintar recompensa:', error);
      throw error;
    }
  }

  /**
   * Calcular recompensa baseada na atividade
   */
  calculateActivityReward(activityType: string, baseAmount: number = 1): string {
    const rewardMultipliers = {
      'work_registered': 10,      // 10 MP4 por obra registada
      'dispute_mediated': 100,    // 100 MP4 por disputa mediada
      'proposal_created': 50,     // 50 MP4 por proposta criada
      'vote_cast': 5,            // 5 MP4 por voto
      'referral': 25             // 25 MP4 por referência
    };

    const multiplier = rewardMultipliers[activityType] || 1;
    return (baseAmount * multiplier).toString();
  }

  /**
   * Determinar status da proposta
   */
  private getProposalStatus(startTime: number, endTime: number, executed: boolean, cancelled: boolean): string {
    if (cancelled) return 'cancelled';
    if (executed) return 'executed';
    
    const now = Math.floor(Date.now() / 1000);
    if (now < startTime) return 'pending';
    if (now <= endTime) return 'active';
    return 'ended';
  }

  /**
   * Obter eventos recentes do token
   */
  async getRecentEvents(fromBlock: number = -10000, eventTypes: string[] = []) {
    try {
      const contract = this.getMP4TokenContract();
      const filter = eventTypes.length > 0 ? eventTypes : null;
      
      const events = await contract.queryFilter(filter, fromBlock);
      
      return events.map(event => ({
        event: event.fragment?.name || 'Unknown',
        args: event.args ? Object.values(event.args) : [],
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: event.blockNumber // Seria necessário fazer uma query adicional para o timestamp real
      }));
    } catch (error) {
      this.logger.error('Erro ao obter eventos:', error);
      return [];
    }
  }
}
