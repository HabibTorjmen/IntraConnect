import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.trainingPlan.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'planned',
        employeeId: data.employeeId,
      },
    });
  }

  async findAll() {
    return this.prisma.trainingPlan.findMany({
      include: {
        employee: { select: { fullName: true } },
      },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.trainingPlan.findMany({
      where: { employeeId },
      orderBy: { startDate: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.trainingPlan.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.trainingPlan.delete({ where: { id } });
  }
}
