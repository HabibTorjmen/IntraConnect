import { Test, TestingModule } from '@nestjs/testing';

import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

describe('EmployeeController', () => {
  let controller: EmployeeController;

  const employeeService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    bulkImport: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: employeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('passes the authenticated user scope to findAll', async () => {
    const user = { id: 'user-1' };
    employeeService.findAll.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 25 });

    await controller.findAll(user, {});

    expect(employeeService.findAll).toHaveBeenCalledWith(user, expect.any(Object));
  });

  it('passes filters and user scope to search', async () => {
    const user = { id: 'user-1' };
    employeeService.search.mockResolvedValueOnce([]);

    await controller.search(user, 'Jane', 'dept-1', 'active');

    expect(employeeService.search).toHaveBeenCalledWith(
      user,
      'Jane',
      'dept-1',
      'active',
    );
  });
});
