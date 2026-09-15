/**
 * Request body keys that must never be persisted or logged in plain text.
 * Matched case-insensitively by `redactSensitiveFields()`.
 */
export const SENSITIVE_FIELDS: readonly string[] = [
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'accessToken',
  'refreshToken',
  'token',
  'otp',
  'secret',
];

export const REDACTED_VALUE = '[REDACTED]';
