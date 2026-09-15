import { Injectable } from '@nestjs/common';
import { ApiLog } from '../entities/api-log.entity';
import { ApiLogRepository } from '../repositories/api-log.repository';

@Injectable()
export class ApiLogService {
  constructor(private readonly apiLogRepository: ApiLogRepository) {}

  async createLog(data: Partial<ApiLog>): Promise<void> {
    return this.apiLogRepository.createLog(data);
  }
}
