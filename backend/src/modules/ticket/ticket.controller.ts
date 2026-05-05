import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('categories')
  @CheckPermissions({ action: 'read', module: 'tickets' })
  findAllCategories() {
    return this.ticketService.findAllCategories();
  }

  @Get('sla-config')
  @CheckPermissions({ action: 'read', module: 'tickets' })
  slaConfig() {
    return this.ticketService.slaConfig();
  }

  @Post()
  @CheckPermissions({ action: 'create', module: 'tickets' })
  create(@Body() createTicketDto: any, @AuthUser() user: any) {
    return this.ticketService.create({
      ...createTicketDto,
      employeeId: user.employee.id,
    });
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'tickets' })
  findAll(
    @AuthUser() user: any,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const isAdminOrManager = user.roles?.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    if (!isAdminOrManager) {
      where.employeeId = user.employee.id;
    }
    return this.ticketService.findAll({ where });
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'tickets' })
  findOne(@Param('id') id: string, @AuthUser() user: any) {
    const isAdminOrManager = user.roles?.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    return this.ticketService.findOne(id, isAdminOrManager);
  }

  @Patch(':id')
  @CheckPermissions({ action: 'update', module: 'tickets' })
  update(@Param('id') id: string, @Body() updateTicketDto: any) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Post(':id/comments')
  @CheckPermissions({ action: 'update', module: 'tickets' })
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string; isInternal?: boolean },
    @AuthUser() user: any,
  ) {
    const isAdminOrManager = user.roles?.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    const internal = !!body.isInternal && isAdminOrManager;
    return this.ticketService.addComment(id, user.employee.id, body.content, internal);
  }

  @Post(':id/attachments')
  @CheckPermissions({ action: 'update', module: 'tickets' })
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isResolution') isResolution?: string,
  ) {
    return this.ticketService.addAttachment(id, file, isResolution === 'true');
  }

  @Post(':id/rating')
  @CheckPermissions({ action: 'update', module: 'tickets' })
  rate(
    @Param('id') id: string,
    @Body() body: { rating: number; feedback?: string },
    @AuthUser() user: any,
  ) {
    return this.ticketService.submitRating(
      id,
      user.employee.id,
      body.rating,
      body.feedback,
    );
  }

  @Post(':id/merge/:targetId')
  @CheckPermissions({ action: 'manage', module: 'tickets' })
  merge(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.ticketService.mergeDuplicate(id, targetId);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
