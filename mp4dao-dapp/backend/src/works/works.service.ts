import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { QueryWorksDto } from './dto/query-works.dto';
import { Work } from './entities/work.entity';
import { User } from '../auth/entities/user.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { StorageService } from '../storage/storage.service';
import * as crypto from 'crypto';

@Injectable()
export class WorksService {
  private readonly logger = new Logger(WorksService.name);

  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly blockchainService: BlockchainService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createWorkDto: CreateWorkDto,
    userId: string,
    files: {
      audio?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ): Promise<Work> {
    this.logger.log(`Creating new work for user ${userId}`);

    // Validate author splits
    const totalPercentage = createWorkDto.authors.reduce(
      (sum, author) => sum + author.percentage,
      0,
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        'A soma das percentagens dos autores deve ser 100%',
      );
    }

    // Verify that the user is one of the authors
    const userWallets = await this.getUserWallets(userId);
    const isUserAuthor = createWorkDto.authors.some(author =>
      userWallets.includes(author.walletAddress.toLowerCase()),
    );

    if (!isUserAuthor) {
      throw new BadRequestException(
        'O utilizador deve ser um dos autores da obra',
      );
    }

    try {
      // Process and upload files
      const evidence = await this.processFiles(files);

      // Calculate work hash if not provided
      let workHash = createWorkDto.workHash;
      if (!workHash) {
        workHash = await this.calculateWorkHash(files);
      }

      // Check if work hash already exists
      const existingWork = await this.workRepository.findOne({
        where: { workHash },
      });

      if (existingWork) {
        throw new BadRequestException(
          'Uma obra com este hash já está registada',
        );
      }

      // Get author users
      const authors = await this.getAuthorsByWallets(
        createWorkDto.authors.map(a => a.walletAddress),
      );

      // Prepare splits data
      const splitsBps = createWorkDto.authors.map(author => ({
        userId: authors.find(u => 
          u.walletAddress?.toLowerCase() === author.walletAddress.toLowerCase()
        )?.id || 'unknown',
        percentage: author.percentage,
      }));

      // Create work entity
      const work = this.workRepository.create({
        title: createWorkDto.title,
        description: createWorkDto.description,
        workType: createWorkDto.workType,
        genre: createWorkDto.genre,
        creationDate: createWorkDto.creationDate ? new Date(createWorkDto.creationDate) : undefined,
        iswc: createWorkDto.iswc,
        isrc: createWorkDto.isrc,
        publicListing: createWorkDto.publicListing,
        workHash,
        metadataUri: createWorkDto.metadataUri || '',
        authors,
        splitsBps,
        evidence,
        blockchainTxHash: createWorkDto.blockchainTxHash,
      });

      const savedWork = await this.workRepository.save(work);

      this.logger.log(`Work created successfully with ID ${savedWork.id}`);
      return savedWork;

    } catch (error) {
      this.logger.error(`Failed to create work: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryWorksDto): Promise<{
    works: Work[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      workType,
      genre,
      publicOnly = true,
      disputedOnly,
      authorAddress,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: FindOptionsWhere<Work> = {};

    // Apply filters
    if (publicOnly) {
      where.publicListing = true;
    }

    if (disputedOnly !== undefined) {
      where.disputed = disputedOnly;
    }

    if (workType) {
      where.workType = workType;
    }

    if (genre) {
      where.genre = Like(`%${genre}%`);
    }

    // Build query
    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.authors', 'authors')
      .where(where);

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(work.title ILIKE :search OR work.description ILIKE :search OR work.genre ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Author filter
    if (authorAddress) {
      queryBuilder.andWhere(
        'authors.walletAddress ILIKE :authorAddress',
        { authorAddress: `%${authorAddress}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`work.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [works, total] = await queryBuilder.getManyAndCount();

    return {
      works,
      total,
      page,
      limit,
    };
  }

  async findByAuthor(
    userId: string,
    query: QueryWorksDto,
  ): Promise<{
    works: Work[];
    total: number;
    page: number;
    limit: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    // Override publicOnly filter for user's own works
    const modifiedQuery = { ...query, publicOnly: undefined };

    const {
      page = 1,
      limit = 10,
      search,
      workType,
      genre,
      disputedOnly,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = modifiedQuery;

    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.authors', 'authors')
      .where('authors.id = :userId', { userId });

    // Apply filters
    if (disputedOnly !== undefined) {
      queryBuilder.andWhere('work.disputed = :disputedOnly', { disputedOnly });
    }

    if (workType) {
      queryBuilder.andWhere('work.workType = :workType', { workType });
    }

    if (genre) {
      queryBuilder.andWhere('work.genre ILIKE :genre', { genre: `%${genre}%` });
    }

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(work.title ILIKE :search OR work.description ILIKE :search OR work.genre ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`work.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [works, total] = await queryBuilder.getManyAndCount();

    return {
      works,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Work> {
    const work = await this.workRepository.findOne({
      where: { id },
      relations: ['authors', 'disputes'],
    });

    if (!work) {
      throw new NotFoundException('Obra não encontrada');
    }

    return work;
  }

  async update(id: string, updateWorkDto: UpdateWorkDto, userId: string): Promise<Work> {
    const work = await this.findOne(id);

    // Check if user is an author
    const isAuthor = work.authors.some(author => author.id === userId);
    if (!isAuthor) {
      throw new ForbiddenException('Apenas autores podem editar a obra');
    }

    // Check if work is disputed
    if (work.disputed) {
      throw new ForbiddenException('Não é possível editar uma obra em disputa');
    }

    // Update work
    Object.assign(work, updateWorkDto);
    
    if (updateWorkDto.creationDate) {
      work.creationDate = new Date(updateWorkDto.creationDate);
    }

    const updatedWork = await this.workRepository.save(work);

    this.logger.log(`Work ${id} updated by user ${userId}`);
    return updatedWork;
  }

  async remove(id: string, userId: string): Promise<void> {
    const work = await this.findOne(id);

    // Check if user is an author
    const isAuthor = work.authors.some(author => author.id === userId);
    if (!isAuthor) {
      throw new ForbiddenException('Apenas autores podem remover a obra');
    }

    // Check if work is on blockchain
    if (work.blockchainTxHash) {
      throw new ForbiddenException(
        'Não é possível remover uma obra já registada na blockchain',
      );
    }

    await this.workRepository.remove(work);
    this.logger.log(`Work ${id} removed by user ${userId}`);
  }

  async syncWithBlockchain(id: string, txHash: string, userId: string): Promise<Work> {
    const work = await this.findOne(id);

    // Check if user is an author
    const isAuthor = work.authors.some(author => author.id === userId);
    if (!isAuthor) {
      throw new ForbiddenException('Apenas autores podem sincronizar a obra');
    }

    try {
      // Verify transaction on blockchain
      const blockchainData = await this.blockchainService.getWorkFromBlockchain(txHash);
      
      if (blockchainData.workHash !== work.workHash) {
        throw new BadRequestException('Hash da obra não corresponde à blockchain');
      }

      // Update work with blockchain data
      work.blockchainTxHash = txHash;
      work.blockNumber = blockchainData.blockNumber;
      work.blockTimestamp = blockchainData.timestamp;
      work.chainId = blockchainData.chainId;
      work.contractAddress = blockchainData.contractAddress;
      work.workId = blockchainData.workId;

      const updatedWork = await this.workRepository.save(work);

      this.logger.log(`Work ${id} synchronized with blockchain (tx: ${txHash})`);
      return updatedWork;

    } catch (error) {
      this.logger.error(`Failed to sync work ${id} with blockchain: ${error.message}`);
      throw error;
    }
  }

  async verifyIntegrity(id: string): Promise<{
    isValid: boolean;
    blockchainHash: string;
    calculatedHash: string;
    registeredAt: Date;
  }> {
    const work = await this.findOne(id);

    if (!work.blockchainTxHash) {
      throw new BadRequestException('Obra não está registada na blockchain');
    }

    try {
      // Get data from blockchain
      const blockchainData = await this.blockchainService.getWorkFromBlockchain(
        work.blockchainTxHash,
      );

      // Recalculate hash from stored files
      const calculatedHash = await this.recalculateWorkHash(work);

      const isValid = blockchainData.workHash === calculatedHash;

      return {
        isValid,
        blockchainHash: blockchainData.workHash,
        calculatedHash,
        registeredAt: work.blockTimestamp || work.createdAt,
      };

    } catch (error) {
      this.logger.error(`Failed to verify work ${id} integrity: ${error.message}`);
      throw error;
    }
  }

  private async processFiles(files: {
    audio?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  }): Promise<any[]> {
    const evidence = [];
    const allFiles = [...(files.audio || []), ...(files.documents || [])];

    for (const file of allFiles) {
      try {
        // Upload to IPFS/storage
        const ipfsCid = await this.storageService.uploadFile(file);
        
        // Calculate file hash
        const sha256 = crypto
          .createHash('sha256')
          .update(file.buffer)
          .digest('hex');

        evidence.push({
          type: this.getFileType(file),
          ipfsCid,
          sha256: `0x${sha256}`,
          filename: file.originalname,
          size: file.size,
          encrypted: false,
        });

      } catch (error) {
        this.logger.error(`Failed to process file ${file.originalname}: ${error.message}`);
        throw new BadRequestException(`Erro ao processar ficheiro ${file.originalname}`);
      }
    }

    return evidence;
  }

  private async calculateWorkHash(files: {
    audio?: Express.Multer.File[];
    documents?: Express.Multer.File[];
  }): Promise<string> {
    const allFiles = [...(files.audio || []), ...(files.documents || [])];
    
    // Combine all file buffers
    const combinedBuffer = Buffer.concat(allFiles.map(file => file.buffer));
    
    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256').update(combinedBuffer).digest('hex');
    
    return `0x${hash}`;
  }

  private async recalculateWorkHash(work: Work): Promise<string> {
    // This would download files from IPFS and recalculate hash
    // For now, return the stored hash
    return work.workHash;
  }

  private getFileType(file: Express.Multer.File): string {
    if (file.mimetype.startsWith('audio/')) return 'audio';
    if (file.mimetype.includes('text') || file.originalname.endsWith('.txt')) return 'lyrics';
    if (file.mimetype === 'application/pdf') return 'sheet_music';
    return 'other';
  }

  private async getUserWallets(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.walletAddress) {
      return [];
    }

    return [user.walletAddress.toLowerCase()];
  }

  private async getAuthorsByWallets(walletAddresses: string[]): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        walletAddress: In(walletAddresses.map(addr => addr.toLowerCase())),
      },
    });

    return users;
  }
}
