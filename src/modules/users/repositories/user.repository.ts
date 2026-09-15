import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository';
import { Status } from '@common/enums';
import { PaginationParams, PaginationUtil } from '@common/utils';
import { User } from '../entities/user.entity';

const PUBLIC_USER_FIELDS: (keyof User)[] = [
  'id',
  'name',
  'email',
  'role',
  'status',
  'lastLoginAt',
  'createdAt',
  'updatedAt',
];

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id }, select: PUBLIC_USER_FIELDS });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.findOne({
      where: { id, status: Status.ACTIVE },
      select: PUBLIC_USER_FIELDS,
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      select: [...PUBLIC_USER_FIELDS, 'password'],
    });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      select: [...PUBLIC_USER_FIELDS, 'password'],
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ where: { email } });
  }

  async findPaginated(pagination: PaginationParams): Promise<[User[], number]> {
    return this.findAndCount({
      select: PUBLIC_USER_FIELDS,
      order: { createdAt: 'DESC' },
      skip: PaginationUtil.getSkip(pagination),
      take: pagination.limit,
    });
  }

  async createAndSave(data: Partial<User>): Promise<User> {
    return this.save(this.create(data));
  }

  async updateById(id: string, data: Partial<User>): Promise<void> {
    await this.update({ id }, data);
  }

  async softDeleteById(id: string): Promise<void> {
    await this.softDelete({ id });
  }
}
