import { NextResponse } from "next/server";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { prisma } from "@/lib/prisma";
import {
  isSquareConfigured,
  squareApplicationIdDiagnostics,
  squareApplicationSecretDiagnostics,
  squareApplicationSecretMismatchMessage,
  squareCredentialMismatchMessage,
  squareCredentialsMatchEnvironment,
  squareEnvironment,
  squareOAuthAuthorizeUrl,
  squareSetupHints,
} from "@/lib/square/config";
import { driverHasSquareConnected } from "@/lib/square/driver-tokens";

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const driver = await prisma.driver.findUnique({
    where: { id: session.driverId },
    select: {
      squareMerchantId: true,
      squareLocationId: true,
      squareRefreshTokenEnc: true,
      squareConnectedAt: true,
    },
  });

  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  return NextResponse.json({
    configured: isSquareConfigured(),
    connected: driverHasSquareConnected(driver),
    merchantId: driver.squareMerchantId,
    locationId: driver.squareLocationId,
    connectedAt: driver.squareConnectedAt,
    environment: squareEnvironment(),
    oauthHost: squareOAuthAuthorizeUrl().replace("/oauth2/authorize", ""),
    credentialsMatchEnvironment: squareCredentialsMatchEnvironment(),
    credentialMismatch: squareCredentialMismatchMessage(),
    applicationId: squareApplicationIdDiagnostics(),
    applicationSecret: squareApplicationSecretDiagnostics(),
    secretMismatch: squareApplicationSecretMismatchMessage(),
    setupHints: squareSetupHints(),
  });
}
