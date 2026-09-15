import jwtConfig from '../jwt.config';

describe('jwt config', () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env.JWT_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    delete process.env.DB_PASSWORD;
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

  it('derives distinct secrets from DB_PASSWORD when none are set', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    process.env.DB_PASSWORD = 'a-long-generated-database-password';

    const config = jwtConfig();

    expect(config.secret).toMatch(/^[a-f0-9]{64}$/);
    expect(config.refreshSecret).toMatch(/^[a-f0-9]{64}$/);
    expect(config.secret).not.toBe(config.refreshSecret);
    expect(config.secret).not.toContain(process.env.DB_PASSWORD);
    expect(jwtConfig().secret).toBe(config.secret);
  });

  it.each(['JWT_SECRET', 'JWT_REFRESH_SECRET'])(
    'throws when %s is missing and there is nothing to derive it from',
    (name) => {
      delete process.env[name];

      expect(() => jwtConfig()).toThrow(`${name} is not set`);
    },
  );

  it('refuses to derive from a short DB_PASSWORD', () => {
    delete process.env.JWT_SECRET;
    process.env.DB_PASSWORD = 'short';

    expect(() => jwtConfig()).toThrow('JWT_SECRET is not set');
  });
});
