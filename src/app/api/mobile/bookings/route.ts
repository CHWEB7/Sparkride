import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusSchema } from "@/lib/validation";

/**
 * Temporary mobile API — no authentication yet.
 * Replace with token-based auth before production release.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { pickupDate: "asc" },
    });
    return json(bookings);
  } catch (error) {
    console.error("Mobile bookings GET error:", error);
    return json({ error: "Failed to load bookings" }, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const parsed = statusSchema.safeParse({ status });
    if (!parsed.success || !id) {
      return json({ error: "Invalid input" }, 400);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return json(booking);
  } catch (error) {
    console.error("Mobile bookings PATCH error:", error);
    return json({ error: "Failed to update booking" }, 500);
  }
}
