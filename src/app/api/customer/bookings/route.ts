import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders }
    );
  }

  const customer = await ensureCustomer(user);
  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { pickupDate: "desc" },
  });

  return NextResponse.json(bookings, { headers: corsHeaders });
}
