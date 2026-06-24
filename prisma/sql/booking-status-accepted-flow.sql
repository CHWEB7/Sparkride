-- Run once in Supabase SQL Editor to migrate booking status flow:
-- PENDING (new booking) → ACCEPTED (driver accepted) → CONFIRMED (customer paid) → COMPLETED
--
-- Migrates legacy data:
--   PAID                    → CONFIRMED
--   CONFIRMED + paid online → CONFIRMED (unchanged label, new meaning)
--   CONFIRMED + awaiting    → ACCEPTED
--   CONFIRMED + not required→ ACCEPTED

-- 1. Add ACCEPTED enum value if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'ACCEPTED'
  ) THEN
    ALTER TYPE "BookingStatus" ADD VALUE 'ACCEPTED' BEFORE 'CONFIRMED';
  END IF;
END $$;

-- 2. Migrate row data before removing PAID
UPDATE "Booking"
SET status = 'CONFIRMED'
WHERE status = 'PAID';

UPDATE "Booking"
SET status = 'ACCEPTED'
WHERE status = 'CONFIRMED'
  AND "paymentStatus" IN ('AWAITING_PAYMENT', 'NOT_REQUIRED', 'FAILED');

UPDATE "Booking"
SET status = 'CONFIRMED'
WHERE status = 'CONFIRMED'
  AND "paymentStatus" = 'PAID';

-- 3. Remove PAID from enum (recreate type — Postgres cannot DROP enum value directly)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'PAID'
  ) THEN
    CREATE TYPE "BookingStatus_new" AS ENUM (
      'PENDING',
      'ACCEPTED',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED'
    );

    ALTER TABLE "Booking"
      ALTER COLUMN status DROP DEFAULT;

    ALTER TABLE "Booking"
      ALTER COLUMN status TYPE "BookingStatus_new"
      USING status::text::"BookingStatus_new";

    DROP TYPE "BookingStatus";
    ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

    ALTER TABLE "Booking"
      ALTER COLUMN status SET DEFAULT 'PENDING';
  END IF;
END $$;
