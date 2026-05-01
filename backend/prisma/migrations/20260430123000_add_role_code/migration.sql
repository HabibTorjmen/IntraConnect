ALTER TABLE "Role" ADD COLUMN "code" TEXT;

UPDATE "Role"
SET "code" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '_', 'g'))
WHERE "code" IS NULL;

ALTER TABLE "Role" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
