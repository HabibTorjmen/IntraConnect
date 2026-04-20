import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Document } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DocumentUncheckedCreateInput): Promise<Document> {
    return this.prisma.document.create({
      data,
    });
  }

  async uploadDocument(
    file: Express.Multer.File,
    data: {
      title: string;
      description?: string;
      category?: string;
      type: string;
      employeeId: string;
      isPublic?: boolean;
    },
  ): Promise<Document> {
    return this.prisma.document.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        url: file.path,
        filename: file.originalname,
        size: file.size,
        employeeId: data.employeeId,
        isPublic: data.isPublic || false,
      },
    });
  }

  async updateVersion(
    parentId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Document> {
    const previous = await this.prisma.document.findUnique({
      where: { id: parentId },
    });

    if (!previous) throw new Error('Original document not found');

    // Mark previous as not latest
    await this.prisma.document.update({
      where: { id: parentId },
      data: { isLatest: false },
    });

    // Create new version
    const newVersion = await this.prisma.document.create({
      data: {
        title: previous.title,
        description: previous.description,
        category: previous.category,
        type: previous.type,
        url: file.path,
        filename: file.originalname,
        size: file.size,
        version: previous.version + 1,
        parentId: previous.id,
        isLatest: true,
        employeeId: userId,
      },
    });

    await this.logAccess(newVersion.id, userId, 'update');
    return newVersion;
  }

  async logAccess(documentId: string, userId: string, action: string) {
    return this.prisma.documentAccessLog.create({
      data: {
        documentId,
        userId,
        action,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DocumentWhereUniqueInput;
    where?: Prisma.DocumentWhereInput;
    orderBy?: Prisma.DocumentOrderByWithRelationInput;
  }): Promise<Document[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.document.findMany({
      skip,
      take,
      cursor,
      where: {
        ...where,
        isLatest: true, // Only show latest version by default
      },
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
      },
    });
  }

  async findVersions(parentId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: {
        OR: [{ id: parentId }, { parentId: parentId }],
      },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        employee: {
          select: { fullName: true },
        },
        accessLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { username: true },
            },
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Document> {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}
