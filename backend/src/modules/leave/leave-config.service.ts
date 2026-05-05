import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHolidayDTO,
  UpsertLeavePolicyDTO,
  UpsertLeaveTypeDTO,
} from './dto/leave-config.dto';

@Injectable()
export class LeaveConfigService {
  constructor(private prisma: PrismaService) {}

  // -------- Types --------
  listTypes() {
    return this.prisma.leaveType.findMany({
      include: { policy: true },
      orderBy: { name: 'asc' },
    });
  }

  upsertType(dto: UpsertLeaveTypeDTO) {
    return this.prisma.leaveType.upsert({
      where: { code: dto.code.toUpperCase() },
      update: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
      create: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
      include: { policy: true },
    });
  }

  deactivateType(id: string) {
    return this.prisma.leaveType.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // -------- Policy --------
  upsertPolicy(dto: UpsertLeavePolicyDTO) {
    const data = {
      annualEntitlementDays: dto.annualEntitlementDays,
      accrualMethod: dto.accrualMethod,
      carryForwardAllowed: dto.carryForwardAllowed,
      maxCarryForwardDays: dto.maxCarryForwardDays,
      carryForwardExpiryMonths: dto.carryForwardExpiryMonths,
      minDaysPerRequest: dto.minDaysPerRequest,
      maxDaysPerRequest: dto.maxDaysPerRequest,
      advanceNoticeDays: dto.advanceNoticeDays,
      blackoutPeriods: dto.blackoutPeriods as any,
      weekendDays: dto.weekendDays as any,
      allowNegativeBalance: dto.allowNegativeBalance,
    };
    return this.prisma.leavePolicy.upsert({
      where: { leaveTypeId: dto.leaveTypeId },
      update: data,
      create: { leaveTypeId: dto.leaveTypeId, ...data } as any,
    });
  }

  // -------- Holidays --------
  listHolidays() {
    return this.prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  }

  createHoliday(dto: CreateHolidayDTO) {
    return this.prisma.holiday.create({
      data: {
        date: new Date(dto.date),
        name: dto.name,
        recurring: dto.recurring ?? false,
      },
    });
  }

  removeHoliday(id: string) {
    return this.prisma.holiday.delete({ where: { id } });
  }
}
