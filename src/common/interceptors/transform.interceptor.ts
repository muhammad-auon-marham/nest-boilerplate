import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 1. If data is already an instance of ApiResponseDto, return as is
        if (data instanceof ApiResponseDto) return data;

        // 2. Generic check: If data has a 'status' field set to false OR has an 'error' field

        let message = 'Success';
        let isError = false;

        if (data && typeof data === 'object') {
          // Detect error-like payloads
          if (data.status === false || data.error) {
            isError = true;
          }

          // Extract message
          if ('message' in data) {
            message = data.message;
            delete data.message;
          }

          // Remove noisy keys
          if ('status' in data) {
            delete data.status;
          }

          if ('error' in data) {
            delete data.error;
          }
        }

        if (isError) {
          return ApiResponseDto.error(message, data ?? null);
        }
        return ApiResponseDto.success(data, message);
      }),
    );
  }
}
