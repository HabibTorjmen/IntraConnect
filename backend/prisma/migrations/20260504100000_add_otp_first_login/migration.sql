-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "mustChangePassword"  BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN "passwordChangedAt"   TIMESTAMP(3),
  ADD COLUMN "failedLoginAttempts" INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil"         TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OneTimePassword" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "hashedOtp" TEXT NOT NULL,
  "purpose"   TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OneTimePassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OneTimePassword_userId_purpose_idx"
  ON "OneTimePassword"("userId", "purpose");

-- AddForeignKey
ALTER TABLE "OneTimePassword"
  ADD CONSTRAINT "OneTimePassword_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
