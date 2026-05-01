import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const prisma = {
    employee: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const employeeUser = {
    id: 'user-1',
    roles: [{ name: 'employee' }],
    employee: {
      id: 'employee-1',
      jobTitle: { title: 'Developer', level: 'Junior' },
    },
  };

  const directorUser = {
    id: 'user-2',
    roles: [{ name: 'manager' }],
    employee: {
      id: 'employee-2',
      jobTitle: { title: 'HR Director', level: 'Director' },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('returns only the authenticated employee for non-directors', async () => {
    prisma.employee.findMany.mockResolvedValueOnce([{ id: 'employee-1' }]);

    const result = await service.findAll(employeeUser);

    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'employee-1' },
      }),
    );
    expect(result).toEqual([{ id: 'employee-1' }]);
  });

  it('returns all employees for directors', async () => {
    prisma.employee.findMany.mockResolvedValueOnce([
      { id: 'employee-1' },
      { id: 'employee-2' },
    ]);

    const result = await service.findAll(directorUser);

    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.any(Object),
      }),
    );
    expect(result).toHaveLength(2);
  });

  it('blocks non-directors from accessing another employee', async () => {
    await expect(service.findOne('employee-99', employeeUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows employees to update their own profile', async () => {
    prisma.employee.update.mockResolvedValueOnce({ id: 'employee-1' });

    const result = await service.update(
      'employee-1',
      { fullName: 'Jane Employee' },
      employeeUser,
    );

    expect(prisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'employee-1' },
      }),
    );
    expect(result).toEqual({ id: 'employee-1' });
  });

  it('blocks non-directors from deleting employee records', async () => {
    await expect(service.remove('employee-1', employeeUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
