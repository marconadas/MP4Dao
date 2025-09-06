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
import { ConfigService } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

export const redisConfig = (
  configService: ConfigService,
): BullModuleOptions => {
  const redisUrl = configService.get('REDIS_URL', 'redis://localhost:6379');
  
  return {
    redis: redisUrl,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  };
};
