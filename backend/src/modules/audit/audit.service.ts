import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(action: string, userId: string) {
    return this.prisma.auditLog.create({
      data: {
        action,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
