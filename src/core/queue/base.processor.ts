import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

/**
 * Extend this in every `@Processor()` to get consistent job lifecycle logging.
 */
export abstract class BaseProcessor extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  @OnWorkerEvent('active')
  onActive(job: Job): void {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Completed job ${job.id} of type ${job.name}.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }
}
