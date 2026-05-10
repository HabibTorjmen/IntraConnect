import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DocumentService } from './document.service';

/**
 * charge.docx §4.7 — HR Admin notified before document expiry.
 * Runs daily; window defaults to 30 days; each document is notified once.
 */
@Injectable()
export class DocumentExpiryScheduler {
  private readonly logger = new Logger(DocumentExpiryScheduler.name);
  constructor(private readonly documents: DocumentService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async tick() {
    try {
      const result = await this.documents.scanExpiringAndNotify(30);
      if (result.notified > 0) {
        this.logger.log(
          `Document expiry scan: scanned=${result.scanned} notified=${result.notified}`,
        );
      }
    } catch (err) {
      this.logger.error('Document expiry scan failed', err as Error);
    }
  }
}
