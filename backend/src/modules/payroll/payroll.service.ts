import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as unzipper from 'unzipper';
import { Prisma, PayrollRecord } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';

interface AccessContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(data: any) {
    return this.prisma.payrollRecord.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PayrollRecordWhereUniqueInput;
    where?: Prisma.PayrollRecordWhereInput;
    orderBy?: Prisma.PayrollRecordOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.payrollRecord.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy: orderBy || { period: 'desc' },
      include: { employee: { select: { fullName: true } } },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.payrollRecord.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!r) throw new NotFoundException('Payslip not found');
    return r;
  }

  async update(id: string, data: any) {
    return this.prisma.payrollRecord.update({ where: { id }, data });
  }

  async logAccess(
    payrollId: string,
    userId: string,
    action: string,
    ctx: AccessContext = {},
  ) {
    return this.prisma.payrollAccessLog.create({
      data: { payrollId, userId, action, ip: ctx.ip, userAgent: ctx.userAgent },
    });
  }

  async uploadOne(
    file: Express.Multer.File,
    employeeId: string,
    period: string,
    actorUserId: string,
    ctx: AccessContext,
  ): Promise<PayrollRecord> {
    if (!file) throw new BadRequestException('PDF missing');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Payslip must be a PDF.');
    }
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) throw new BadRequestException('Employee not found');

    const existing = await this.prisma.payrollRecord.findUnique({
      where: { employeeId_period: { employeeId, period } },
    });
    if (existing) {
      throw new ConflictException(
        `Payslip already exists for ${employeeId} period ${period}`,
      );
    }

    const key = this.storage.buildKey(
      `payroll/${employeeId}/${period}`,
      file.originalname,
    );
    await this.storage.putObject(key, file.buffer, file.mimetype);

    const record = await this.prisma.payrollRecord.create({
      data: {
        employeeId,
        period,
        pdfUrl: key,
        filename: file.originalname,
        size: file.size,
        status: 'draft',
      },
    });
    await this.logAccess(record.id, actorUserId, 'upload', ctx);
    return record;
  }

  /** charge.docx §4.8: bulk ZIP — match by employee ID then email; per-PDF report. */
  async bulkUploadZip(
    file: Express.Multer.File,
    period: string,
    actorUserId: string,
    ctx: AccessContext,
  ) {
    if (!file) throw new BadRequestException('Zip missing');
    const directory = await unzipper.Open.buffer(file.buffer);

    const results: Array<{
      filename: string;
      success: boolean;
      payrollId?: string;
      employeeId?: string;
      error?: string;
    }> = [];

    for (const entry of directory.files) {
      if (entry.type !== 'File') continue;
      const inner = entry.path.split('/').pop() ?? entry.path;
      if (!/\.pdf$/i.test(inner)) {
        results.push({ filename: inner, success: false, error: 'Not a PDF' });
        continue;
      }
      try {
        const buffer = await entry.buffer();
        const baseName = inner.replace(/\.pdf$/i, '');
        let employee = await this.prisma.employee.findUnique({
          where: { id: baseName },
        });
        if (!employee) {
          const user = await this.prisma.user.findUnique({
            where: { email: baseName },
            include: { employee: true },
          });
          if (user?.employee) employee = user.employee;
        }
        if (!employee) {
          results.push({ filename: inner, success: false, error: 'No matching employee' });
          continue;
        }

        const exists = await this.prisma.payrollRecord.findUnique({
          where: { employeeId_period: { employeeId: employee.id, period } },
        });
        if (exists) {
          results.push({
            filename: inner,
            success: false,
            error: 'Duplicate for period',
            employeeId: employee.id,
          });
          continue;
        }

        const key = this.storage.buildKey(
          `payroll/${employee.id}/${period}`,
          inner,
        );
        await this.storage.putObject(key, buffer, 'application/pdf');
        const record = await this.prisma.payrollRecord.create({
          data: {
            employeeId: employee.id,
            period,
            pdfUrl: key,
            filename: inner,
            size: buffer.length,
            status: 'draft',
          },
        });
        await this.logAccess(record.id, actorUserId, 'upload', ctx);
        results.push({
          filename: inner,
          success: true,
          payrollId: record.id,
          employeeId: employee.id,
        });
      } catch (err: any) {
        results.push({
          filename: entry.path,
          success: false,
          error: err?.message ?? 'unknown error',
        });
      }
    }
    return {
      total: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  async publish(id: string, actorUserId: string, ctx: AccessContext) {
    const r = await this.prisma.payrollRecord.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    });
    await this.logAccess(id, actorUserId, 'publish', ctx);
    return r;
  }

  async verifyReAuth(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    return AuthHelpers.verify(password, user.passwordHash);
  }

  async getDownloadUrl(
    id: string,
    actor: { userId: string; employeeId?: string; isPowerful: boolean },
    ctx: AccessContext,
  ): Promise<string> {
    const r = await this.prisma.payrollRecord.findUnique({ where: { id } });
    if (!r || !r.pdfUrl) {
      await this.logAccess(id, actor.userId, 'failed_access', ctx);
      throw new NotFoundException('Payslip not found');
    }
    if (r.status !== 'published') {
      await this.logAccess(id, actor.userId, 'failed_access', ctx);
      throw new ForbiddenException('Payslip not yet published');
    }
    if (!actor.isPowerful && r.employeeId !== actor.employeeId) {
      await this.logAccess(id, actor.userId, 'failed_access', ctx);
      throw new ForbiddenException("Cannot access another employee's payslip");
    }
    await this.logAccess(id, actor.userId, 'download', ctx);
    return this.storage.getSignedDownloadUrl(r.pdfUrl, 60);
  }
}
