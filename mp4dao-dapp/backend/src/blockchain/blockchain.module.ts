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
import { BlockchainService } from './blockchain.service';

@Module({
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
