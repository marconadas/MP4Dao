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
