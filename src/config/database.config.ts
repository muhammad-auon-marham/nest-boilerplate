import { registerAs } from '@nestjs/config';
import { join } from 'path';

// Variable names match what Launchpad injects (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'app_db',

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],

  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  charset: 'utf8mb4',
  timezone: process.env.DB_TIMEZONE || 'Z',
}));
