import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { redactSensitiveFields } from '@common/utils';
import { ApiLogService } from '../services/api-log.service';

/**
 * Persists every API request to `api_logs` (fire-and-forget).
 * Sensitive body fields are redacted before they are stored — see `SENSITIVE_FIELDS`.
 */
@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLoggingInterceptor.name);

  constructor(private readonly apiLogService: ApiLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Log after handle() so the body is parsed (e.g. multipart uploads)
    return next.handle().pipe(
      tap({
        next: () => this.logRequest(request),
        error: () => this.logRequest(request),
      }),
    );
  }

  private logRequest(request: any): void {
    try {
      const { method, url, body, query, headers, path } = request;

      const payloadData: Record<string, unknown> =
        typeof body === 'object' && body !== null
          ? redactSensitiveFields({ ...body })
          : {};
      payloadData.method = method;
      if (query && Object.keys(query).length > 0) {
        payloadData.query = redactSensitiveFields(query);
      }
      payloadData.jwtUserId = request.user?.id ?? null;

      this.apiLogService
        .createLog({
          action: path || url.split('?')[0],
          payload: JSON.stringify(payloadData),
          appType: this.parseIntegerHeader(headers['app-type']),
          deviceType: this.parseIntegerHeader(headers['device-type']),
        })
        .catch((error: Error) => {
          this.logger.error('Failed to log request to database', error.stack);
        });
    } catch (error) {
      this.logger.error(
        'Failed to log request to database',
        (error as Error).stack,
      );
    }
  }

  private parseIntegerHeader(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return null;
    }

    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
  }
}
