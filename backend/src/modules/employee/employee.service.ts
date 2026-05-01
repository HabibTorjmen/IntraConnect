import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { getEmployeeIdFromUser, isDirector } from '../auth/auth-access.helper';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  private ensureDirectorAccess(user: any) {
    if (!isDirector(user)) {
      throw new ForbiddenException(
        'Only directors can manage other employee records',
      );
    }
  }

  private getScopedEmployeeId(user: any): string {
    const employeeId = getEmployeeIdFromUser(user);

    if (!employeeId) {
      throw new ForbiddenException('Authenticated user is not linked to an employee');
    }

    return employeeId;
  }

  private employeeInclude = {
    user: {
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    },
    manager: true,
    jobTitle: true,
    department: true,
  };

  async create(data: CreateEmployeeDTO, user: any) {
    this.ensureDirectorAccess(user);

    const employee = await this.prisma.employee.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        department: data.department
          ? { connect: { id: data.department } }
          : undefined,
        status: data.status,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
        user: data.userId
          ? { connect: { id: data.userId } }
          : undefined,
        manager: data.managerId
          ? { connect: { id: data.managerId } }
          : undefined,
        jobTitle: data.jobTitleId
          ? { connect: { id: data.jobTitleId } }
          : undefined,
      },
      include: this.employeeInclude,
    });

    if (data.userId && data.roleId) {
      await this.prisma.user.update({
        where: { id: data.userId },
        data: {
          roles: {
            set: [{ id: data.roleId }],
          },
        },
      });

      return this.findOne(employee.id, user);
    }

    return employee;
  }

  async findAll(user: any) {
    if (isDirector(user)) {
      return this.prisma.employee.findMany({
        include: this.employeeInclude,
      });
    }

    return this.prisma.employee.findMany({
      where: { id: this.getScopedEmployeeId(user) },
      include: this.employeeInclude,
    });
  }

  async findOne(id: string, user: any) {
    if (!isDirector(user) && this.getScopedEmployeeId(user) !== id) {
      throw new ForbiddenException('You can only access your own employee profile');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: this.employeeInclude,
    });

    if (!employee) throw new NotFoundException('Employee not found');

    return employee;
  }

  async update(id: string, data: UpdateEmployeeDTO, user: any) {
    if (!isDirector(user) && this.getScopedEmployeeId(user) !== id) {
      throw new ForbiddenException('You can only update your own employee profile');
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        department: data.department
          ? { connect: { id: data.department } }
          : undefined,
        status: data.status,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
        manager: data.managerId
          ? { connect: { id: data.managerId } }
          : undefined,
        jobTitle: data.jobTitleId
          ? { connect: { id: data.jobTitleId } }
          : undefined,
        user: data.roleId
          ? {
              update: {
                roles: {
                  set: [{ id: data.roleId }],
                },
              },
            }
          : undefined,
      },
      include: this.employeeInclude,
    });
  }

  async remove(id: string, user: any) {
    this.ensureDirectorAccess(user);

    return this.prisma.employee.delete({
      where: { id },
      include: this.employeeInclude,
    });
  }

  async bulkImport(employees: CreateEmployeeDTO[], user: any) {
    this.ensureDirectorAccess(user);

    const results = [];
    for (const emp of employees) {
      try {
        const result = await this.create(emp, user);
        results.push({ success: true, data: result });
      } catch (err) {
        results.push({ success: false, error: err.message, data: emp });
      }
    }
    return results;
  }

  async search(
    user: any,
    query?: string,
    departmentId?: string,
    status?: string,
  ) {
    const scopedEmployeeId = isDirector(user)
      ? undefined
      : this.getScopedEmployeeId(user);

    return this.prisma.employee.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { fullName: { contains: query, mode: 'insensitive' } },
                  { phone: { contains: query, mode: 'insensitive' } },
                ],
              }
            : {},
          departmentId ? { departmentId } : {},
          status ? { status } : {},
          scopedEmployeeId ? { id: scopedEmployeeId } : {},
        ],
      },
      include: this.employeeInclude,
    });
  }
}
