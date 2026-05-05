-- charge.docx §Compliance Rules: audit logs are immutable.
-- Enforced at DB level: triggers reject UPDATE and DELETE on AuditLog.

CREATE OR REPLACE FUNCTION reject_auditlog_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'AuditLog is append-only (charge.docx §Compliance Rules). UPDATE/DELETE not permitted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auditlog_no_update ON "AuditLog";
CREATE TRIGGER auditlog_no_update
  BEFORE UPDATE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION reject_auditlog_mutation();

DROP TRIGGER IF EXISTS auditlog_no_delete ON "AuditLog";
CREATE TRIGGER auditlog_no_delete
  BEFORE DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION reject_auditlog_mutation();
