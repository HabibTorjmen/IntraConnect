import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @CheckPermissions({ action: 'create', module: 'documents' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; description?: string; category?: string; type: string; isPublic?: string },
    @AuthUser() user: any,
  ) {
    return this.documentService.uploadDocument(file, {
      ...body,
      isPublic: body.isPublic === 'true',
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

  @Get('download/:id')
  @CheckPermissions({ action: 'read', module: 'documents' })
  async downloadFile(
    @Param('id') id: string,
    @AuthUser() user: any,
    @Res() res: Response
  ) {
    const document = await this.documentService.findOne(id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Log the download
    await this.documentService.logAccess(id, user.id, 'download');

    const filePath = join(process.cwd(), document.url);
    return res.download(filePath, document.filename || document.title);
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'documents' })
  findAll(@AuthUser() user: any, @Query('type') type?: string) {
    const where: any = {};
    if (type) where.type = type;

    // Filter by employeeId if not admin/HR
    const isPowerful = user.roles.some(role => ['admin', 'hr'].includes(role.name));
    if (!isPowerful) {
      where.employeeId = user.employee.id;
    }

    return this.documentService.findAll({ 
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'documents' })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
