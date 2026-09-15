import { registerAs } from '@nestjs/config';

// Secrets have no fallback: booting with a guessable signing key is worse than not booting.
const requireSecret = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Generate one with \`openssl rand -hex 32\`.`,
    );
  }
  return value;
};

export default registerAs('jwt', () => ({
  secret: requireSecret('JWT_SECRET'),
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshSecret: requireSecret('JWT_REFRESH_SECRET'),
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
