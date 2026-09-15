import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const driver = configService.get('cache.driver');
        const ttl = configService.get('cache.ttl');

        if (driver === 'redis') {
          const host = configService.get('cache.host');
          const port = configService.get('cache.port');
          const password = configService.get('cache.password');
          const db = configService.get('cache.db');

          return {
            store: await redisStore({
              socket: {
                host,
                port,
              },
              password: password || undefined,
              database: db,
              ttl: ttl,
            } as any),
            ttl: ttl,
          };
        }

        // Default to memory
        return {
          ttl: ttl * 1000, // Convert seconds to milliseconds
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
