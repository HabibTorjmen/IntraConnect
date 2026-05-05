import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ---- existing aggregate stats ----
  async getAdminStats() {
    const [totalEmployees, openTickets, pendingLeaves, activeSurveys] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.ticket.count({ where: { status: { notIn: ['closed', 'resolved'] } } }),
      this.prisma.leaveRequest.count({ where: { status: 'pending' } }),
      this.prisma.survey.count({ where: { isActive: true } }),
    ]);
    return { totalEmployees, openTickets, pendingLeaves, activeSurveys };
  }

  async getEmployeeStats(employeeId: string, userId: string) {
    const [myPendingLeaves, myOpenTickets, myTrainingPlans, myNotifications] = await Promise.all([
      this.prisma.leaveRequest.count({ where: { employeeId, status: 'pending' } }),
      this.prisma.ticket.count({
        where: { employeeId, status: { notIn: ['closed', 'resolved'] } },
      }),
      this.prisma.trainingPlan.count({ where: { employeeId, status: 'planned' } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return {
      myPendingLeaves,
      myOpenTickets,
      myTrainingPlans,
      myUnreadNotifications: myNotifications,
    };
  }

  // ---- per-module KPI endpoints (charge.docx §4.13) ----
  async leaveKpi() {
    const [pending, approvedThisMonth, byType] = await Promise.all([
      this.prisma.leaveRequest.count({ where: { status: 'pending' } }),
      this.prisma.leaveRequest.count({
        where: {
          status: 'approved',
          startDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.leaveRequest.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
    ]);
    return { pending, approvedThisMonth, byType };
  }

  async ticketsKpi() {
    const [byStatus, byPriority, breachedSla] = await Promise.all([
      this.prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.ticket.groupBy({ by: ['priority'], _count: { _all: true } }),
      this.prisma.ticket.count({ where: { slaStatus: 'BREACHED' } }),
    ]);
    return { byStatus, byPriority, breachedSla };
  }

  async employeesKpi() {
    const [active, inactive, byDept] = await Promise.all([
      this.prisma.employee.count({ where: { status: 'active' } }),
      this.prisma.employee.count({ where: { status: 'inactive' } }),
      this.prisma.employee.groupBy({ by: ['departmentId'], _count: { _all: true } }),
    ]);
    return { active, inactive, byDept };
  }

  async payrollKpi() {
    const [totalPayslips, publishedThisMonth] = await Promise.all([
      this.prisma.payrollRecord.count(),
      this.prisma.payrollRecord.count({
        where: {
          status: 'published',
          publishedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);
    return { totalPayslips, publishedThisMonth };
  }

  async documentsKpi() {
    const [total, expiringSoon] = await Promise.all([
      this.prisma.document.count({ where: { isDeleted: false, isLatest: true } }),
      this.prisma.document.count({
        where: {
          isDeleted: false,
          isLatest: true,
          expiresAt: {
            gt: new Date(),
            lt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        },
      }),
    ]);
    return { total, expiringSoon };
  }

  async facilityKpi() {
    const byUrgency = await this.prisma.facilityRequest.groupBy({
      by: ['urgency'],
      _count: { _all: true },
    });
    const open = await this.prisma.facilityRequest.count({
      where: { status: { notIn: ['closed', 'resolved'] } },
    });
    return { byUrgency, open };
  }

  async attendanceKpi(employeeId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const where = employeeId ? { employeeId, date: today } : { date: today };
    const records = await this.prisma.attendanceRecord.findMany({ where });
    const totalWorkedMin = records.reduce((s, r) => s + r.workedMinutes, 0);
    return { records: records.length, totalWorkedMin };
  }

  // ---- widget registry ----
  listWidgets(role: string) {
    return this.prisma.dashboardWidget.findMany({
      where: { isActive: true },
      orderBy: { defaultOrder: 'asc' },
    }).then((all) =>
      all.filter((w) => {
        const arr = (w.defaultRoles as unknown as string[]) ?? [];
        return arr.length === 0 || arr.includes(role);
      }),
    );
  }

  getMyLayout(userId: string) {
    return this.prisma.userDashboardLayout.findUnique({ where: { userId } });
  }

  setMyLayout(userId: string, layout: any) {
    return this.prisma.userDashboardLayout.upsert({
      where: { userId },
      create: { userId, layout },
      update: { layout },
    });
  }

  upsertWidget(data: {
    id?: string;
    key: string;
    title: string;
    category: string;
    defaultRoles?: string[];
    defaultOrder?: number;
    isActive?: boolean;
  }) {
    if (data.id) {
      return this.prisma.dashboardWidget.update({
        where: { id: data.id },
        data: {
          ...data,
          defaultRoles: data.defaultRoles ?? [],
        },
      });
    }
    return this.prisma.dashboardWidget.upsert({
      where: { key: data.key },
      update: {
        title: data.title,
        category: data.category,
        defaultRoles: data.defaultRoles ?? [],
        defaultOrder: data.defaultOrder ?? 100,
        isActive: data.isActive ?? true,
      },
      create: {
        key: data.key,
        title: data.title,
        category: data.category,
        defaultRoles: data.defaultRoles ?? [],
        defaultOrder: data.defaultOrder ?? 100,
        isActive: data.isActive ?? true,
      },
    });
  }
}
