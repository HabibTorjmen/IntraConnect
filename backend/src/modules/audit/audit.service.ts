import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * charge.docx §Security, Audit & Compliance — every state change must be
 * logged with: Actor, Timestamp, Action, Resource ID, Old Value, New Value.
 */
export interface AuditLogInput {
  action: string;
  userId: string;
  module?: string;
  resourceId?: string;
  details?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

function stringify(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void>;
  async log(action: string, userId: string): Promise<void>;
  async log(
    inputOrAction: AuditLogInput | string,
    maybeUserId?: string,
  ): Promise<void> {
    const payload: AuditLogInput =
      typeof inputOrAction === 'string'
        ? { action: inputOrAction, userId: maybeUserId as string }
        : inputOrAction;

    await this.prisma.auditLog.create({
      data: {
        action: payload.action,
        module: payload.module,
        resourceId: payload.resourceId,
        details: payload.details,
        oldValue: stringify(payload.oldValue),
        newValue: stringify(payload.newValue),
        user: { connect: { id: payload.userId } },
      },
    });
  }

  async findAll(options?: {
    module?: string;
    resourceId?: string;
    userId?: string;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(options?.module ? { module: options.module } : {}),
        ...(options?.resourceId ? { resourceId: options.resourceId } : {}),
        ...(options?.userId ? { userId: options.userId } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      ...(options?.limit ? { take: options.limit } : {}),
    });
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
