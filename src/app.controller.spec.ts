import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHealth', () => {
    it('should report the service as healthy', () => {
      const appController = app.get(AppController);

      const result = appController.getHealth();

      expect(result.status).toBe('ok');
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});
