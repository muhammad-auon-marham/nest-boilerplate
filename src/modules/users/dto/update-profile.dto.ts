import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PartialType(
  PickType(CreateUserDto, ['name'] as const),
) {}
