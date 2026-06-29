-- Run once in Supabase SQL Editor if bookings fail with "Failed to create booking".
-- Safe to re-run: uses IF NOT EXISTS / duplicate_object guards throughout.

-- Payment + Square Connect columns
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

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

ALTER TABLE "Driver"
  ADD COLUMN IF NOT EXISTS "squareMerchantId" TEXT,
  ADD COLUMN IF NOT EXISTS "squareLocationId" TEXT,
  ADD COLUMN IF NOT EXISTS "squareAccessTokenEnc" TEXT,
  ADD COLUMN IF NOT EXISTS "squareRefreshTokenEnc" TEXT,
  ADD COLUMN IF NOT EXISTS "squareTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "squareConnectedAt" TIMESTAMP(3);

-- Saved booking templates
CREATE TABLE IF NOT EXISTS "SavedBookingDetails" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "serviceType" "ServiceType" NOT NULL DEFAULT 'AIRPORT_TRANSFER',
  "journeyType" "JourneyType" NOT NULL DEFAULT 'SINGLE',
  "tripType" "TripType" NOT NULL DEFAULT 'TO_AIRPORT',
  "airportCode" TEXT,
  "pickupAddress" TEXT NOT NULL,
  "dropoffAddress" TEXT NOT NULL,
  "passengers" INTEGER NOT NULL DEFAULT 1,
  "luggage" INTEGER NOT NULL DEFAULT 1,
  "vehicleType" "VehicleType" NOT NULL DEFAULT 'SALOON',
  "driverId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedBookingDetails_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SavedBookingDetails_customerId_fkey'
  ) THEN
    ALTER TABLE "SavedBookingDetails"
      ADD CONSTRAINT "SavedBookingDetails_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

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

-- Daily email MFA session tracking
CREATE TABLE IF NOT EXISTS "CustomerMfaSession" (
  "userId" TEXT NOT NULL,
  "validDate" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastOtpSentAt" TIMESTAMP(3),
  "otpHash" TEXT,
  "otpExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerMfaSession_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "CustomerMfaSession" ADD COLUMN IF NOT EXISTS "lastOtpSentAt" TIMESTAMP(3);
ALTER TABLE "CustomerMfaSession" ADD COLUMN IF NOT EXISTS "otpHash" TEXT;
ALTER TABLE "CustomerMfaSession" ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP(3);
