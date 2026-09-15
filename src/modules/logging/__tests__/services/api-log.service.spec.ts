import { Test, TestingModule } from '@nestjs/testing';
import { ApiLogService } from '../../services/api-log.service';
import { ApiLogRepository } from '../../repositories/api-log.repository';
import { ApiLog } from '../../entities/api-log.entity';

describe('ApiLogService', () => {
  let service: ApiLogService;
  let repository: jest.Mocked<ApiLogRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiLogService,
        {
          provide: ApiLogRepository,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiLogService>(ApiLogService);
    repository = module.get(ApiLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLog', () => {
    it('should create API log successfully', async () => {
      const logData: Partial<ApiLog> = {
        action: 'GET /api/v1/users',
        payload: JSON.stringify({ userId: 100 }),
        appType: 1,
        deviceType: 1,
      };

      repository.createLog.mockResolvedValue(undefined);

      await service.createLog(logData);

      expect(repository.createLog).toHaveBeenCalledWith(logData);
    });

    it('should handle log creation with minimal data', async () => {
      const logData: Partial<ApiLog> = {
        action: 'POST /api/v1/auth/login',
      };

      repository.createLog.mockResolvedValue(undefined);

      await service.createLog(logData);

      expect(repository.createLog).toHaveBeenCalledWith(logData);
    });

    it('should handle log creation with full data', async () => {
      const logData: Partial<ApiLog> = {
        action: 'POST /api/v1/users',
        payload: JSON.stringify({ name: 'Jane Doe', password: '[REDACTED]' }),
        appType: 1,
        deviceType: 2,
      };

      repository.createLog.mockResolvedValue(undefined);

      await service.createLog(logData);

      expect(repository.createLog).toHaveBeenCalledWith(logData);
    });

    it('should propagate repository errors', async () => {
      const logData: Partial<ApiLog> = {
        action: 'GET /api/v1/users',
      };

      repository.createLog.mockRejectedValue(new Error('Database error'));

      await expect(service.createLog(logData)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
