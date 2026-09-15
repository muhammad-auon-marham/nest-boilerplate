import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import { TypeOrmCustomLogger } from './typeorm-logger';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, LoggerService],
      useFactory: (
        configService: ConfigService,
        loggerService: LoggerService,
      ) => {
        const dbConfig = configService.get('database');
        return {
          ...dbConfig,
          autoLoadEntities: true,
          // Only use custom logger if logging is enabled
          logger: dbConfig.logging
            ? new TypeOrmCustomLogger(loggerService)
            : undefined,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
