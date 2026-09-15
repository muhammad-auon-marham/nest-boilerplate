import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { AppType, DeviceType } from '@common/enums';

@Entity('api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string; // BigInt represented as string

  @Column({ type: 'varchar', length: 255, nullable: true })
  action: string | null;

  @Column({ type: 'text', nullable: true })
  payload: string | null;

  @Column({ type: 'tinyint', name: 'app_type', nullable: true })
  appType: AppType | null;

  @Column({ type: 'tinyint', name: 'device_type', nullable: true })
  deviceType: DeviceType | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
