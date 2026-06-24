# Square payments (hosted checkout)

Sparkride uses **Square Connect** so each driver receives card payments on their own Square merchant account. Card data is collected only on Square’s hosted checkout — Sparkride never stores card numbers.

## 1. Create a Square Developer application

1. Sign in at [developer.squareup.com](https://developer.squareup.com).
2. Create an application and enable **Square Connect (OAuth)**.
3. **Toggle Sandbox** at the top of the dashboard.
4. Copy credentials from the correct tabs:

| Vercel variable | Square Dashboard location | Prefix (sandbox) |
|-----------------|---------------------------|------------------|
| `SQUARE_APPLICATION_ID` | **Credentials** tab → Application ID | `sandbox-sq0idp-` or `sandbox-sq0idb-` |
| `SQUARE_APPLICATION_SECRET` | **OAuth** tab → Application secret | `sandbox-sq0csp-` or `sandbox-sq0csb-` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | **Webhooks** tab | (varies) |

**Critical:** Do **not** put the **Sandbox access token** (Credentials tab) into `SQUARE_APPLICATION_SECRET`. That token is for direct API calls, not OAuth. Using it causes `Not Authorized` on the token exchange step.

To view or rotate the Application secret: Developer Dashboard → your app → **OAuth** → Application secret.

## 2. Register OAuth redirect URL

In the Square Developer Dashboard → your app → **OAuth**:

1. Set **Redirect URL** to exactly (no trailing slash):

   `https://sparkride-umber.vercel.app/api/square/oauth/callback`

2. Save. The `redirect_uri` in the authorize request must match **byte-for-byte**.

| Environment | OAuth base URL | Application ID prefix |
|-------------|----------------|------------------------|
| Sandbox | `https://connect.squareupsandbox.com/oauth2/authorize` | `sandbox-sq0idp-...` |
| Production | `https://connect.squareup.com/oauth2/authorize` | `sq0idp-...` |

**Common failure:** `SQUARE_ENVIRONMENT=sandbox` but `SQUARE_APPLICATION_ID` is a production ID (`sq0idp-...` without `sandbox-`). Square then shows “unable to find client” or the page fails to load. Use the **Sandbox** credentials from the Developer Dashboard when testing.

### Sandbox testing (required)

Square Sandbox OAuth does **not** work like production:

1. In [developer.squareup.com/apps](https://developer.squareup.com/apps), open your app
2. Under **Sandbox test accounts**, click **Open** on a test seller account (opens Sandbox Seller Dashboard)
3. Keep that tab logged in
4. In another tab, on Sparkride driver dashboard, click **Connect Square**

Without step 2–3, the Square authorize page often errors or redirects incorrectly.

## 3. Register webhook subscription

In Square Developer Dashboard → Webhooks:

| Field | Value |
|-------|--------|
| Notification URL | `https://sparkride-umber.vercel.app/api/webhooks/square` |
| API version | Match `SQUARE_API_VERSION` in code (currently `2024-11-20`) |
| Events | `payment.created`, `payment.updated` |

Use the **same notification URL string** in the dashboard as in production — the signature is computed from that exact URL.

## 4. Environment variables

Add to Vercel (and `.env` locally):

```env
SQUARE_APPLICATION_ID=""
SQUARE_APPLICATION_SECRET=""
SQUARE_WEBHOOK_SIGNATURE_KEY=""
SQUARE_ENVIRONMENT="sandbox"
SQUARE_OAUTH_STATE_SECRET="long-random-string"
SQUARE_TOKEN_ENCRYPTION_KEY="long-random-string"
```

- `SQUARE_ENVIRONMENT`: `sandbox` or `production`
- `SQUARE_OAUTH_STATE_SECRET`: CSRF protection for OAuth (can reuse a long random string)
- `SQUARE_TOKEN_ENCRYPTION_KEY`: encrypts driver OAuth tokens at rest (required in production)

## 5. Driver setup

1. Driver signs in at `/driver/login` and completes MFA.
2. On **Settings**, click **Connect Square** and approve OAuth in Square.
3. When the driver confirms a booking, Sparkride creates a **hosted payment link** for the full fare.
4. The customer receives the link by email and on `/booking/[reference]`.

**Required OAuth scopes** (requested automatically): `MERCHANT_PROFILE_READ`, `PAYMENTS_READ`, `PAYMENTS_WRITE`, `ORDERS_READ`, `ORDERS_WRITE`.

If payment links fail with `ORDERS_READ` or `INSUFFICIENT_SCOPES`, the driver must **connect Square again** in Settings — existing tokens do not pick up new scopes until re-authorization.

## 6. Going live

1. Switch `SQUARE_ENVIRONMENT=production`.
2. Use production Application ID, secret, and webhook signature key.
3. Re-register OAuth redirect and webhook URLs for production.
4. Each driver reconnects Square on their **live** merchant account.

## Liability note

- Sparkride is **not** the payment processor.
- Payments are processed by **Square** to the **driver’s merchant account**.
- Refunds and chargebacks are handled in Square by the driver.
