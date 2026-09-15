import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import {
  appConfig,
  cacheConfig,
  databaseConfig,
  jwtConfig,
  mailConfig,
  queueConfig,
  redisConfig,
} from './config';
import { CoreModule } from './core/core.module';
import {
  CorrelationIdMiddleware,
  LoggerMiddleware,
} from './common/middlewares';
import { ThrottlerGuard } from './common/guards/throttler.guard';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { LoggingModule } from './modules/logging';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        queueConfig,
        mailConfig,
        cacheConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('app.throttle.ttl'),
          limit: configService.getOrThrow<number>('app.throttle.limit'),
        },
      ],
    }),

    // Cron jobs (@Cron / @Interval)
    ScheduleModule.forRoot(),

    // Core infrastructure: database, cache, queue, logger, events
    CoreModule,

    // Feature modules
    AuthModule,
    UsersModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, LoggerMiddleware)
      .forRoutes({ path: 'api/*path', method: RequestMethod.ALL });
  }
}
