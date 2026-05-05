import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceAction, deriveState, nextState } from './state-machine';

function toDateOnly(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

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
}
