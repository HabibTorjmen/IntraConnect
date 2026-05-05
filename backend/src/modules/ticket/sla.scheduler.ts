import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TicketService } from './ticket.service';

@Injectable()
export class SlaScheduler {
  private readonly logger = new Logger(SlaScheduler.name);
  constructor(private readonly tickets: TicketService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    try {
      const result = await this.tickets.scanAndEscalate();
      if (result.escalated > 0) {
        this.logger.log(
          `SLA scan: scanned=${result.scanned} escalated=${result.escalated}`,
        );
      }
    } catch (err) {
      this.logger.error('SLA scan failed', err as Error);
    }
  }
}
