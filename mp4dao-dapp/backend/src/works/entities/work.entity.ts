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
import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { Dispute } from '../../disputes/entities/dispute.entity';
import { WorkType } from '../enums/work-type.enum';

@Entity('works')
@Index(['workHash'], { unique: true })
@Index(['blockchainTxHash'], { unique: true })
export class Work extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  workHash: string;

  @Column({ type: 'varchar', length: 500 })
  metadataUri: string;

  @Column({
    type: 'enum',
    enum: WorkType,
    default: WorkType.MUSIC,
  })
  workType: WorkType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre?: string;

  @Column({ type: 'date', nullable: true })
  creationDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  iswc?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isrc?: string;

  @Column({ type: 'boolean', default: false })
  publicListing: boolean;

  @Column({ type: 'boolean', default: false })
  disputed: boolean;

  // Blockchain data
  @Column({ type: 'varchar', length: 66, nullable: true })
  @Index()
  blockchainTxHash?: string;

  @Column({ type: 'integer', nullable: true })
  blockNumber?: number;

  @Column({ type: 'timestamp', nullable: true })
  blockTimestamp?: Date;

  @Column({ type: 'integer', nullable: true })
  chainId?: number;

  @Column({ type: 'varchar', length: 42, nullable: true })
  contractAddress?: string;

  @Column({ type: 'integer', nullable: true })
  workId?: number; // ID no smart contract
  
  // NFT data
  @Column({ type: 'varchar', length: 42, nullable: true })
  nftContractAddress?: string;
  
  @Column({ type: 'integer', nullable: true })
  tokenId?: number;
  
  @Column({ type: 'varchar', length: 500, nullable: true })
  tokenURI?: string;
  
  @Column({ type: 'boolean', default: false })
  hasNFT: boolean;

  // Authors and splits
  @ManyToMany(() => User, (user) => user.works, { cascade: true })
  @JoinTable({
    name: 'work_authors',
    joinColumn: { name: 'workId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  authors: User[];

  @Column({ type: 'jsonb' })
  splitsBps: { userId: string; percentage: number }[];

  // Evidence files
  @Column({ type: 'jsonb', nullable: true })
  evidence?: {
    type: string;
    ipfsCid: string;
    sha256: string;
    filename: string;
    size: number;
    encrypted: boolean;
  }[];

  // Relations
  @OneToMany(() => Dispute, (dispute) => dispute.work)
  disputes: Dispute[];

  // Computed fields
  get totalAuthors(): number {
    return this.authors?.length || 0;
  }

  get isOnBlockchain(): boolean {
    return !!this.blockchainTxHash;
  }

  get hasEvidence(): boolean {
    return this.evidence && this.evidence.length > 0;
  }
  
  get isNFTMinted(): boolean {
    return this.hasNFT && !!this.tokenId;
  }
}
