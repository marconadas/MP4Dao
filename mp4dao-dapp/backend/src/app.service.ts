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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV', 'development'),
      version: '1.0.0',
      services: {
        database: 'connected', // TODO: Implement actual health checks
        redis: 'connected',
        blockchain: 'connected',
        ipfs: 'connected',
      },
    };
  }

  getApiInfo() {
    return {
      name: 'Mp4Dao API',
      description: 'API para registo de copyright musical em Angola',
      version: '1.0.0',
      documentation: `/${this.configService.get('API_PREFIX', 'api/v1')}/docs`,
      status: 'running',
      features: [
        'Registo de obras musicais na blockchain',
        'Sistema de disputas e mediação',
        'Armazenamento seguro com IPFS',
        'Autenticação Web3',
        'Integração com sociedades de gestão angolanas',
      ],
      legal: {
        compliance: 'Lei n.º 15/14 (Angola)',
        privacy: 'GDPR compliant',
        international: 'Convenção de Berna',
      },
    };
  }
}
