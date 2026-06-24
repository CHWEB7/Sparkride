import { prisma } from "@/lib/prisma";
import {
  isSquareConfigured,
  squareApplicationIdDiagnostics,
  squareCredentialMismatchMessage,
  squareCredentialsMatchEnvironment,
  squareEnvironment,
  squareOAuthAuthorizeUrl,
  squareSetupHints,
} from "@/lib/square/config";
import { driverHasSquareConnected } from "@/lib/square/driver-tokens";

export type DriverSquareStatus = {
  configured: boolean;
  connected: boolean;
  merchantId?: string | null;
  locationId?: string | null;
  connectedAt?: string | null;
  environment?: "sandbox" | "production";
  oauthHost?: string;
  credentialsMatchEnvironment?: boolean;
  credentialMismatch?: string | null;
  applicationId?: {
    configured: boolean;
    prefix: string;
    last4: string;
    looksSandbox: boolean;
    looksProduction: boolean;
  };
  setupHints?: string[];
};

export async function getDriverSquareStatus(
  driverId: string
): Promise<DriverSquareStatus | null> {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: {
      squareMerchantId: true,
      squareLocationId: true,
      squareRefreshTokenEnc: true,
      squareConnectedAt: true,
    },
  });

  if (!driver) return null;

  return {
    configured: isSquareConfigured(),
    connected: driverHasSquareConnected(driver),
    merchantId: driver.squareMerchantId,
    locationId: driver.squareLocationId,
    connectedAt: driver.squareConnectedAt?.toISOString() ?? null,
    environment: squareEnvironment(),
    oauthHost: squareOAuthAuthorizeUrl().replace("/oauth2/authorize", ""),
    credentialsMatchEnvironment: squareCredentialsMatchEnvironment(),
    credentialMismatch: squareCredentialMismatchMessage(),
    applicationId: squareApplicationIdDiagnostics(),
    setupHints: squareSetupHints(),
  };
}
