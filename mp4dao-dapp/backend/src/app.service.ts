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
