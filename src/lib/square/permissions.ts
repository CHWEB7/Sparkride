import { squareRequest } from "./client";

/** Confirms the driver's token can use Square Checkout (payment links). */
export async function verifySquareCheckoutPermissions(
  accessToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await squareRequest<{ payment_links?: unknown[] }>({
    accessToken,
    path: "/v2/online-checkout/payment-links?limit=1",
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export function isSquareScopeError(error: string): boolean {
  return (
    error.includes("INSUFFICIENT_SCOPES") ||
    error.includes("ORDERS_READ") ||
    error.includes("ORDERS_WRITE")
  );
}

export function squareScopeErrorMessage(): string {
  return "Your Square connection is missing payment permissions (Orders access). Tap Reconnect Square below and approve all requested permissions.";
}
