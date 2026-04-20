import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
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
  findAll(@AuthUser() user: any, @Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    
    // Check if user is admin or manager - if not, only show their own tickets
    const isAdminOrManager = user.roles?.some(role => ['admin', 'manager'].includes(role.name)) || user.role === 'admin';
    if (!isAdminOrManager) {
      where.employeeId = user.employee.id;
    }

    return this.ticketService.findAll({ where });
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'tickets' })
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
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
    @Body('content') content: string,
    @AuthUser() user: any
  ) {
    return this.ticketService.addComment(id, user.employee.id, content);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
