import type { Driver } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/token-crypto";
import { refreshSquareAccessToken } from "./oauth";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function driverHasSquareConnected(driver: Pick<Driver, "squareRefreshTokenEnc" | "squareLocationId">): boolean {
  return Boolean(driver.squareRefreshTokenEnc && driver.squareLocationId);
}

export async function getDriverAccessToken(
  driverId: string
): Promise<{ ok: true; accessToken: string; locationId: string } | { ok: false; error: string }> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver?.squareRefreshTokenEnc || !driver.squareLocationId) {
    return { ok: false, error: "Driver has not connected Square" };
  }

  const needsRefresh =
    !driver.squareAccessTokenEnc ||
    !driver.squareTokenExpiresAt ||
    driver.squareTokenExpiresAt.getTime() - Date.now() < TOKEN_REFRESH_BUFFER_MS;

  if (!needsRefresh && driver.squareAccessTokenEnc) {
    return {
      ok: true,
      accessToken: decryptSecret(driver.squareAccessTokenEnc),
      locationId: driver.squareLocationId,
    };
  }

  const refreshToken = decryptSecret(driver.squareRefreshTokenEnc);
  const refreshed = await refreshSquareAccessToken(refreshToken);
  if (!refreshed.ok) {
    return refreshed;
  }

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      squareAccessTokenEnc: encryptSecret(refreshed.accessToken),
      squareRefreshTokenEnc: encryptSecret(refreshed.refreshToken),
      squareTokenExpiresAt: refreshed.expiresAt,
    },
  });

  return {
    ok: true,
    accessToken: refreshed.accessToken,
    locationId: driver.squareLocationId,
  };
}

export async function saveDriverSquareTokens(
  driverId: string,
  data: {
    merchantId: string;
    locationId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }
): Promise<void> {
  await prisma.driver.update({
    where: { id: driverId },
    data: {
      squareMerchantId: data.merchantId,
      squareLocationId: data.locationId,
      squareAccessTokenEnc: encryptSecret(data.accessToken),
      squareRefreshTokenEnc: encryptSecret(data.refreshToken),
      squareTokenExpiresAt: data.expiresAt,
      squareConnectedAt: new Date(),
    },
  });
}
