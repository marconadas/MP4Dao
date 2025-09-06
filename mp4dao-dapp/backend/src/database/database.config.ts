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
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    url: configService.get('DATABASE_URL'),
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'mp4dao'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_DATABASE', 'mp4dao_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: !isProduction, // Apenas em desenvolvimento
    logging: !isProduction,
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,
    extra: {
      max: 20, // Máximo de conexões no pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
};
