import { Test, TestingModule } from '@nestjs/testing';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;

  const notificationService = {
    findAll: jest.fn(),
    getSummary: jest.fn(),
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('forwards list filters to the service', async () => {
    const user = { id: 'user-1' };
    notificationService.findAll.mockResolvedValueOnce([]);

    await controller.findAll(user, 'true', '5');

    expect(notificationService.findAll).toHaveBeenCalledWith('user-1', {
      unreadOnly: true,
      limit: 5,
    });
  });

  it('marks only the authenticated user notifications as read', async () => {
    const user = { id: 'user-1' };
    notificationService.markAsRead.mockResolvedValueOnce({ id: 'notif-1' });

    await controller.markAsRead('notif-1', user);

    expect(notificationService.markAsRead).toHaveBeenCalledWith(
      'notif-1',
      'user-1',
    );
  });
});
