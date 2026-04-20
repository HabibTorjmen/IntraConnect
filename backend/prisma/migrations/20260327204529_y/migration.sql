/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_access_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_titles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `onboarding_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payroll_access_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payrolls` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "document_access_logs" DROP CONSTRAINT "document_access_logs_document_id_fkey";

-- DropForeignKey
ALTER TABLE "document_access_logs" DROP CONSTRAINT "document_access_logs_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_job_title_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_fkey";

-- DropForeignKey
ALTER TABLE "leave_requests" DROP CONSTRAINT "leave_requests_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "leave_requests" DROP CONSTRAINT "leave_requests_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "leave_requests" DROP CONSTRAINT "leave_requests_policy_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "onboarding_tasks" DROP CONSTRAINT "onboarding_tasks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_access_logs" DROP CONSTRAINT "payroll_access_logs_accessed_by_fkey";

-- DropForeignKey
ALTER TABLE "payroll_access_logs" DROP CONSTRAINT "payroll_access_logs_payroll_id_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "ticket_comments" DROP CONSTRAINT "ticket_comments_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_comments" DROP CONSTRAINT "ticket_comments_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_category_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_created_by_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "document_access_logs";

-- DropTable
DROP TABLE "documents";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "job_titles";

-- DropTable
DROP TABLE "leave_policies";

-- DropTable
DROP TABLE "leave_requests";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "onboarding_tasks";

-- DropTable
DROP TABLE "payroll_access_logs";

-- DropTable
DROP TABLE "payrolls";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "ticket_categories";

-- DropTable
DROP TABLE "ticket_comments";

-- DropTable
DROP TABLE "tickets";

-- DropTable
DROP TABLE "tools";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AccessType";

-- DropEnum
DROP TYPE "LeaveStatus";

-- DropEnum
DROP TYPE "TicketPriority";

-- DropEnum
DROP TYPE "TicketStatus";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "managerId" TEXT,
    "jobTitleId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTitle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "JobTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "netAmount" DECIMAL(65,30) NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_RoleToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingChecklist_employeeId_key" ON "OnboardingChecklist"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToTool_AB_unique" ON "_RoleToTool"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToTool_B_index" ON "_RoleToTool"("B");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTool" ADD CONSTRAINT "_RoleToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToTool" ADD CONSTRAINT "_RoleToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
