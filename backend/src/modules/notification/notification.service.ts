import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

interface DispatchInput {
  userId: string;
  message: string;
  subject?: string;
  type?: string;
  channel?: 'in_app' | 'email' | 'both';
  critical?: boolean;
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  /**
   * charge.docx §Cross-Module Notification System.
   * Rules enforced here:
   *  - Deactivated employees do not receive any notifications.
   *  - Critical notifications (cannot be disabled) always send to both channels.
   *  - All sent notifications are logged with delivery status.
   */
  async dispatch(input: DispatchInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      include: { employee: true },
    });
    if (!user || !user.isActive) {
      return { skipped: true, reason: 'inactive_or_missing' };
    }
    const channel = input.critical ? 'both' : input.channel ?? 'in_app';
    const created: any[] = [];

    if (channel === 'in_app' || channel === 'both') {
      const n = await this.prisma.notification.create({
        data: {
          userId: input.userId,
          message: input.message,
          subject: input.subject,
          type: input.type ?? 'info',
          channel: 'in_app',
          critical: !!input.critical,
          deliveryStatus: 'sent',
        },
      });
      created.push(n);
    }
    if (channel === 'email' || channel === 'both') {
      const r = await this.email.send({
        to: user.email,
        subject: input.subject ?? 'Notification',
        text: input.message,
      });
      const n = await this.prisma.notification.create({
        data: {
          userId: input.userId,
          message: input.message,
          subject: input.subject,
          type: input.type ?? 'info',
          channel: 'email',
          critical: !!input.critical,
          deliveryStatus: r.ok ? 'sent' : 'failed',
          deliveryError: r.ok ? null : (r as { ok: false; error: string }).error,
        },
      });
      created.push(n);
    }
    return { created };
  }

  // Back-compat shorthand for legacy callers
  async create(userId: string, message: string, type: string = 'info') {
    return this.dispatch({ userId, message, type, channel: 'in_app' });
  }

  async findAll(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        channel: 'in_app',
        ...(options?.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(options?.limit ? { take: options.limit } : {}),
    });
  }

  async getSummary(userId: string) {
    const [total, unread, latest] = await Promise.all([
      this.prisma.notification.count({ where: { userId, channel: 'in_app' } }),
      this.prisma.notification.count({
        where: { userId, channel: 'in_app', isRead: false },
      }),
      this.findAll(userId, { limit: 5 }),
    ]);
    return { total, unread, latest };
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (result.count === 0) throw new NotFoundException('Notification not found');
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updatedCount: result.count };
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) throw new NotFoundException('Notification not found');
    return { deleted: true, id };
  }
}
