import { NextRequest, NextResponse } from "next/server";
import { completeBookingPayment } from "@/lib/booking-confirmation";
import { squareEnvironment, squareWebhookUrl } from "@/lib/square/config";
import { verifySquareWebhookSignature } from "@/lib/square/oauth";
import { syncBookingPaymentFromSquare } from "@/lib/square/payment-sync";

export const runtime = "nodejs";

type SquarePaymentPayload = {
  id?: string;
  status?: string;
  reference_id?: string;
};

type SquareWebhookEvent = {
  type?: string;
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
    if (payment?.status === "COMPLETED" && payment.id) {
      if (payment.reference_id) {
        await completeBookingPayment(payment.reference_id, payment.id);
      } else {
        console.warn("Square payment completed without reference_id:", payment.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
