import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, message: string, type: string = 'info') {
    return this.prisma.notification.create({
      data: {
        message,
        type,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(options?.limit ? { take: options.limit } : {}),
    });
  }

  async getSummary(userId: string) {
    const [total, unread, latest] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.findAll(userId, { limit: 5 }),
    ]);

    return {
      total,
      unread,
      latest,
    };
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      updatedCount: result.count,
    };
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return {
      deleted: true,
      id,
    };
  }
}
