import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(req.ips.length ? req.ips[0] : req.ip);
  }
}
