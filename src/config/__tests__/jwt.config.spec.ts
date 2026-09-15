import jwtConfig from '../jwt.config';

describe('jwt config', () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env.JWT_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;
  });

  afterAll(() => {
    process.env = original;
  });

  it('reads secrets from the environment', () => {
    const config = jwtConfig();

    expect(config.secret).toBe('access-secret');
    expect(config.refreshSecret).toBe('refresh-secret');
    expect(config.expiresIn).toBe('1d');
    expect(config.refreshExpiresIn).toBe('7d');
  });

  it.each(['JWT_SECRET', 'JWT_REFRESH_SECRET'])(
    'throws when %s is missing instead of using a default',
    (name) => {
      delete process.env[name];

      expect(() => jwtConfig()).toThrow(`${name} is not set`);
    },
  );
});
