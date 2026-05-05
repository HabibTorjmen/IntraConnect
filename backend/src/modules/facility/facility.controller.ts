import {
  Body,
  Controller,
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
import { FacilityService } from './facility.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('facility')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FacilityController {
  constructor(private readonly service: FacilityService) {}

  // Locations
  @Get('locations')
  @CheckPermissions({ action: 'read', module: 'facility' })
  listLocations(@Query('all') all?: string) {
    return this.service.listLocations(all !== 'true');
  }

  @Post('locations')
  @CheckPermissions({ action: 'manage', module: 'facility' })
  upsertLocation(@Body() data: any) {
    return this.service.upsertLocation(data);
  }

  // Assets
  @Get('assets')
  @CheckPermissions({ action: 'read', module: 'facility' })
  listAssets(@Query('locationId') locationId?: string) {
    return this.service.listAssets(locationId);
  }

  @Post('assets')
  @CheckPermissions({ action: 'manage', module: 'facility' })
  upsertAsset(@Body() data: any) {
    return this.service.upsertAsset(data);
  }

  // Requests
  @Post('requests')
  @CheckPermissions({ action: 'create', module: 'facility' })
  createRequest(@Body() data: any, @AuthUser() user: any) {
    return this.service.createRequest({
      ...data,
      reporterEmployeeId: user.employee.id,
    });
  }

  @Get('requests')
  @CheckPermissions({ action: 'read', module: 'facility' })
  listRequests(
    @Query('status') status?: string,
    @Query('urgency') urgency?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.service.listRequests({ status, urgency, locationId });
  }

  @Get('requests/:id')
  @CheckPermissions({ action: 'read', module: 'facility' })
  findRequest(@Param('id') id: string) {
    return this.service.findRequest(id);
  }

  @Patch('requests/:id')
  @CheckPermissions({ action: 'manage', module: 'facility' })
  updateRequest(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRequest(id, data);
  }

  @Post('requests/:id/photos')
  @CheckPermissions({ action: 'create', module: 'facility' })
  @UseInterceptors(FileInterceptor('file'))
  addPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.addPhoto(id, file);
  }

  @Post('requests/:id/escalate')
  @CheckPermissions({ action: 'manage', module: 'facility' })
  escalate(@Param('id') id: string, @AuthUser() user: any) {
    return this.service.escalateToTicket(id, user.employee.id);
  }
}
