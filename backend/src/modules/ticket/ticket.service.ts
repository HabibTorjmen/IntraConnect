import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  bumpPriority,
  classifyStatus,
  deadlineFor,
  effectiveDeadline,
  SLA_HOURS_BY_PRIORITY,
} from './sla.helper';

const ATTACHMENT_MIME_WHITELIST = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]);

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENTS_TOTAL_BYTES = 10 * 1024 * 1024;

const PAUSE_STATUS = 'pending_employee';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket> {
    if (!data.priority) data.priority = 'medium';
    if (!data.status) data.status = 'new';
    if (!data.slaDeadline) data.slaDeadline = deadlineFor(data.priority);
    return this.prisma.ticket.create({
      data,
      include: {
        category: true,
        employee: { select: { fullName: true } },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TicketWhereUniqueInput;
    where?: Prisma.TicketWhereInput;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.ticket.findMany({
      skip,
      take,
      cursor,
      where: { ...where },
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        category: true,
        employee: { select: { fullName: true } },
        assignedTo: { select: { fullName: true } },
        attachments: true,
      },
    });
  }

  async findOne(id: string, viewerIsInternal = false) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        employee: true,
        assignedTo: true,
        attachments: true,
        comments: {
          include: { author: { select: { fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!viewerIsInternal) {
      ticket.comments = ticket.comments.filter((c) => !c.isInternal);
    }
    return ticket;
  }

  async update(id: string, data: Prisma.TicketUpdateInput): Promise<Ticket> {
    const before = await this.prisma.ticket.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Ticket not found');

    let nextStatus = (data.status as string | undefined) ?? before.status;
    let pausedAt = before.slaPausedAt;
    let pausedDuration = before.slaPausedDurationMs;
    let closedAt = before.closedAt;

    // Pause SLA when moving INTO pending_employee, resume when moving OUT.
    if (before.status !== nextStatus) {
      if (nextStatus === PAUSE_STATUS && !pausedAt) {
        pausedAt = new Date();
      } else if (before.status === PAUSE_STATUS && pausedAt) {
        pausedDuration += Date.now() - pausedAt.getTime();
        pausedAt = null;
      }
      if (nextStatus === 'closed' || nextStatus === 'resolved') {
        closedAt = new Date();
      }
    }

    // Recompute deadline if priority changes.
    let slaDeadline = before.slaDeadline;
    if (data.priority && data.priority !== before.priority) {
      slaDeadline = deadlineFor(data.priority as string, before.createdAt);
    }

    const slaStatus = slaDeadline
      ? classifyStatus(
          effectiveDeadline(slaDeadline, pausedDuration, pausedAt),
          pausedAt,
        )
      : 'ON_TRACK';

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        slaPausedAt: pausedAt,
        slaPausedDurationMs: pausedDuration,
        slaDeadline,
        slaStatus,
        closedAt,
      },
      include: {
        category: true,
        employee: { select: { fullName: true } },
        assignedTo: { select: { fullName: true } },
      },
    });
  }

  async remove(id: string): Promise<Ticket> {
    return this.prisma.ticket.delete({ where: { id } });
  }

  async findAllCategories() {
    return this.prisma.ticketCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async addComment(
    ticketId: string,
    authorId: string,
    content: string,
    isInternal: boolean,
  ) {
    return this.prisma.ticketComment.create({
      data: { content, ticketId, authorId, isInternal },
      include: { author: { select: { fullName: true } } },
    });
  }

  async addAttachment(
    ticketId: string,
    file: Express.Multer.File,
    isResolution = false,
  ) {
    if (!ATTACHMENT_MIME_WHITELIST.has(file.mimetype)) {
      throw new BadRequestException(
        `MIME type ${file.mimetype} not allowed. Allowed: PDF, DOC(X), XLS(X), PNG, JPG.`,
      );
    }
    const existing = await this.prisma.ticketAttachment.findMany({ where: { ticketId } });
    if (existing.length >= MAX_ATTACHMENTS) {
      throw new BadRequestException('Maximum 5 attachments per ticket.');
    }
    const totalBytes = existing.reduce((s, a) => s + a.size, 0) + file.size;
    if (totalBytes > MAX_ATTACHMENTS_TOTAL_BYTES) {
      throw new BadRequestException('Total attachment size exceeds 10 MB.');
    }
    const key = this.storage.buildKey(`tickets/${ticketId}`, file.originalname);
    await this.storage.putObject(key, file.buffer, file.mimetype);
    return this.prisma.ticketAttachment.create({
      data: {
        ticketId,
        url: key,
        filename: file.originalname,
        size: file.size,
        mime: file.mimetype,
        isResolution,
      },
    });
  }

  async submitRating(
    ticketId: string,
    employeeId: string,
    rating: number,
    feedback?: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.employeeId !== employeeId) {
      throw new ForbiddenException('Only the ticket creator can rate.');
    }
    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      throw new BadRequestException('Ticket must be closed or resolved before rating.');
    }
    if (ticket.resolutionRating != null) {
      throw new BadRequestException('Rating already submitted (immutable).');
    }
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be 1..5.');
    }
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { resolutionRating: rating, resolutionFeedback: feedback },
    });
  }

  async mergeDuplicate(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      throw new BadRequestException('Cannot merge a ticket into itself.');
    }
    const [source, target] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: sourceId } }),
      this.prisma.ticket.findUnique({ where: { id: targetId } }),
    ]);
    if (!source || !target) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.update({
      where: { id: sourceId },
      data: { mergedIntoId: targetId, status: 'closed', closedAt: new Date() },
    });
  }

  /** Cron-call: scan for SLA breaches and escalate. */
  async scanAndEscalate(): Promise<{ scanned: number; escalated: number }> {
    const open = await this.prisma.ticket.findMany({
      where: { status: { notIn: ['closed', 'resolved'] }, slaDeadline: { not: null } },
    });
    let escalated = 0;
    for (const t of open) {
      const eff = effectiveDeadline(t.slaDeadline!, t.slaPausedDurationMs, t.slaPausedAt);
      const status = classifyStatus(eff, t.slaPausedAt);
      if (status === 'BREACHED') {
        const newPriority = bumpPriority(t.priority);
        await this.prisma.ticket.update({
          where: { id: t.id },
          data: {
            slaStatus: 'BREACHED',
            escalationLevel: t.escalationLevel + 1,
            priority: newPriority,
          },
        });
        escalated++;
      } else if (t.slaStatus !== status) {
        await this.prisma.ticket.update({
          where: { id: t.id },
          data: { slaStatus: status },
        });
      }
    }
    return { scanned: open.length, escalated };
  }

  slaConfig() {
    return SLA_HOURS_BY_PRIORITY;
  }
}
