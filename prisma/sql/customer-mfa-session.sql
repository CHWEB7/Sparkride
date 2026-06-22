-- Daily email MFA session tracking (mobile API + backup for web)
CREATE TABLE IF NOT EXISTS "CustomerMfaSession" (
  "userId" TEXT NOT NULL,
  "validDate" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastOtpSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerMfaSession_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "CustomerMfaSession" ADD COLUMN IF NOT EXISTS "lastOtpSentAt" TIMESTAMP(3);
