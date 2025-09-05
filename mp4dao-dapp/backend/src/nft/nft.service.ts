import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { Work } from '../works/entities/work.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { StorageService } from '../storage/storage.service';
import { WorkMetadataDto } from '../works/dto/album-metadata.dto';

@Injectable()
export class NFTService {
  private readonly logger = new Logger(NFTService.name);

  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
    private blockchainService: BlockchainService,
    private storageService: StorageService,
  ) {}

  /**
   * Mintar NFT para uma obra
   */
  async mintNFTForWork(workId: string, metadata: WorkMetadataDto): Promise<Work> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
      relations: ['authors'],
    });

    if (!work) {
      throw new NotFoundException('Obra não encontrada');
    }

    if (work.hasNFT) {
      throw new Error('NFT já foi mintado para esta obra');
    }

    try {
      // Upload dos metadados para IPFS
      const metadataUri = await this.storageService.uploadJSON(metadata);
      
      // Mintar NFT no contrato
      const mintResult = await this.mintNFTOnChain(work, metadataUri);
      
      // Atualizar obra com dados do NFT
      work.nftContractAddress = mintResult.contractAddress;
      work.tokenId = mintResult.tokenId;
      work.tokenURI = metadataUri;
      work.hasNFT = true;

      await this.workRepository.save(work);
      
      this.logger.log(`NFT mintado para obra ${workId}: tokenId ${mintResult.tokenId}`);
      
      return work;
    } catch (error) {
      this.logger.error(`Erro ao mintar NFT para obra ${workId}:`, error);
      throw error;
    }
  }

  /**
   * Obter informações do NFT de uma obra
   */
  async getNFTInfo(workId: string): Promise<{
    tokenId: number;
    contractAddress: string;
    tokenURI: string;
    metadata: any;
    owner: string;
    forSale: boolean;
    price: string;
  }> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
    });

    if (!work || !work.hasNFT) {
      throw new NotFoundException('NFT não encontrado para esta obra');
    }

    try {
      // Obter informações do NFT no contrato
      const nftInfo = await this.getNFTOnChainInfo(work.nftContractAddress!, work.tokenId!);
      
      // Obter metadados do IPFS
      const metadata = await this.storageService.getJSON(work.tokenURI!);

      return {
        tokenId: work.tokenId!,
        contractAddress: work.nftContractAddress!,
        tokenURI: work.tokenURI!,
        metadata,
        owner: nftInfo.owner,
        forSale: nftInfo.forSale,
        price: nftInfo.price,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter informações do NFT:`, error);
      throw error;
    }
  }

  /**
   * Listar NFT para venda
   */
  async listNFTForSale(workId: string, price: string, userAddress: string): Promise<void> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
    });

    if (!work || !work.hasNFT) {
      throw new NotFoundException('NFT não encontrado');
    }

    try {
      await this.listNFTOnChain(work.nftContractAddress!, work.tokenId!, price, userAddress);
      this.logger.log(`NFT ${work.tokenId} listado para venda por ${price} wei`);
    } catch (error) {
      this.logger.error(`Erro ao listar NFT para venda:`, error);
      throw error;
    }
  }

  /**
   * Comprar NFT
   */
  async buyNFT(workId: string, buyerAddress: string, value: string): Promise<void> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
    });

    if (!work || !work.hasNFT) {
      throw new NotFoundException('NFT não encontrado');
    }

    try {
      await this.buyNFTOnChain(work.nftContractAddress!, work.tokenId!, buyerAddress, value);
      this.logger.log(`NFT ${work.tokenId} comprado por ${buyerAddress}`);
    } catch (error) {
      this.logger.error(`Erro ao comprar NFT:`, error);
      throw error;
    }
  }

  /**
   * Fazer oferta para NFT
   */
  async makeOffer(
    workId: string, 
    buyerAddress: string, 
    offerValue: string, 
    expirationTime: number
  ): Promise<void> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
    });

    if (!work || !work.hasNFT) {
      throw new NotFoundException('NFT não encontrado');
    }

    try {
      await this.makeOfferOnChain(
        work.nftContractAddress!, 
        work.tokenId!, 
        buyerAddress, 
        offerValue, 
        expirationTime
      );
      this.logger.log(`Oferta feita para NFT ${work.tokenId} por ${buyerAddress}: ${offerValue} wei`);
    } catch (error) {
      this.logger.error(`Erro ao fazer oferta:`, error);
      throw error;
    }
  }

  /**
   * Aceitar oferta para NFT
   */
  async acceptOffer(workId: string, ownerAddress: string, buyerAddress: string): Promise<void> {
    const work = await this.workRepository.findOne({
      where: { id: workId },
    });

    if (!work || !work.hasNFT) {
      throw new NotFoundException('NFT não encontrado');
    }

    try {
      await this.acceptOfferOnChain(work.nftContractAddress!, work.tokenId!, ownerAddress, buyerAddress);
      this.logger.log(`Oferta aceita para NFT ${work.tokenId} de ${buyerAddress}`);
    } catch (error) {
      this.logger.error(`Erro ao aceitar oferta:`, error);
      throw error;
    }
  }

  /**
   * Obter NFTs de um usuário
   */
  async getUserNFTs(userAddress: string): Promise<Work[]> {
    try {
      // Buscar NFTs que o usuário possui
      const ownedTokens = await this.getUserOwnedTokens(userAddress);
      
      // Buscar obras correspondentes
      const works = await Promise.all(
        ownedTokens.map(async (token) => {
          return this.workRepository.findOne({
            where: {
              nftContractAddress: token.contractAddress,
              tokenId: token.tokenId,
            },
            relations: ['authors'],
          });
        })
      );

      return works.filter(work => work !== null) as Work[];
    } catch (error) {
      this.logger.error(`Erro ao obter NFTs do usuário:`, error);
      throw error;
    }
  }

  // Métodos privados para interação com blockchain

  private async mintNFTOnChain(work: Work, tokenURI: string): Promise<{
    tokenId: number;
    contractAddress: string;
    transactionHash: string;
  }> {
    // Implementar interação com contrato MusicNFT
    // Este é um placeholder - a implementação real depende da configuração do blockchain
    
    const contract = await this.blockchainService.getMusicNFTContract();
    const tx = await contract.mintForWork(work.workId, work.authors[0], tokenURI);
    const receipt = await tx.wait();
    
    // Extrair tokenId do evento
    const mintEvent = receipt.events?.find(e => e.event === 'MusicNFTMinted');
    const tokenId = mintEvent?.args?.tokenId?.toNumber();
    
    return {
      tokenId,
      contractAddress: contract.address,
      transactionHash: receipt.transactionHash,
    };
  }

  private async getNFTOnChainInfo(contractAddress: string, tokenId: number): Promise<{
    owner: string;
    forSale: boolean;
    price: string;
  }> {
    const contract = await this.blockchainService.getMusicNFTContractAt(contractAddress);
    
    const owner = await contract.ownerOf(tokenId);
    const saleInfo = await contract.getTokenSaleInfo(tokenId);
    
    return {
      owner,
      forSale: saleInfo.forSale,
      price: saleInfo.price.toString(),
    };
  }

  private async listNFTOnChain(
    contractAddress: string, 
    tokenId: number, 
    price: string, 
    userAddress: string
  ): Promise<void> {
    const contract = await this.blockchainService.getMusicNFTContractAt(contractAddress);
    const tx = await contract.connect(userAddress).listForSale(tokenId, price);
    await tx.wait();
  }

  private async buyNFTOnChain(
    contractAddress: string, 
    tokenId: number, 
    buyerAddress: string, 
    value: string
  ): Promise<void> {
    const contract = await this.blockchainService.getMusicNFTContractAt(contractAddress);
    const tx = await contract.connect(buyerAddress).buyToken(tokenId, { value });
    await tx.wait();
  }

  private async makeOfferOnChain(
    contractAddress: string, 
    tokenId: number, 
    buyerAddress: string, 
    offerValue: string, 
    expirationTime: number
  ): Promise<void> {
    const contract = await this.blockchainService.getMusicNFTContractAt(contractAddress);
    const tx = await contract.connect(buyerAddress).makeOffer(tokenId, expirationTime, { value: offerValue });
    await tx.wait();
  }

  private async acceptOfferOnChain(
    contractAddress: string, 
    tokenId: number, 
    ownerAddress: string, 
    buyerAddress: string
  ): Promise<void> {
    const contract = await this.blockchainService.getMusicNFTContractAt(contractAddress);
    const tx = await contract.connect(ownerAddress).acceptOffer(tokenId, buyerAddress);
    await tx.wait();
  }

  private async getUserOwnedTokens(userAddress: string): Promise<Array<{
    contractAddress: string;
    tokenId: number;
  }>> {
    // Implementar busca por NFTs que o usuário possui
    // Pode usar eventos ou queries no contrato
    
    // Este é um placeholder - implementação real seria mais complexa
    return [];
  }
}
