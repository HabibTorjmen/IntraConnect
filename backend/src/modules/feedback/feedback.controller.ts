import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthUser } from '../auth/auth.user.decorator';

// Helper for permissions
const CheckPermissions = (...perms: { action: string; module: string }[]) => 
  SetMetadata('permissions', perms);

@Controller('feedback')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('surveys')
  @CheckPermissions({ action: 'create', module: 'Survey' })
  createSurvey(@Body() data: any) {
    return this.feedbackService.createSurvey(data);
  }

  @Get('surveys')
  @CheckPermissions({ action: 'read', module: 'Survey' })
  findAllSurveys() {
    return this.feedbackService.findAllSurveys();
  }

  @Get('surveys/:id')
  @CheckPermissions({ action: 'read', module: 'Survey' })
  findOneSurvey(@Param('id') id: string) {
    return this.feedbackService.findOneSurvey(id);
  }

  @Post('surveys/:id/respond')
  submitResponse(
    @Param('id') id: string,
    @Body('answers') answers: any,
    @AuthUser() user: any,
  ) {
    return this.feedbackService.submitSurveyResponse(id, answers, user.id);
  }

  @Post('performance')
  @CheckPermissions({ action: 'create', module: 'PerformanceFeedback' })
  createPerformanceFeedback(@Body() data: any, @AuthUser() user: any) {
    return this.feedbackService.createPerformanceFeedback({
      ...data,
      authorId: user.id,
    });
  }

  @Get('performance')
  @CheckPermissions({ action: 'read', module: 'PerformanceFeedback' })
  findAllPerformanceFeedback(@AuthUser() user: any) {
    // Admins and HR can see all feedback
    // Managers can see feedback for their team (simplified to admin check for now)
    // Employees can see their own
    if (user.roles.some(r => r.name === 'ADMIN' || r.name === 'HR')) {
      return this.feedbackService.findAllFeedback();
    }
    return this.feedbackService.findEmployeeFeedback(user.id);
  }

  @Get('performance/:employeeId')
  @CheckPermissions({ action: 'read', module: 'PerformanceFeedback' })
  findEmployeeFeedback(@Param('employeeId') employeeId: string) {
    return this.feedbackService.findEmployeeFeedback(employeeId);
  }
}
