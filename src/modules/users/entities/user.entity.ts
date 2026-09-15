import { Entity, Column, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@core/database/base.entity';
import { Role, Status } from '@common/enums';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Index('UQ_users_email', { unique: true })
  @Column({ length: 191 })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
  status: Status;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;
}
