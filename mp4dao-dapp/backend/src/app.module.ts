import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './auth/auth.module';
import { WorksModule } from './works/works.module';
import { DisputesModule } from './disputes/disputes.module';
import { StorageModule } from './storage/storage.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NFTModule } from './nft/nft.module';
import { TokenModule } from './token/token.module';

// Configuration
import { databaseConfig } from './database/database.config';
import { redisConfig } from './database/redis.config';

// Health & Monitoring
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../env.example',
      expandVariables: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),

    // Redis & Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: redisConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_WINDOW_MS', 900000), // 15 min
            limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
          },
        ],
      }),
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Business Modules
    AuthModule,
    WorksModule,
    DisputesModule,
    StorageModule,
    BlockchainModule,
    NotificationsModule,
    AnalyticsModule,
    NFTModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
