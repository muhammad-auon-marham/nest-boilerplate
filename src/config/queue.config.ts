import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
}));
