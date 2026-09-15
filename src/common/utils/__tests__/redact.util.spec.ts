import { REDACTED_VALUE } from '../../constants';
import { redactSensitiveFields } from '../redact.util';

describe('redactSensitiveFields', () => {
  it('masks sensitive keys at any depth, case-insensitively', () => {
    const result = redactSensitiveFields({
      email: 'jane@example.com',
      Password: 'Password123!',
      nested: { refreshToken: 'abc', items: [{ otp: '1234', keep: true }] },
    });

    expect(result).toEqual({
      email: 'jane@example.com',
      Password: REDACTED_VALUE,
      nested: {
        refreshToken: REDACTED_VALUE,
        items: [{ otp: REDACTED_VALUE, keep: true }],
      },
    });
  });

  it('does not mutate the input', () => {
    const input = { password: 'secret' };

    redactSensitiveFields(input);

    expect(input.password).toBe('secret');
  });

  it('returns primitives unchanged', () => {
    expect(redactSensitiveFields('plain')).toBe('plain');
    expect(redactSensitiveFields(null)).toBeNull();
  });
});
