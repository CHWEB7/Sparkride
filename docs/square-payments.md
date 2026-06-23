# Square payments (hosted checkout)

Sparkride uses **Square Connect** so each driver receives card payments on their own Square merchant account. Card data is collected only on Square’s hosted checkout — Sparkride never stores card numbers.

## 1. Create a Square Developer application

1. Sign in at [developer.squareup.com](https://developer.squareup.com).
2. Create an application and enable **Square Connect (OAuth)**.
3. Copy **Sandbox** credentials first:
   - Application ID → `SQUARE_APPLICATION_ID`
   - Application secret → `SQUARE_APPLICATION_SECRET`
   - Webhook signature key → `SQUARE_WEBHOOK_SIGNATURE_KEY`

## 2. Register OAuth redirect URL

In the Square Developer Dashboard → OAuth:

| Environment | Redirect URL |
|-------------|--------------|
| Sandbox / Production | `https://sparkride-umber.vercel.app/api/square/oauth/callback` |
| Local dev | `http://localhost:3000/api/square/oauth/callback` |

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
2. On the dashboard, click **Connect Square** and approve OAuth in Square.
3. When the driver confirms a booking, Sparkride creates a **hosted payment link** for the full fare.
4. The customer receives the link by email and on `/booking/[reference]`.

## 6. Going live

1. Switch `SQUARE_ENVIRONMENT=production`.
2. Use production Application ID, secret, and webhook signature key.
3. Re-register OAuth redirect and webhook URLs for production.
4. Each driver reconnects Square on their **live** merchant account.

## Liability note

- Sparkride is **not** the payment processor.
- Payments are processed by **Square** to the **driver’s merchant account**.
- Refunds and chargebacks are handled in Square by the driver.
