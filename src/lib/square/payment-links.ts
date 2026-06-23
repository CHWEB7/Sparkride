import { randomUUID } from "crypto";
import { getSiteUrl } from "@/lib/site-url";
import { squareRequest } from "./client";

type PaymentLinkResponse = {
  payment_link?: {
    id?: string;
    url?: string;
    long_url?: string;
  };
};

export async function createSquarePaymentLink(input: {
  accessToken: string;
  locationId: string;
  reference: string;
  amountPence: number;
  description: string;
}): Promise<{ ok: true; id: string; url: string } | { ok: false; error: string }> {
  const redirectUrl = `${getSiteUrl()}/booking/${encodeURIComponent(input.reference)}?paid=1`;

  const result = await squareRequest<PaymentLinkResponse>({
    accessToken: input.accessToken,
    method: "POST",
    path: "/v2/online-checkout/payment-links",
    idempotencyKey: randomUUID(),
    body: {
      quick_pay: {
        name: input.description,
        price_money: {
          amount: input.amountPence,
          currency: "GBP",
        },
        location_id: input.locationId,
        reference_id: input.reference,
      },
      checkout_options: {
        redirect_url: redirectUrl,
        ask_for_shipping_address: false,
      },
      payment_note: `Sparkride booking ${input.reference}`,
    },
  });

  if (!result.ok) return result;

  const link = result.data.payment_link;
  const url = link?.url || link?.long_url;
  if (!link?.id || !url) {
    return { ok: false, error: "Square did not return a payment link URL" };
  }

  return { ok: true, id: link.id, url };
}
