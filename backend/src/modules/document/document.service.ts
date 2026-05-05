import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Document } from '@prisma/client';
import * as unzipper from 'unzipper';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { validateCategory, DocumentType } from './document.constants';

interface UploadInput {
  title: string;
  description?: string;
  category?: string;
  type: string;
  employeeId: string;
  isPublic?: boolean;
  expiresAt?: string;
}

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async uploadDocument(file: Express.Multer.File, data: UploadInput): Promise<Document> {
    if (!file) throw new BadRequestException('File missing');
    validateCategory(data.type as DocumentType, data.category);

    const key = this.storage.buildKey(`documents/${data.type}`, file.originalname);
    await this.storage.putObject(key, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        url: key,
        filename: file.originalname,
        size: file.size,
        employeeId: data.employeeId,
        isPublic: data.isPublic ?? false,
        publishedAt: new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async updateVersion(
    parentId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Document> {
    const previous = await this.prisma.document.findUnique({ where: { id: parentId } });
    if (!previous) throw new NotFoundException('Original document not found');

    await this.prisma.document.update({
      where: { id: parentId },
      data: { isLatest: false },
    });

    const key = this.storage.buildKey(`documents/${previous.type}`, file.originalname);
    await this.storage.putObject(key, file.buffer, file.mimetype);

    const newVersion = await this.prisma.document.create({
      data: {
        title: previous.title,
        description: previous.description,
        category: previous.category,
        type: previous.type,
        url: key,
        filename: file.originalname,
        size: file.size,
        version: previous.version + 1,
        parentId: previous.id,
        isLatest: true,
        publishedAt: new Date(),
        employeeId: userId,
      },
    });

    await this.logAccess(newVersion.id, userId, 'update');
    return newVersion;
  }

  /** Restore a previous version: copies its content into a fresh latest version. */
  async restoreVersion(versionId: string, userId: string): Promise<Document> {
    const target = await this.prisma.document.findUnique({ where: { id: versionId } });
    if (!target) throw new NotFoundException('Version not found');

    const lineageId = target.parentId ?? target.id;
    const head = await this.prisma.document.findFirst({
      where: { OR: [{ id: lineageId }, { parentId: lineageId }], isLatest: true },
    });
    if (head) {
      await this.prisma.document.update({
        where: { id: head.id },
        data: { isLatest: false },
      });
    }
    const newest = await this.prisma.document.findFirst({
      where: { OR: [{ id: lineageId }, { parentId: lineageId }] },
      orderBy: { version: 'desc' },
    });

    const restored = await this.prisma.document.create({
      data: {
        title: target.title,
        description: target.description,
        category: target.category,
        type: target.type,
        url: target.url,
        filename: target.filename,
        size: target.size,
        version: (newest?.version ?? 1) + 1,
        parentId: lineageId,
        isLatest: true,
        publishedAt: new Date(),
        employeeId: userId,
      },
    });

    await this.logAccess(restored.id, userId, 'restore');
    return restored;
  }

  /** charge.docx §4.7: bulk ZIP upload — extract per-file, validate each, return summary. */
  async bulkZipUpload(
    file: Express.Multer.File,
    common: { type: DocumentType; category?: string; employeeId: string },
  ) {
    if (!file) throw new BadRequestException('Zip file missing');
    validateCategory(common.type, common.category);

    const directory = await unzipper.Open.buffer(file.buffer);
    const results: Array<{ filename: string; success: boolean; error?: string }> = [];

    for (const entry of directory.files) {
      if (entry.type !== 'File') continue;
      try {
        const buffer = await entry.buffer();
        const inner = entry.path.split('/').pop() ?? entry.path;
        const key = this.storage.buildKey(`documents/${common.type}`, inner);
        await this.storage.putObject(key, buffer);
        await this.prisma.document.create({
          data: {
            title: inner,
            type: common.type,
            category: common.category,
            url: key,
            filename: inner,
            size: buffer.length,
            employeeId: common.employeeId,
            publishedAt: new Date(),
          },
        });
        results.push({ filename: inner, success: true });
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

  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');
    if (document.isDeleted) throw new NotFoundException('Document deleted');
    await this.logAccess(id, userId, 'download');
    return this.storage.getSignedDownloadUrl(document.url);
  }

  async logAccess(documentId: string, userId: string, action: string) {
    return this.prisma.documentAccessLog.create({
      data: { documentId, userId, action },
    });
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.DocumentWhereUniqueInput;
      where?: Prisma.DocumentWhereInput;
      orderBy?: Prisma.DocumentOrderByWithRelationInput;
    },
    options: { includeExpired?: boolean; includeDeleted?: boolean } = {},
  ): Promise<Document[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const baseWhere: Prisma.DocumentWhereInput = {
      ...where,
      isLatest: true,
    };
    if (!options.includeDeleted) baseWhere.isDeleted = false;
    if (!options.includeExpired) {
      baseWhere.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }
    return this.prisma.document.findMany({
      skip,
      take,
      cursor,
      where: baseWhere,
      orderBy: orderBy || { createdAt: 'desc' },
      include: { employee: { select: { fullName: true } } },
    });
  }

  async findVersions(parentId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { OR: [{ id: parentId }, { parentId: parentId }] },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        employee: { select: { fullName: true } },
        accessLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { username: true } } },
        },
      },
    });
  }

  /** Default delete = soft delete. */
  async softDelete(id: string): Promise<Document> {
    return this.prisma.document.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  /** Admin-only permanent purge. */
  async permanentDelete(id: string): Promise<Document> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    try {
      await this.storage.deleteObject(doc.url);
    } catch {
      // Storage object may already be gone — proceed with DB delete.
    }
    return this.prisma.document.delete({ where: { id } });
  }
}
