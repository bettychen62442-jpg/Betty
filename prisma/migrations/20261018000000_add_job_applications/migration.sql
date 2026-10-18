CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "appliedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link" TEXT,
    "notes" TEXT,
    "location" TEXT,
    "salaryRange" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");
CREATE INDEX "JobApplication_appliedDate_idx" ON "JobApplication"("appliedDate");
