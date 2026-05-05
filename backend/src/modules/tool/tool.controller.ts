import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ToolService } from './tool.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('tools')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ToolController {
  constructor(private readonly tools: ToolService) {}

  @Get()
  @CheckPermissions({ action: 'read', module: 'tools' })
  list(@AuthUser() user: any) {
    return this.tools.listForUser(user);
  }

  @Get('all')
  @CheckPermissions({ action: 'manage', module: 'tools' })
  listAll() {
    return this.tools.listAll();
  }

  @Post()
  @CheckPermissions({ action: 'manage', module: 'tools' })
  upsert(@Body() data: any) {
    return this.tools.upsert(data);
  }

  @Patch(':id/active')
  @CheckPermissions({ action: 'manage', module: 'tools' })
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.tools.setActive(id, isActive);
  }

  @Post('reorder')
  @CheckPermissions({ action: 'manage', module: 'tools' })
  reorder(@Body() body: { ordered: Array<{ id: string; priority: number }> }) {
    return this.tools.reorder(body.ordered);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'tools' })
  remove(@Param('id') id: string) {
    return this.tools.remove(id);
  }
}
