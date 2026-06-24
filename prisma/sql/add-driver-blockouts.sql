-- Driver annual leave / block-out dates
CREATE TABLE IF NOT EXISTS "DriverBlockOut" (
  "id" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DriverBlockOut_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DriverBlockOut_driverId_startDate_endDate_idx"
  ON "DriverBlockOut" ("driverId", "startDate", "endDate");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DriverBlockOut_driverId_fkey'
  ) THEN
    ALTER TABLE "DriverBlockOut"
      ADD CONSTRAINT "DriverBlockOut_driverId_fkey"
      FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
