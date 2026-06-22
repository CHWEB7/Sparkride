-- Daily email MFA session tracking (mobile API + backup for web)
CREATE TABLE IF NOT EXISTS "CustomerMfaSession" (
  "userId" TEXT NOT NULL,
  "validDate" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerMfaSession_pkey" PRIMARY KEY ("userId")
);
