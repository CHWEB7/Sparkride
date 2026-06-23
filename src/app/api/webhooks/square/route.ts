import { NextRequest, NextResponse } from "next/server";
import { markBookingPaidByReference } from "@/lib/booking-confirmation";
import { squareWebhookUrl } from "@/lib/square/config";
import { verifySquareWebhookSignature } from "@/lib/square/oauth";

export const runtime = "nodejs";

type SquareWebhookEvent = {
  type?: string;
  data?: {
    type?: string;
    object?: {
      payment?: {
        id?: string;
        status?: string;
        reference_id?: string;
      };
    };
  };
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const notificationUrl = squareWebhookUrl();

  if (!verifySquareWebhookSignature(signature, notificationUrl, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: SquareWebhookEvent;
  try {
    event = JSON.parse(body) as SquareWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "payment.updated" || event.type === "payment.created") {
    const payment = event.data?.object?.payment;
    if (
      payment?.status === "COMPLETED" &&
      payment.reference_id &&
      payment.id
    ) {
      await markBookingPaidByReference(payment.reference_id, payment.id);
    }
  }

  return NextResponse.json({ received: true });
}
