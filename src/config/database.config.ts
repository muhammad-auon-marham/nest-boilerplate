import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'app_db',

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],

  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  charset: 'utf8mb4',
  timezone: process.env.DB_TIMEZONE || 'Z',
}));
