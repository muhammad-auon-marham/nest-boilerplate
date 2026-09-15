import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from './entities/api-log.entity';
import { ApiLogService } from './services/api-log.service';
import { ApiLogRepository } from './repositories/api-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApiLog])],
  providers: [ApiLogService, ApiLogRepository],
  exports: [ApiLogService],
})
export class LoggingModule {}
