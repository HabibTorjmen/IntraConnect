import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDTO, LeaveStatus } from './dto/leave.dto';
import {
  countWorkingDays,
  fallsInBlackout,
  rangesOverlap,
} from './leave-calculator';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  private async resolveTypeAndPolicy(typeCodeOrId: string) {
    const leaveType =
      (await this.prisma.leaveType.findUnique({
        where: { code: typeCodeOrId.toUpperCase() },
        include: { policy: true },
      })) ??
      (await this.prisma.leaveType.findUnique({
        where: { id: typeCodeOrId },
        include: { policy: true },
      }));
    return leaveType;
  }

  async create(data: CreateLeaveDTO) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const typeKey = data.type ?? 'ANNUAL';
    const leaveType = await this.resolveTypeAndPolicy(typeKey);
    const policy = leaveType?.policy;
    const weekendDays: number[] = (policy?.weekendDays as any) ?? [6, 0];
    const holidays = await this.prisma.holiday.findMany();
    const workingDays = countWorkingDays(start, end, weekendDays, holidays);

    if (workingDays === 0) {
      throw new BadRequestException(
        'Selected range covers no working days (weekends/holidays only).',
      );
    }
    if (policy) {
      if (workingDays < policy.minDaysPerRequest) {
        throw new BadRequestException(
          `Minimum ${policy.minDaysPerRequest} working day(s) per request for ${leaveType!.code}.`,
        );
      }
      if (workingDays > policy.maxDaysPerRequest) {
        throw new BadRequestException(
          `Maximum ${policy.maxDaysPerRequest} working day(s) per request for ${leaveType!.code}.`,
        );
      }
      if (policy.advanceNoticeDays > 0) {
        const noticeDeadline = new Date(start);
        noticeDeadline.setDate(noticeDeadline.getDate() - policy.advanceNoticeDays);
        if (new Date() > noticeDeadline) {
          throw new BadRequestException(
            `Requires ${policy.advanceNoticeDays} day(s) advance notice for ${leaveType!.code}.`,
          );
        }
      }
      const blackout = fallsInBlackout(start, end, policy.blackoutPeriods as any);
      if (blackout) {
        throw new BadRequestException(
          `Request falls within a blackout period${blackout.reason ? `: ${blackout.reason}` : ''}.`,
        );
      }
    }

    const overlapping = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: data.employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      },
    });
    for (const other of overlapping) {
      if (rangesOverlap(start, end, other.startDate, other.endDate)) {
        throw new ConflictException(
          `Overlaps with existing ${other.status} request ${other.id}.`,
        );
      }
    }

    if (policy && !policy.allowNegativeBalance && leaveType) {
      const balance = await this.computeBalance(data.employeeId, leaveType.id);
      if (balance.available < workingDays) {
        throw new BadRequestException(
          `Insufficient balance: ${balance.available} day(s) available for ${leaveType.code}.`,
        );
      }
    }

    return this.prisma.leaveRequest.create({
      data: {
        startDate: start,
        endDate: end,
        type: leaveType?.code ?? typeKey,
        reason: data.reason,
        status: LeaveStatus.PENDING,
        workingDays,
        employee: { connect: { id: data.employeeId } },
        leaveType: leaveType ? { connect: { id: leaveType.id } } : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: { employee: true, leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async updateStatus(id: string, status: LeaveStatus) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status },
    });
  }

  async cancel(id: string, requesterEmployeeId: string, isManagerOrAdmin: boolean) {
    const leave = await this.findOne(id);
    if (!isManagerOrAdmin && leave.employeeId !== requesterEmployeeId) {
      throw new ForbiddenException('Cannot cancel another employee\'s leave request');
    }
    if (leave.status === LeaveStatus.REJECTED || leave.status === 'cancelled') {
      throw new BadRequestException('Leave request already finalized');
    }
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  /** charge.docx §4.3: balance per leave type. */
  async computeBalance(employeeId: string, leaveTypeId: string) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
      include: { policy: true },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const policy = leaveType.policy;
    const annualGrant = policy?.annualEntitlementDays ?? 0;
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        leaveTypeId,
        startDate: { gte: yearStart },
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      },
    });

    let used = 0;
    let pending = 0;
    for (const r of requests) {
      const d = r.workingDays ?? 0;
      if (r.status === LeaveStatus.APPROVED) used += d;
      else pending += d;
    }

    return {
      leaveType: { id: leaveType.id, code: leaveType.code, name: leaveType.name },
      entitlement: annualGrant,
      used,
      pending,
      available: Math.max(0, annualGrant - used - pending),
    };
  }

  async balancesForEmployee(employeeId: string) {
    const types = await this.prisma.leaveType.findMany({
      where: { isActive: true },
      include: { policy: true },
    });
    return Promise.all(
      types.map((t) => this.computeBalance(employeeId, t.id)),
    );
  }

  async historyForEmployee(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.leaveRequest.delete({ where: { id } });
  }
}
