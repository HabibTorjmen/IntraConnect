import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PayrollRecord } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PayrollRecordUncheckedCreateInput): Promise<PayrollRecord> {
    return this.prisma.payrollRecord.create({
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PayrollRecordWhereUniqueInput;
    where?: Prisma.PayrollRecordWhereInput;
    orderBy?: Prisma.PayrollRecordOrderByWithRelationInput;
  }): Promise<PayrollRecord[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payrollRecord.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<PayrollRecord | null> {
    return this.prisma.payrollRecord.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.PayrollRecordUpdateInput): Promise<PayrollRecord> {
    return this.prisma.payrollRecord.update({
      where: { id },
      data,
    });
  }
}
