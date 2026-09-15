import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'NestJS Boilerplate',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  // Express "trust proxy": trust hops on private networks (Docker, reverse proxies) so req.ip is the
  // real client — rate limiting would otherwise throttle every user behind the proxy as one IP.
  trustProxy: process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal',
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
  timezone: process.env.TZ || 'UTC',
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
}));
