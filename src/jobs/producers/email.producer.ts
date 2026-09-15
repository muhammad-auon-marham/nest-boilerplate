import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_JOBS, QUEUE_NAMES } from '../constants/queue-names.constant';
import { EmailJobData } from '../interfaces/email-job.interface';

@Injectable()
export class EmailProducer {
  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async sendEmail(data: EmailJobData): Promise<void> {
    await this.emailQueue.add(EMAIL_JOBS.SEND, data);
  }
}
