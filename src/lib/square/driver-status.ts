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
import { driverHasSquareConnected, getDriverAccessToken } from "@/lib/square/driver-tokens";
import {
  isSquareScopeError,
  squareScopeErrorMessage,
  verifySquareCheckoutPermissions,
} from "@/lib/square/permissions";

export type DriverSquareStatus = {
  configured: boolean;
  connected: boolean;
  checkoutPermissionsOk?: boolean;
  checkoutPermissionsError?: string | null;
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

  const connected = driverHasSquareConnected(driver);
  let checkoutPermissionsOk: boolean | undefined;
  let checkoutPermissionsError: string | null = null;

  if (connected) {
    const tokenResult = await getDriverAccessToken(driverId);
    if (!tokenResult.ok) {
      checkoutPermissionsOk = false;
      checkoutPermissionsError = tokenResult.error;
    } else {
      const permissions = await verifySquareCheckoutPermissions(tokenResult.accessToken);
      checkoutPermissionsOk = permissions.ok;
      if (!permissions.ok) {
        checkoutPermissionsError = isSquareScopeError(permissions.error)
          ? squareScopeErrorMessage()
          : permissions.error;
      }
    }
  }

  return {
    configured: isSquareConfigured(),
    connected,
    checkoutPermissionsOk,
    checkoutPermissionsError,
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
