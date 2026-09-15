import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './constants/queue-names.constant';
import { EmailProcessor } from './processors/email.processor';
import { EmailProducer } from './producers/email.producer';

/**
 * Background jobs. Import this module in `AppModule` once Redis is available.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL })],
  providers: [EmailProcessor, EmailProducer],
  exports: [EmailProducer],
})
export class JobsModule {}
