import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';

/**
 * charge.docx §4.12 — Reminders, auto-close, and leave integration.
 */
@Injectable()
export class AttendanceScheduler {
  private readonly logger = new Logger(AttendanceScheduler.name);
  constructor(private readonly attendance: AttendanceService) {}

  /** Mark records as on_leave once per day (early morning). */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async syncOnLeave() {
    try {
      await this.attendance.syncOnLeaveForToday();
    } catch (err) {
      this.logger.error('syncOnLeaveForToday failed', err as Error);
    }
  }

  /** Send clock-in reminders every 5 minutes during the work morning. */
  @Cron('*/5 * * * *')
  async reminders() {
    try {
      const result = await this.attendance.sendClockInReminders();
      if (result.sent > 0) {
        this.logger.log(`Attendance reminders sent: ${result.sent}`);
      }
    } catch (err) {
      this.logger.error('sendClockInReminders failed', err as Error);
    }
  }

  /** Auto-close any still-open days. */
  @Cron('*/10 * * * *')
  async autoClose() {
    try {
      const result = await this.attendance.autoCloseDay();
      if (result.closed > 0) {
        this.logger.log(`Attendance auto-closed: ${result.closed}`);
      }
    } catch (err) {
      this.logger.error('autoCloseDay failed', err as Error);
    }
  }
}
