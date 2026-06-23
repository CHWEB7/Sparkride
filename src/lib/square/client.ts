import { SQUARE_API_VERSION, squareConnectHost } from "./config";

type SquareRequestOptions = {
  accessToken: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  idempotencyKey?: string;
};

export async function squareRequest<T>({
  accessToken,
  method = "GET",
  path,
  body,
  idempotencyKey,
}: SquareRequestOptions): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Square-Version": SQUARE_API_VERSION,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const res = await fetch(`${squareConnectHost()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    errors?: Array<{ detail?: string; code?: string }>;
  };

  if (!res.ok) {
    const message =
      data.errors?.map((e) => e.detail || e.code).filter(Boolean).join("; ") ||
      `Square API error (${res.status})`;
    return { ok: false, error: message };
  }

  return { ok: true, data };
}
