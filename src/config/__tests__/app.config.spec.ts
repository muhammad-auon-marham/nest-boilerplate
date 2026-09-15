import appConfig from '../app.config';

describe('app config', () => {
  const original = { ...process.env };

  beforeEach(() => {
    for (const name of [
      'NODE_ENV',
      'PORT',
      'TZ',
      'THROTTLE_TTL',
      'THROTTLE_LIMIT',
    ]) {
      delete process.env[name];
    }
  });

  afterAll(() => {
    process.env = original;
  });

  it('falls back to safe defaults when nothing is configured', () => {
    const config = appConfig();

    expect(config.env).toBe('development');
    expect(config.port).toBe(3000);
    expect(config.timezone).toBe('UTC');
    expect(config.throttle).toEqual({ ttl: 60000, limit: 100 });
  });

  it('reads values from the environment', () => {
    process.env.PORT = '8080';
    process.env.TZ = 'Europe/Berlin';
    process.env.THROTTLE_LIMIT = '10';

    const config = appConfig();

    expect(config.port).toBe(8080);
    expect(config.timezone).toBe('Europe/Berlin');
    expect(config.throttle.limit).toBe(10);
  });
});
