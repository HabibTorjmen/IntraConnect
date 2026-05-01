import { Module } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GLOBAL_CONFIG } from '../../configs/global.config';
import { LoggerModule } from '../logger/logger.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { LoggerMiddleware } from '../../middlewares/logger.middleware';

import { EmployeeModule } from '../employee/employee.module';
import { LeaveModule } from '../leave/leave.module';
import { AuditModule } from '../audit/audit.module';
import { TicketModule } from '../ticket/ticket.module';
import { DocumentModule } from '../document/document.module';
import { PayrollModule } from '../payroll/payroll.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { TrainingModule } from '../training/training.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { NotificationModule } from '../notification/notification.module';
import { RoleModule } from '../role/role.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from '../../interceptors/audit.interceptor';
@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    AuthModule,
    UserModule,
    EmployeeModule,
    LeaveModule,
    AuditModule,
    TicketModule,
    DocumentModule,
    PayrollModule,
    FeedbackModule,
    TrainingModule,
    DashboardModule,
    NotificationModule,
    RoleModule,
    ConfigModule.forRoot({ isGlobal: true, load: [() => GLOBAL_CONFIG] }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
