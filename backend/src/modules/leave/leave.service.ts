import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDTO, LeaveStatus } from './dto/leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLeaveDTO) {
    return this.prisma.leaveRequest.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        type: data.type,
        reason: data.reason,
        status: LeaveStatus.PENDING,
        employee: {
          connect: { id: data.employeeId },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        employee: true,
      },
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
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

  async remove(id: string) {
    return this.prisma.leaveRequest.delete({
      where: { id },
    });
  }
}
