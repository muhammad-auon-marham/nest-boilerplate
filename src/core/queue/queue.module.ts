import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password') || undefined,
          db: configService.get('redis.db'),
        },
        prefix: configService.get('redis.keyPrefix'),
        defaultJobOptions: configService.get('queue.defaultJobOptions'),
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
