CREATE TABLE "DashboardWidget" (
  "id"           TEXT NOT NULL,
  "key"          TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "category"     TEXT NOT NULL,
  "defaultRoles" JSONB NOT NULL DEFAULT '[]',
  "defaultOrder" INTEGER NOT NULL DEFAULT 100,
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DashboardWidget_key_key" ON "DashboardWidget"("key");
CREATE INDEX "DashboardWidget_category_idx" ON "DashboardWidget"("category");

CREATE TABLE "UserDashboardLayout" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "layout"    JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserDashboardLayout_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserDashboardLayout_userId_key" ON "UserDashboardLayout"("userId");
