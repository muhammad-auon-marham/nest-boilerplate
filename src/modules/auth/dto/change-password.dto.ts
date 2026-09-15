import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
} from '@modules/users/dto/create-user.dto';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'OldPassword123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: PASSWORD_RULE_MESSAGE,
    example: 'NewPassword123!',
  })
  @IsString()
  @Matches(PASSWORD_RULE, { message: PASSWORD_RULE_MESSAGE })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
