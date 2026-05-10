import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AttendanceAction, deriveState, nextState } from './state-machine';

function toDateOnly(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function parseHHmm(s: string | null | undefined): { h: number; m: number } | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
}

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  /**
   * charge.docx §4.12 — pick the most-specific applicable policy for an employee.
   * Order: location → department → role → default.
   */
  async resolvePolicyForEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: { include: { roles: true } } },
    });
    if (!employee) return this.prisma.attendancePolicy.findFirst({ where: { scope: 'default' } });
    const policies = await this.prisma.attendancePolicy.findMany();
    if (employee.workLocation) {
      const p = policies.find(
        (x) => x.scope === 'location' && x.scopeValue === employee.workLocation,
      );
      if (p) return p;
    }
    if (employee.departmentId) {
      const p = policies.find(
        (x) => x.scope === 'department' && x.scopeValue === employee.departmentId,
      );
      if (p) return p;
    }
    const roleCodes = employee.user?.roles.map((r) => r.code) ?? [];
    for (const code of roleCodes) {
      const p = policies.find((x) => x.scope === 'role' && x.scopeValue === code);
      if (p) return p;
    }
    return policies.find((x) => x.scope === 'default') ?? null;
  }

  async listPolicies() {
    return this.prisma.attendancePolicy.findMany({ orderBy: { name: 'asc' } });
  }

  async upsertPolicy(data: any) {
    if (data.id) {
      return this.prisma.attendancePolicy.update({ where: { id: data.id }, data });
    }
    return this.prisma.attendancePolicy.create({ data });
  }

  async getOrCreateRecord(employeeId: string, day: Date) {
    const date = toDateOnly(day);
    let record = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });
    if (!record) {
      record = await this.prisma.attendanceRecord.create({
        data: { employeeId, date },
      });
    }
    return record;
  }

  async todayState(employeeId: string) {
    const record = await this.getOrCreateRecord(employeeId, new Date());
    const events = await this.prisma.attendanceEvent.findMany({
      where: { recordId: record.id },
      orderBy: { occurredAt: 'asc' },
    });
    const state = deriveState(events);
    return { state, record, events };
  }

  async submitAction(employeeId: string, action: AttendanceAction) {
    const { state, record, events } = await this.todayState(employeeId);
    const after = nextState(state, action); // throws on invalid
    const event = await this.prisma.attendanceEvent.create({
      data: { type: action, employeeId, recordId: record.id },
    });
    await this.recompute(record.id, [...events, event]);
    return { state: after, record };
  }

  private async recompute(recordId: string, events: { type: string; occurredAt: Date }[]) {
    let workedMs = 0;
    let breakMs = 0;
    let pairStart: number | null = null;
    let onBreakStart: number | null = null;
    for (const e of events) {
      const t = e.occurredAt.getTime();
      if (e.type === 'clock_in') pairStart = t;
      else if (e.type === 'break_start' && pairStart !== null) {
        workedMs += t - pairStart;
        pairStart = null;
        onBreakStart = t;
      } else if (e.type === 'break_end' && onBreakStart !== null) {
        breakMs += t - onBreakStart;
        onBreakStart = null;
        pairStart = t;
      } else if (e.type === 'clock_out' && pairStart !== null) {
        workedMs += t - pairStart;
        pairStart = null;
      }
    }
    const status = events.some((e) => e.type === 'clock_out') ? 'closed' : 'open';
    await this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        workedMinutes: Math.floor(workedMs / 60_000),
        breakMinutes: Math.floor(breakMs / 60_000),
        status,
      },
    });
  }

  async correct(
    recordId: string,
    actorUserId: string,
    field: string,
    newValueIso: string,
    reason: string,
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Reason is mandatory for manual corrections.');
    }
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) throw new NotFoundException('Record not found');

    const event = await this.prisma.attendanceEvent.create({
      data: {
        type: field,
        source: 'hr_correction',
        reason,
        employeeId: record.employeeId,
        recordId,
        occurredAt: new Date(newValueIso),
        correctedById: actorUserId,
      },
    });
    await this.prisma.attendanceAdjustmentLog.create({
      data: {
        recordId,
        field,
        oldValue: null,
        newValue: newValueIso,
        reason,
        adjustedById: actorUserId,
      },
    });
    const events = await this.prisma.attendanceEvent.findMany({
      where: { recordId },
      orderBy: { occurredAt: 'asc' },
    });
    await this.recompute(recordId, events);
    return event;
  }

  async dailySummary(employeeId: string, from: Date, to: Date) {
    return this.prisma.attendanceRecord.findMany({
      where: { employeeId, date: { gte: toDateOnly(from), lte: toDateOnly(to) } },
      include: { events: true },
      orderBy: { date: 'asc' },
    });
  }

  async teamLive(managerEmployeeId: string) {
    const reports = await this.prisma.employee.findMany({
      where: { managerId: managerEmployeeId },
      select: { id: true, fullName: true },
    });
    const today = toDateOnly(new Date());
    const records = await this.prisma.attendanceRecord.findMany({
      where: { employeeId: { in: reports.map((r) => r.id) }, date: today },
      include: { events: { orderBy: { occurredAt: 'asc' } } },
    });
    return reports.map((r) => {
      const rec = records.find((x) => x.employeeId === r.id);
      const state = rec ? deriveState(rec.events) : 'idle';
      return {
        employeeId: r.id,
        fullName: r.fullName,
        state,
        workedMinutes: rec?.workedMinutes ?? 0,
        breakMinutes: rec?.breakMinutes ?? 0,
      };
    });
  }

  async exportCsv(employeeId: string, from: Date, to: Date, scopeIsPowerful: boolean) {
    if (!scopeIsPowerful) {
      // employees can only export their own
    }
    const records = await this.dailySummary(employeeId, from, to);
    const header = ['date', 'workedMinutes', 'breakMinutes', 'status'];
    const rows = records.map((r) =>
      [r.date.toISOString().slice(0, 10), r.workedMinutes, r.breakMinutes, r.status].join(','),
    );
    return [header.join(','), ...rows].join('\n');
  }

  /**
   * charge.docx §4.12 — mark today's record as on_leave for any employee
   * with an APPROVED leave covering today.
   */
  async syncOnLeaveForToday() {
    const today = toDateOnly(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const onLeaveToday = await this.prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: tomorrow },
        endDate: { gte: today },
      },
      select: { employeeId: true },
    });
    if (!onLeaveToday.length) return { marked: 0 };
    const employeeIds = Array.from(new Set(onLeaveToday.map((l) => l.employeeId)));
    let marked = 0;
    for (const employeeId of employeeIds) {
      const rec = await this.getOrCreateRecord(employeeId, today);
      if (rec.status !== 'on_leave') {
        await this.prisma.attendanceRecord.update({
          where: { id: rec.id },
          data: { status: 'on_leave' },
        });
        marked++;
      }
    }
    return { marked };
  }

  /**
   * charge.docx §4.12 — Employee reminder if not clocked in by expected time.
   * Skips employees on approved leave and inactive employees.
   */
  async sendClockInReminders() {
    const today = toDateOnly(new Date());
    const now = new Date();
    const employees = await this.prisma.employee.findMany({
      where: { status: 'active', userId: { not: null } },
      select: { id: true, userId: true, fullName: true },
    });
    let sent = 0;
    for (const emp of employees) {
      const policy = await this.resolvePolicyForEmployee(emp.id);
      if (!policy?.latestExpectedClockIn) continue;
      const cutoff = parseHHmm(policy.latestExpectedClockIn);
      if (!cutoff) continue;
      const cutoffDate = new Date(today);
      cutoffDate.setHours(cutoff.h, cutoff.m, 0, 0);
      if (now < cutoffDate) continue;
      const rec = await this.prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date: today } },
        include: { events: true },
      });
      if (rec?.status === 'on_leave') continue;
      const hasClockIn = rec?.events.some((e) => e.type === 'clock_in');
      if (hasClockIn) continue;
      // Avoid duplicate reminders: check for an existing in-app reminder today.
      const already = await this.prisma.notification.findFirst({
        where: {
          userId: emp.userId!,
          type: 'attendance.reminder',
          createdAt: { gte: today },
        },
      });
      if (already) continue;
      await this.notifications.dispatch({
        userId: emp.userId!,
        subject: 'Attendance reminder',
        message: `You haven\'t clocked in yet today. Expected by ${policy.latestExpectedClockIn}.`,
        type: 'attendance.reminder',
        channel: 'in_app',
      });
      sent++;
    }
    return { sent };
  }

  /**
   * charge.docx §4.12 — Auto-close days at end of business hours.
   * Inserts an auto_close event and marks record closed.
   */
  async autoCloseDay() {
    const today = toDateOnly(new Date());
    const now = new Date();
    const open = await this.prisma.attendanceRecord.findMany({
      where: { date: today, status: { in: ['open', 'flagged'] } },
      include: { events: true },
    });
    let closed = 0;
    for (const rec of open) {
      const policy = await this.resolvePolicyForEmployee(rec.employeeId);
      const closeAt = parseHHmm(policy?.autoCloseAt ?? null);
      if (!closeAt) continue;
      const closeAtDate = new Date(today);
      closeAtDate.setHours(closeAt.h, closeAt.m, 0, 0);
      if (now < closeAtDate) continue;
      const hasClockOut = rec.events.some((e) => e.type === 'clock_out');
      if (hasClockOut) continue;
      await this.prisma.attendanceEvent.create({
        data: {
          type: 'auto_close',
          source: 'auto',
          reason: 'auto-closed at end of business hours',
          employeeId: rec.employeeId,
          recordId: rec.id,
          occurredAt: closeAtDate,
        },
      });
      const events = await this.prisma.attendanceEvent.findMany({
        where: { recordId: rec.id },
        orderBy: { occurredAt: 'asc' },
      });
      await this.recompute(rec.id, events);
      const flags: string[] = ['missing_clock_out'];
      await this.prisma.attendanceRecord.update({
        where: { id: rec.id },
        data: { status: 'closed', flags },
      });
      // Notify the employee + their manager.
      const emp = await this.prisma.employee.findUnique({
        where: { id: rec.employeeId },
        include: { manager: true },
      });
      if (emp?.userId) {
        await this.notifications.dispatch({
          userId: emp.userId,
          subject: 'Day auto-closed',
          message: `You did not clock out today. Your day was auto-closed at ${policy!.autoCloseAt}.`,
          type: 'attendance.auto_close',
          channel: 'in_app',
        });
      }
      if (emp?.manager?.userId) {
        await this.notifications.dispatch({
          userId: emp.manager.userId,
          subject: `Anomaly: missing clock-out — ${emp.fullName}`,
          message: `${emp.fullName} did not clock out today. Day auto-closed.`,
          type: 'attendance.anomaly',
          channel: 'in_app',
        });
      }
      closed++;
    }
    return { closed };
  }
}
