import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { LoggerModule } from './logger/logger.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    QueueModule,
    LoggerModule,
    EventsModule,
  ],
  exports: [
    DatabaseModule,
    CacheModule,
    QueueModule,
    LoggerModule,
    EventsModule,
  ],
})
export class CoreModule {}
