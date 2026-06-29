import { NextRequest, NextResponse } from "next/server";
import { squareEnvironment, squareWebhookUrl } from "@/lib/square/config";
import { verifySquareWebhookSignature } from "@/lib/square/oauth";
import { completeBookingFromSquareWebhook } from "@/lib/square/payment-sync";

export const runtime = "nodejs";

type SquarePaymentPayload = {
  id?: string;
  status?: string;
  reference_id?: string;
  order_id?: string;
};

type SquareWebhookEvent = {
  type?: string;
  merchant_id?: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      payment?: SquarePaymentPayload;
    };
  };
};

function extractPayment(event: SquareWebhookEvent): SquarePaymentPayload | null {
  return event.data?.object?.payment ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const notificationUrl = squareWebhookUrl();
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim();

  if (signatureKey) {
    if (!verifySquareWebhookSignature(signature, notificationUrl, body)) {
      console.error("Square webhook signature verification failed for URL:", notificationUrl);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (squareEnvironment() === "sandbox") {
    console.warn("SQUARE_WEBHOOK_SIGNATURE_KEY is not set — processing sandbox webhook without verification");
  } else {
    return NextResponse.json({ error: "Webhook signature key not configured" }, { status: 503 });
  }

  let event: SquareWebhookEvent;
  try {
    event = JSON.parse(body) as SquareWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "payment.updated" || event.type === "payment.created") {
    const payment = extractPayment(event);
    if (payment?.status === "COMPLETED" && payment.id && event.merchant_id) {
      const completed = await completeBookingFromSquareWebhook({
        merchantId: event.merchant_id,
        paymentId: payment.id,
        paymentReferenceId: payment.reference_id,
        orderId: payment.order_id,
      });

      if (!completed) {
        console.warn("Square webhook payment could not be matched to a booking:", {
          paymentId: payment.id,
          merchantId: event.merchant_id,
          orderId: payment.order_id,
          referenceId: payment.reference_id,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
