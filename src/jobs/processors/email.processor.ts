import { Processor } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { createTransport, Transporter } from 'nodemailer';
import { BaseProcessor } from '@core/queue/base.processor';
import { QUEUE_NAMES } from '../constants/queue-names.constant';
import { EmailJobData } from '../interfaces/email-job.interface';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends BaseProcessor {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: this.configService.get<string>('mail.username')
        ? {
            user: this.configService.get<string>('mail.username'),
            pass: this.configService.get<string>('mail.password'),
          }
        : undefined,
    });
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const fromName = this.configService.get<string>('mail.fromName');
    const fromEmail = this.configService.get<string>('mail.fromEmail');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
      text: job.data.text,
    });
  }
}
