import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PAGINATION_LIMITS } from '../constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: PAGINATION_LIMITS.DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = PAGINATION_LIMITS.DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: PAGINATION_LIMITS.DEFAULT,
    minimum: 1,
    maximum: PAGINATION_LIMITS.MAX,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_LIMITS.MAX)
  limit: number = PAGINATION_LIMITS.DEFAULT;
}
