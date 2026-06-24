-- Run in Supabase SQL Editor to rename BookingStatus EN_ROUTE → PAID.
-- Safe to run once; no-op if EN_ROUTE no longer exists.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingStatus' AND e.enumlabel = 'EN_ROUTE'
  ) THEN
    ALTER TYPE "BookingStatus" RENAME VALUE 'EN_ROUTE' TO 'PAID';
  END IF;
END $$;
