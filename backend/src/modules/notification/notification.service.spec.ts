import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const prisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('filters unread notifications when requested', async () => {
    prisma.notification.findMany.mockResolvedValueOnce([]);

    await service.findAll('user-1', { unreadOnly: true, limit: 10 });

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  });

  it('returns unread summary counts', async () => {
    prisma.notification.count
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(3);
    prisma.notification.findMany.mockResolvedValueOnce([{ id: 'notif-1' }]);

    const summary = await service.getSummary('user-1');

    expect(summary).toEqual({
      total: 8,
      unread: 3,
      latest: [{ id: 'notif-1' }],
    });
  });

  it('marks only owned notifications as read', async () => {
    prisma.notification.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.notification.findUnique.mockResolvedValueOnce({
      id: 'notif-1',
      isRead: true,
    });

    const result = await service.markAsRead('notif-1', 'user-1');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-1', userId: 'user-1' },
      data: { isRead: true },
    });
    expect(result).toEqual({ id: 'notif-1', isRead: true });
  });

  it('throws when trying to update another user notification', async () => {
    prisma.notification.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(service.markAsRead('notif-1', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
