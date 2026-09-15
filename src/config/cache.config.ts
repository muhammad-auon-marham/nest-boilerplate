import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  driver: process.env.CACHE_DRIVER || 'memory',
  ttl: parseInt(process.env.CACHE_TTL || '600', 10),
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0', 10),
  prefix: process.env.REDIS_PREFIX || 'app:',
}));
