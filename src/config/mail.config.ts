import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  username: process.env.MAIL_USERNAME || '',
  password: process.env.MAIL_PASSWORD || '',
  fromEmail: process.env.MAIL_FROM_ADDRESS || 'no-reply@example.com',
  fromName:
    process.env.MAIL_FROM_NAME || process.env.APP_NAME || 'NestJS Boilerplate',
}));
