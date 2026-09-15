import { SetMetadata } from '@nestjs/common';

export const SKIP_API_LOG_KEY = 'skipApiLog';

/**
 * Keeps a route out of `api_logs` — use for high-frequency, low-value routes such as health probes.
 */
export const SkipApiLog = () => SetMetadata(SKIP_API_LOG_KEY, true);
