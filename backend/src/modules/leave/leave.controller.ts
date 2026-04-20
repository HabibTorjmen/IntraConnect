import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeaveDTO, UpdateLeaveStatusDTO } from './dto/leave.dto';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@ApiTags('leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @CheckPermissions({ action: 'create', module: 'leave' })
  @ApiOperation({ description: 'Create a new leave request' })
  async create(@Body() data: CreateLeaveDTO, @AuthUser() user: any) {
    // Ensure employeeId matches user unless admin
    const isAdmin = user.roles.some(role => role.name === 'admin');
    const employeeId = isAdmin ? data.employeeId : user.employee.id;
    
    return this.leaveService.create({
      ...data,
      employeeId,
    });
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'leave' })
  @ApiOperation({ description: 'List all leave requests' })
  async findAll(@AuthUser() user: any) {
    // Check if user is admin or manager
    const isPowerful = user.roles.some(role => ['admin', 'manager'].includes(role.name));
    
    if (isPowerful) {
      return this.leaveService.findAll();
    } else {
      // Return only own leaves - this would ideally be done in service or by adding a filter to findAll
      // For now let's assume service handles broad search and we filter here or update service
      const all = await this.leaveService.findAll();
      return all.filter(l => l.employeeId === user.employee.id);
    }
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'leave' })
  @ApiOperation({ description: 'Get a single leave request' })
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(':id/status')
  @CheckPermissions({ action: 'approve', module: 'leave' })
  @ApiOperation({ description: 'Update leave request status (APPROVED/REJECTED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateLeaveStatusDTO,
  ) {
    return this.leaveService.updateStatus(id, data.status);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  @ApiOperation({ description: 'Delete a leave request' })
  async remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
