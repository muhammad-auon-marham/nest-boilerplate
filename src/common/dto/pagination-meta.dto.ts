import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items' })
  @Expose()
  total: number;

  @ApiProperty({ description: 'Current page number' })
  @Expose()
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  @Expose()
  limit: number;

  @ApiProperty({ description: 'Last page number' })
  @Expose()
  lastPage: number;
}
