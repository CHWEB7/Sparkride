-- Run in Supabase SQL Editor (production) if driver dashboard crashes after deploy.
-- Adds payment + Square Connect columns from prisma/schema.prisma.

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM (
    'NOT_REQUIRED',
    'AWAITING_PAYMENT',
    'PAID',
    'FAILED',
    'REFUNDED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS "amountDue" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "squarePaymentLinkId" TEXT,
  ADD COLUMN IF NOT EXISTS "squarePaymentLinkUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "squarePaymentId" TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

ALTER TABLE "Driver"
  ADD COLUMN IF NOT EXISTS "squareMerchantId" TEXT,
  ADD COLUMN IF NOT EXISTS "squareLocationId" TEXT,
  ADD COLUMN IF NOT EXISTS "squareAccessTokenEnc" TEXT,
  ADD COLUMN IF NOT EXISTS "squareRefreshTokenEnc" TEXT,
  ADD COLUMN IF NOT EXISTS "squareTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "squareConnectedAt" TIMESTAMP(3);
