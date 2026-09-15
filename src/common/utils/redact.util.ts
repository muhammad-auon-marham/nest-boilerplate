import { REDACTED_VALUE, SENSITIVE_FIELDS } from '../constants';

const SENSITIVE_KEYS = new Set(
  SENSITIVE_FIELDS.map((field) => field.toLowerCase()),
);

/**
 * Returns a deep copy of `value` with every sensitive key (see `SENSITIVE_FIELDS`) masked.
 * Use before logging or persisting request payloads.
 */
export function redactSensitiveFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item)) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase())
          ? REDACTED_VALUE
          : redactSensitiveFields(item),
      ]),
    ) as T;
  }

  return value;
}
