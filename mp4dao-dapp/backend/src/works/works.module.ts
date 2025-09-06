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
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';
import { Work } from './entities/work.entity';
import { User } from '../auth/entities/user.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Work, User]),
    BlockchainModule,
    StorageModule,
  ],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
