import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '@common/dto';
import { PaginatedResult } from '@common/interfaces';
import { PaginationUtil, PasswordUtil } from '@common/utils';
import { LoggerService } from '@core/logger/logger.service';
import { CreateUserDto, UpdateProfileDto, UpdateUserDto } from '../dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.assertEmailAvailable(createUserDto.email);

    const user = await this.userRepository.createAndSave({
      ...createUserDto,
      password: await PasswordUtil.hash(createUserDto.password),
    });
    this.logger.log(`User ${user.id} created`, UsersService.name);

    return this.findOne(user.id);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const [users, total] = await this.userRepository.findPaginated(query);

    return PaginationUtil.buildResult(users, total, query);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.userRepository.findActiveById(id);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async findByIdWithPassword(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithPassword(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.assertEmailAvailable(updateUserDto.email);
    }

    await this.userRepository.updateById(id, updateUserDto);

    return this.findOne(id);
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.update(id, updateProfileDto);
  }

  async updatePassword(id: string, plainPassword: string): Promise<void> {
    await this.userRepository.updateById(id, {
      password: await PasswordUtil.hash(plainPassword),
    });
  }

  async recordLogin(id: string): Promise<void> {
    await this.userRepository.updateById(id, { lastLoginAt: new Date() });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepository.softDeleteById(id);
    this.logger.log(`User ${id} deleted`, UsersService.name);
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    if (await this.userRepository.existsByEmail(email)) {
      throw new ConflictException('A user with this email already exists');
    }
  }
}
