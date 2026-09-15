import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiLog } from '../entities/api-log.entity';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class ApiLogRepository extends BaseRepository<ApiLog> {
  constructor(private dataSource: DataSource) {
    super(ApiLog, dataSource.createEntityManager());
  }

  async createLog(data: Partial<ApiLog>): Promise<void> {
    const log = this.create(data);
    await this.insert(log);
  }
}
