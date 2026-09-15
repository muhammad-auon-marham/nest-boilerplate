import { registerAs } from '@nestjs/config';
import { createHmac } from 'crypto';

const MIN_DERIVATION_SOURCE_LENGTH = 16;

/**
 * Secrets never fall back to a hardcoded value: booting with a guessable signing key is worse than not booting.
 *
 * Order: the explicit variable, else a one-way HMAC of DB_PASSWORD (Launchpad injects a generated one and
 * launchpad.json cannot hold secrets), else fail. Rotating DB_PASSWORD then signs everyone out.
 */
const resolveSecret = (name: string, purpose: string): string => {
  const explicit = process.env[name];
  if (explicit) {
    return explicit;
  }

  const source = process.env.DB_PASSWORD;
  if (source && source.length >= MIN_DERIVATION_SOURCE_LENGTH) {
    return createHmac('sha256', source).update(`jwt:${purpose}`).digest('hex');
  }

  throw new Error(
    `${name} is not set. Generate one with \`openssl rand -hex 32\`.`,
  );
};

export default registerAs('jwt', () => ({
  secret: resolveSecret('JWT_SECRET', 'access'),
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshSecret: resolveSecret('JWT_REFRESH_SECRET', 'refresh'),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
