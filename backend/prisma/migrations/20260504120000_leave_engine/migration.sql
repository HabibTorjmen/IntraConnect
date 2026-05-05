-- Extend LeaveRequest
ALTER TABLE "LeaveRequest"
  ADD COLUMN "workingDays"  INTEGER,
  ADD COLUMN "cancelledAt"  TIMESTAMP(3),
  ADD COLUMN "leaveTypeId"  TEXT;

-- LeaveType
CREATE TABLE "LeaveType" (
  "id"          TEXT NOT NULL,
  "code"        TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LeaveType_code_key" ON "LeaveType"("code");

-- LeavePolicy
CREATE TABLE "LeavePolicy" (
  "id"                       TEXT    NOT NULL,
  "leaveTypeId"              TEXT    NOT NULL,
  "annualEntitlementDays"    INTEGER NOT NULL DEFAULT 0,
  "accrualMethod"            TEXT    NOT NULL DEFAULT 'annual_grant',
  "carryForwardAllowed"      BOOLEAN NOT NULL DEFAULT false,
  "maxCarryForwardDays"      INTEGER NOT NULL DEFAULT 0,
  "carryForwardExpiryMonths" INTEGER NOT NULL DEFAULT 0,
  "minDaysPerRequest"        INTEGER NOT NULL DEFAULT 1,
  "maxDaysPerRequest"        INTEGER NOT NULL DEFAULT 365,
  "advanceNoticeDays"        INTEGER NOT NULL DEFAULT 0,
  "blackoutPeriods"          JSONB,
  "weekendDays"              JSONB   NOT NULL DEFAULT '[6,0]',
  "allowNegativeBalance"     BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "LeavePolicy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LeavePolicy_leaveTypeId_key" ON "LeavePolicy"("leaveTypeId");

-- Holiday
CREATE TABLE "Holiday" (
  "id"        TEXT NOT NULL,
  "date"      DATE NOT NULL,
  "name"      TEXT NOT NULL,
  "recurring" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Holiday_date_name_key" ON "Holiday"("date","name");

-- FKs
ALTER TABLE "LeavePolicy"
  ADD CONSTRAINT "LeavePolicy_leaveTypeId_fkey"
  FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeaveRequest"
  ADD CONSTRAINT "LeaveRequest_leaveTypeId_fkey"
  FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
