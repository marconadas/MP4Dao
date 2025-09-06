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
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { Work } from '../../works/entities/work.entity';
import { Dispute } from '../../disputes/entities/dispute.entity';

@Entity('users')
@Index(['walletAddress'], { unique: true })
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 42, unique: true })
  @Index()
  walletAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  artistName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  websiteUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    spotify?: string;
  };

  // KYC and verification
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Exclude()
  kycDocumentNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Exclude()
  kycDocumentType?: string; // BI, Passaporte, etc.

  @Column({ type: 'timestamp', nullable: true })
  kycVerifiedAt?: Date;

  // Authentication
  @Column({ type: 'varchar', length: 500, nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Preferences
  @Column({ type: 'varchar', length: 10, default: 'pt' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'Africa/Luanda' })
  timezone: string;

  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  pushNotifications: boolean;

  // Relations
  @ManyToMany(() => Work, (work) => work.authors)
  works: Work[];

  @OneToMany(() => Dispute, (dispute) => dispute.claimant)
  disputes: Dispute[];

  // Computed fields
  get totalWorks(): number {
    return this.works?.length || 0;
  }

  get displayName(): string {
    return this.artistName || this.name || this.walletAddress.slice(0, 8) + '...';
  }

  get isKycVerified(): boolean {
    return this.isVerified && !!this.kycVerifiedAt;
  }
}
