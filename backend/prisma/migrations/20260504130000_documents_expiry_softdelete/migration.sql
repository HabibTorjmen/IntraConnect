ALTER TABLE "Document"
  ADD COLUMN "expiresAt"   TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deletedAt"   TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Document_isDeleted_idx" ON "Document"("isDeleted");
CREATE INDEX IF NOT EXISTS "Document_expiresAt_idx" ON "Document"("expiresAt");
