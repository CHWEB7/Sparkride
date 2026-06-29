import { NextRequest, NextResponse } from "next/server";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";
import { syncBookingPaymentFromSquare } from "@/lib/square/payment-sync";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const customer = await ensureCustomer(user);
  const booking = await prisma.booking.findUnique({ where: { reference } });

  if (!booking || booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    transactionId?: string;
    orderId?: string;
  };

  const result = await syncBookingPaymentFromSquare(reference, {
    squarePaymentId: body.transactionId ?? req.nextUrl.searchParams.get("transactionId"),
    squareOrderId: body.orderId ?? req.nextUrl.searchParams.get("orderId"),
  });

  return NextResponse.json(result);
}
