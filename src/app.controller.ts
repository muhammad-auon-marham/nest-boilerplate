import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, SkipApiLog } from './common/decorators';
import { AppService, HealthStatus } from './app.service';

// Version-neutral so the probe path is a stable /api/health (launchpad.json → healthPath)
@ApiTags('Health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @SkipApiLog()
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
