-- AttendancePolicy
CREATE TABLE "AttendancePolicy" (
  "id"                   TEXT NOT NULL,
  "name"                 TEXT NOT NULL,
  "workingHoursPerDay"   DOUBLE PRECISION NOT NULL DEFAULT 8,
  "workingDaysPerWeek"   INTEGER NOT NULL DEFAULT 5,
  "weekendDays"          JSONB NOT NULL DEFAULT '[6,0]',
  "minBreakMinutes"      INTEGER NOT NULL DEFAULT 0,
  "maxBreakMinutes"      INTEGER NOT NULL DEFAULT 60,
  "breakAfterHours"      DOUBLE PRECISION NOT NULL DEFAULT 4,
  "graceLateMinutes"     INTEGER NOT NULL DEFAULT 15,
  "earliestClockIn"      TEXT,
  "latestExpectedClockIn" TEXT,
  "overtimeThresholdHrs" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "overtimeMode"         TEXT NOT NULL DEFAULT 'tracked',
  "maxBreaksPerDay"      INTEGER NOT NULL DEFAULT 2,
  "autoCloseAt"          TEXT,
  "scope"                TEXT NOT NULL DEFAULT 'default',
  "scopeValue"           TEXT,
  CONSTRAINT "AttendancePolicy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AttendancePolicy_name_key" ON "AttendancePolicy"("name");

-- AttendanceRecord
CREATE TABLE "AttendanceRecord" (
  "id"            TEXT NOT NULL,
  "employeeId"    TEXT NOT NULL,
  "date"          DATE NOT NULL,
  "workedMinutes" INTEGER NOT NULL DEFAULT 0,
  "breakMinutes"  INTEGER NOT NULL DEFAULT 0,
  "status"        TEXT NOT NULL DEFAULT 'open',
  "flags"         JSONB,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AttendanceRecord"
  ADD CONSTRAINT "AttendanceRecord_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key"
  ON "AttendanceRecord"("employeeId","date");

-- AttendanceEvent
CREATE TABLE "AttendanceEvent" (
  "id"           TEXT NOT NULL,
  "type"         TEXT NOT NULL,
  "occurredAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source"       TEXT NOT NULL DEFAULT 'user',
  "reason"       TEXT,
  "employeeId"   TEXT NOT NULL,
  "recordId"     TEXT,
  "correctedById" TEXT,
  "oldValueIso"  TEXT,
  CONSTRAINT "AttendanceEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AttendanceEvent"
  ADD CONSTRAINT "AttendanceEvent_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AttendanceEvent"
  ADD CONSTRAINT "AttendanceEvent_recordId_fkey"
  FOREIGN KEY ("recordId") REFERENCES "AttendanceRecord"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AttendanceEvent_employeeId_occurredAt_idx"
  ON "AttendanceEvent"("employeeId","occurredAt");

-- AttendanceAdjustmentLog (immutable)
CREATE TABLE "AttendanceAdjustmentLog" (
  "id"           TEXT NOT NULL,
  "recordId"     TEXT NOT NULL,
  "field"        TEXT NOT NULL,
  "oldValue"     TEXT,
  "newValue"     TEXT,
  "reason"       TEXT NOT NULL,
  "adjustedById" TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceAdjustmentLog_pkey" PRIMARY KEY ("id")
);

CREATE OR REPLACE FUNCTION reject_attendance_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AttendanceAdjustmentLog is append-only.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attendance_log_no_update ON "AttendanceAdjustmentLog";
CREATE TRIGGER attendance_log_no_update
  BEFORE UPDATE ON "AttendanceAdjustmentLog"
  FOR EACH ROW EXECUTE FUNCTION reject_attendance_log_mutation();

DROP TRIGGER IF EXISTS attendance_log_no_delete ON "AttendanceAdjustmentLog";
CREATE TRIGGER attendance_log_no_delete
  BEFORE DELETE ON "AttendanceAdjustmentLog"
  FOR EACH ROW EXECUTE FUNCTION reject_attendance_log_mutation();
