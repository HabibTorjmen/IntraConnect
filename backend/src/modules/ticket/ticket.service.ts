import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Ticket } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket> {
    // Set SLA deadline (e.g., 24 hours from now) if not provided
    if (!data.slaDeadline) {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
      data.slaDeadline = deadline;
    }
    
    return this.prisma.ticket.create({
      data,
      include: {
        category: true,
        employee: {
          select: { fullName: true }
        }
      }
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
      where: {
        ...where,
      },
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        category: true,
        employee: {
          select: {
            fullName: true,
          },
        },
        assignedTo: {
          select: {
            fullName: true,
          },
        },
        comments: {
          include: {
            author: {
              select: { fullName: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        employee: true,
        assignedTo: true,
        comments: {
          include: {
            author: {
              select: { fullName: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
  }

  async update(id: string, data: Prisma.TicketUpdateInput): Promise<Ticket> {
    return this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        category: true,
        employee: { select: { fullName: true } },
        assignedTo: { select: { fullName: true } }
      }
    });
  }

  async remove(id: string): Promise<Ticket> {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  // Categories helper
  async findAllCategories() {
    return this.prisma.ticketCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  // Comments helper
  async addComment(ticketId: string, authorId: string, content: string) {
    return this.prisma.ticketComment.create({
      data: {
        content,
        ticketId,
        authorId,
      },
      include: {
        author: { select: { fullName: true } }
      }
    });
  }
}
