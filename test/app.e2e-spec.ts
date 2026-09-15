// Boots the full AppModule, so a reachable MySQL database (see .env) is required.
// Run: npm run test:e2e

import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters';
import { TransformInterceptor } from './../src/common/interceptors';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/v1/health is public and wrapped in the standard envelope', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ok');
      });
  });

  it('GET /api/v1/users requires authentication', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBe(false);
      });
  });

  it('POST /api/v1/auth/register validates the body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email' })
      .expect(400);
  });
});
