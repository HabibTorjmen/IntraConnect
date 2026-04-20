/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('view', 'download');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "employee_code" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "birth_date" TIMESTAMP(3),
    "hire_date" TIMESTAMP(3),
    "department" TEXT,
    "position" TEXT,
    "job_title_id" INTEGER,
    "manager_id" INTEGER,
    "profile_picture" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_titles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER,
    "department" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "days_per_year" INTEGER NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "policy_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days_count" INTEGER NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sla_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_id" INTEGER,
    "created_by" INTEGER,
    "assigned_to" INTEGER,
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by" INTEGER,
    "is_company_doc" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_access_logs" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "access_type" "AccessType" NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_by" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_access_logs" (
    "id" SERIAL NOT NULL,
    "payroll_id" INTEGER NOT NULL,
    "accessed_by" INTEGER NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "payroll_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "link" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "task_name" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE INDEX "employees_user_id_idx" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employees_manager_id_idx" ON "employees"("manager_id");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_idx" ON "leave_requests"("employee_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_requests_start_date_end_date_idx" ON "leave_requests"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "tickets_created_by_idx" ON "tickets"("created_by");

-- CreateIndex
CREATE INDEX "tickets_assigned_to_idx" ON "tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "ticket_comments_ticket_id_idx" ON "ticket_comments"("ticket_id");

-- CreateIndex
CREATE INDEX "documents_uploaded_by_idx" ON "documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "documents_is_company_doc_idx" ON "documents"("is_company_doc");

-- CreateIndex
CREATE INDEX "document_access_logs_document_id_idx" ON "document_access_logs"("document_id");

-- CreateIndex
CREATE INDEX "payrolls_employee_id_idx" ON "payrolls"("employee_id");

-- CreateIndex
CREATE INDEX "payrolls_year_month_idx" ON "payrolls"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employee_id_month_year_key" ON "payrolls"("employee_id", "month", "year");

-- CreateIndex
CREATE INDEX "payroll_access_logs_payroll_id_idx" ON "payroll_access_logs"("payroll_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "onboarding_tasks_user_id_idx" ON "onboarding_tasks"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "leave_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_access_logs" ADD CONSTRAINT "payroll_access_logs_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_access_logs" ADD CONSTRAINT "payroll_access_logs_accessed_by_fkey" FOREIGN KEY ("accessed_by") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
