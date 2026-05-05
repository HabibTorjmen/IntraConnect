import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor() {
    this.from = process.env.SMTP_FROM ?? 'no-reply@intraconnect.local';
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: (process.env.SMTP_SECURE ?? 'false') === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    } else {
      this.logger.warn(
        'SMTP_HOST not configured — email delivery disabled (notifications will be logged as failed).',
      );
    }
  }

  async send(payload: EmailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!this.transporter) {
      return { ok: false, error: 'SMTP not configured' };
    }
    try {
      await this.transporter.sendMail({ from: this.from, ...payload });
      return { ok: true };
    } catch (err) {
      this.logger.error(`Failed to send email: ${(err as Error).message}`);
      return { ok: false, error: (err as Error).message };
    }
  }
}
