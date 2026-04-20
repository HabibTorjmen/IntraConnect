import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmployeeDTO) {
    return this.prisma.employee.create({
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
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        user: true,
        manager: true,
        jobTitle: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        manager: true,
        jobTitle: true,
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    return employee;
  }

  async update(id: string, data: UpdateEmployeeDTO) {
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
      },
    });
  }

  async remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async bulkImport(employees: CreateEmployeeDTO[]) {
    const results = [];
    for (const emp of employees) {
      try {
        const result = await this.create(emp);
        results.push({ success: true, data: result });
      } catch (err) {
        results.push({ success: false, error: err.message, data: emp });
      }
    }
    return results;
  }

  async search(query?: string, departmentId?: string, status?: string) {
    return this.prisma.employee.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          } : {},
          departmentId ? { departmentId } : {},
          status ? { status } : {},
        ],
      },
      include: {
        user: true,
        manager: true,
        jobTitle: true,
      },
    });
  }
}