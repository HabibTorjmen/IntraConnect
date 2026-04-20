import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [
      totalEmployees,
      openTickets,
      pendingLeaves,
      activeSurveys
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.ticket.count({ where: { status: 'open' } }),
      this.prisma.leaveRequest.count({ where: { status: 'pending' } }),
      this.prisma.survey.count({ where: { isActive: true } }),
    ]);

    return {
      totalEmployees,
      openTickets,
      pendingLeaves,
      activeSurveys,
    };
  }

  async getEmployeeStats(employeeId: string) {
    const [
      myPendingLeaves,
      myOpenTickets,
      myTrainingPlans,
      myNotifications
    ] = await Promise.all([
      this.prisma.leaveRequest.count({ where: { employeeId, status: 'pending' } }),
      this.prisma.ticket.count({ where: { employeeId, status: 'open' } }),
      this.prisma.trainingPlan.count({ where: { employeeId, status: 'planned' } }),
      this.prisma.notification.count({ where: { userId: employeeId, isRead: false } }),
    ]);

    return {
      myPendingLeaves,
      myOpenTickets,
      myTrainingPlans,
      myUnreadNotifications: myNotifications,
    };
  }
}
