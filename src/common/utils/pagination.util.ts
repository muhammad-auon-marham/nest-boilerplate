import { PaginatedResult } from '../interfaces';

export interface PaginationParams {
  page: number;
  limit: number;
}

export class PaginationUtil {
  static getSkip({ page, limit }: PaginationParams): number {
    return (page - 1) * limit;
  }

  static buildResult<T>(
    data: T[],
    total: number,
    { page, limit }: PaginationParams,
  ): PaginatedResult<T> {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
