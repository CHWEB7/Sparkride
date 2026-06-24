-- Run once in Supabase SQL Editor (single query — do not split).
-- Migrates booking status flow:
--   PENDING → ACCEPTED → CONFIRMED (paid) → COMPLETED
--
-- Recreates the enum in one step (avoids "unsafe use of new value ACCEPTED" error).

DO $$
BEGIN
  -- Skip if already on the target enum shape
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'ACCEPTED'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingStatus' AND e.enumlabel IN ('PAID', 'EN_ROUTE')
  ) THEN
    RAISE NOTICE 'BookingStatus already migrated — nothing to do.';
    RETURN;
  END IF;

  DROP TYPE IF EXISTS "BookingStatus_new";

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
    USING (
      CASE status::text
        WHEN 'PENDING' THEN 'PENDING'
        WHEN 'ACCEPTED' THEN 'ACCEPTED'
        WHEN 'COMPLETED' THEN 'COMPLETED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
        WHEN 'PAID' THEN 'CONFIRMED'
        WHEN 'EN_ROUTE' THEN 'CONFIRMED'
        WHEN 'CONFIRMED' THEN
          CASE "paymentStatus"::text
            WHEN 'PAID' THEN 'CONFIRMED'
            ELSE 'ACCEPTED'
          END
        ELSE 'PENDING'
      END
    )::"BookingStatus_new";

  DROP TYPE "BookingStatus";
  ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

  ALTER TABLE "Booking"
    ALTER COLUMN status SET DEFAULT 'PENDING';
END $$;
