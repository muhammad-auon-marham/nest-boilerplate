import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
} from './common/interceptors';
import { LoggerService } from './core/logger';
import { ApiLoggingInterceptor } from './modules/logging/interceptors/api-logging.interceptor';
import { ApiLogService } from './modules/logging/services/api-log.service';

// Global polyfill for BigInt serialization to JSON.
// This prevents "TypeError: Do not know how to serialize a BigInt" when returning BigInt values in API responses.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Process timezone (defaults to UTC) — see TZ in .env.example
  process.env.TZ = configService.get<string>('app.timezone');

  app.useLogger(logger);

  // Behind a reverse proxy (Launchpad, Docker): resolve the real client IP
  app.set('trust proxy', configService.get<string>('app.trustProxy'));

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin'),
    credentials: true,
  });

  // Global prefix and versioning: /api/v1/... — everything must stay under /api (Launchpad routes it here)
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(logger),
    new ApiLoggingInterceptor(app.get(ApiLogService), app.get(Reflector)),
  );

  // Swagger documentation
  if (configService.get<string>('app.env') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('app.name') ?? 'API')
      .setDescription('API endpoints documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  app.enableShutdownHooks();

  const port = configService.get<number>('app.port') || 3000;
  const host = configService.get<string>('app.host') ?? '0.0.0.0';
  await app.listen(port, host);

  logger.log(`Application running on ${host}:${port}`, 'Bootstrap');
}

void bootstrap();
