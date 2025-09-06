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
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            redis: { type: 'string', example: 'connected' },
            blockchain: { type: 'string', example: 'connected' },
            ipfs: { type: 'string', example: 'connected' },
          }
        }
      }
    }
  })
  getHealth() {
    return this.appService.getHealthStatus();
  }

  @Get()
  @ApiOperation({ summary: 'Root endpoint with API information' })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Mp4Dao API' },
        description: { type: 'string', example: 'API para registo de copyright musical em Angola' },
        version: { type: 'string', example: '1.0.0' },
        documentation: { type: 'string', example: '/api/v1/docs' },
        status: { type: 'string', example: 'running' },
      }
    }
  })
  getInfo() {
    return this.appService.getApiInfo();
  }
}
