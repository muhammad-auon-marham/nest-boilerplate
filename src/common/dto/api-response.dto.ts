import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T | null;

  // @ApiProperty()
  // timestamp: string;

  constructor(success: boolean, message: string, data: T | null) {
    this.success = success;
    this.message = message;
    this.data = data;
    // this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error<T>(message: string, data: T | null = null): ApiResponseDto<T> {
    return new ApiResponseDto(false, message, data);
  }
}
