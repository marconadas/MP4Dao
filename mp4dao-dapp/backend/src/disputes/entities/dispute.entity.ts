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
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Work } from '../../works/entities/work.entity';
import { User } from '../../auth/entities/user.entity';
import { DisputeStatus } from '../enums/dispute-status.enum';

@Entity('disputes')
@Index(['status'])
@Index(['createdAt'])
export class Dispute extends BaseEntity {
  @ManyToOne(() => Work, (work) => work.disputes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;

  @Column({ type: 'uuid' })
  workId: string;

  @ManyToOne(() => User, (user) => user.disputes)
  @JoinColumn({ name: 'claimantId' })
  claimant: User;

  @Column({ type: 'uuid' })
  claimantId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.PENDING,
  })
  @Index()
  status: DisputeStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  evidenceUri?: string;

  @Column({ type: 'jsonb', nullable: true })
  evidenceFiles?: {
    filename: string;
    ipfsCid: string;
    sha256: string;
    size: number;
    type: string;
  }[];

  // Mediator
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mediatorId' })
  mediator?: User;

  @Column({ type: 'uuid', nullable: true })
  mediatorId?: string;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt?: Date;

  // Resolution
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ type: 'text', nullable: true })
  mediatorNotes?: string;

  // Blockchain
  @Column({ type: 'varchar', length: 66, nullable: true })
  blockchainTxHash?: string;

  @Column({ type: 'integer', nullable: true })
  disputeId?: number; // ID no smart contract

  // Deadlines
  @Column({ type: 'timestamp', nullable: true })
  responseDeadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  mediationDeadline?: Date;

  // Communication
  @Column({ type: 'jsonb', default: '[]' })
  messages: {
    id: string;
    senderId: string;
    senderType: 'claimant' | 'author' | 'mediator';
    message: string;
    timestamp: Date;
    attachments?: string[];
  }[];

  // Computed fields
  get isOverdue(): boolean {
    if (!this.responseDeadline) return false;
    return new Date() > this.responseDeadline && 
           this.status === DisputeStatus.PENDING;
  }

  get daysSinceCreated(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isResolved(): boolean {
    return [
      DisputeStatus.RESOLVED,
      DisputeStatus.DISMISSED,
      DisputeStatus.ESCALATED,
    ].includes(this.status);
  }
}
