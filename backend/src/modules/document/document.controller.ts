import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';
import {
  COMPANY_CATEGORIES,
  EMPLOYEE_CATEGORIES,
  DocumentType,
} from './document.constants';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('categories')
  @CheckPermissions({ action: 'read', module: 'documents' })
  categories() {
    return { company: COMPANY_CATEGORIES, employee: EMPLOYEE_CATEGORIES };
  }

  @Post('upload')
  @CheckPermissions({ action: 'create', module: 'documents' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title: string;
      description?: string;
      category?: string;
      type: string;
      isPublic?: string;
      expiresAt?: string;
    },
    @AuthUser() user: any,
  ) {
    return this.documentService.uploadDocument(file, {
      ...body,
      isPublic: body.isPublic === 'true',
      employeeId: user.employee.id,
    });
  }

  @Post('bulk-zip')
  @CheckPermissions({ action: 'manage', module: 'documents' })
  @UseInterceptors(FileInterceptor('file'))
  async bulkZip(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type: DocumentType; category?: string },
    @AuthUser() user: any,
  ) {
    return this.documentService.bulkZipUpload(file, {
      type: body.type,
      category: body.category,
      employeeId: user.employee.id,
    });
  }

  @Post(':id/version')
  @CheckPermissions({ action: 'update', module: 'documents' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadNewVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @AuthUser() user: any,
  ) {
    return this.documentService.updateVersion(id, file, user.employee.id);
  }

  @Post(':versionId/restore')
  @CheckPermissions({ action: 'manage', module: 'documents' })
  async restoreVersion(@Param('versionId') versionId: string, @AuthUser() user: any) {
    return this.documentService.restoreVersion(versionId, user.employee.id);
  }

  @Get(':id/versions')
  @CheckPermissions({ action: 'read', module: 'documents' })
  versions(@Param('id') id: string) {
    return this.documentService.findVersions(id);
  }

  @Get('download/:id')
  @CheckPermissions({ action: 'read', module: 'documents' })
  async downloadFile(
    @Param('id') id: string,
    @AuthUser() user: any,
  ): Promise<{ url: string }> {
    const url = await this.documentService.getDownloadUrl(id, user.id);
    return { url };
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'documents' })
  findAll(@AuthUser() user: any, @Query('type') type?: string) {
    const where: any = {};
    if (type) where.type = type;

    const isPowerful = user.roles.some((role: any) =>
      ['admin', 'hr'].includes(role.name),
    );
    if (!isPowerful) {
      where.employeeId = user.employee.id;
    }

    return this.documentService.findAll(
      { where, orderBy: { createdAt: 'desc' } },
      { includeExpired: isPowerful, includeDeleted: false },
    );
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'documents' })
  async findOne(@Param('id') id: string) {
    const doc = await this.documentService.findOne(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  /** charge.docx §4.7: default delete is soft-delete. */
  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'documents' })
  remove(@Param('id') id: string) {
    return this.documentService.softDelete(id);
  }

  /** Admin-only permanent purge. */
  @Delete(':id/permanent')
  @CheckPermissions({ action: 'manage', module: 'all' })
  permanentRemove(@Param('id') id: string) {
    return this.documentService.permanentDelete(id);
  }
}
