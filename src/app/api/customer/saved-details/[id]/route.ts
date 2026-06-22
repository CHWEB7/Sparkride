import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerUserWithDailyMfa } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

const savedDetailsSchema = z.object({
  label: z.string().min(1, "Label is required"),
  serviceType: z.enum(["AIRPORT_TRANSFER", "PRE_BOOKED"]),
  journeyType: z.enum(["SINGLE", "RETURN"]),
  tripType: z.enum(["TO_AIRPORT", "FROM_AIRPORT"]),
  airportCode: z.string().optional().nullable(),
  pickupAddress: z.string().min(3),
  dropoffAddress: z.string().min(3),
  passengers: z.coerce.number().int().min(1).max(8),
  luggage: z.coerce.number().int().min(0).max(10),
  vehicleType: z.enum(["SALOON", "ESTATE", "MPV", "EXECUTIVE"]),
  driverId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const user = await getCustomerUserWithDailyMfa(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const customer = await ensureCustomer(user);
  const existing = await prisma.savedBookingDetails.findFirst({
    where: { id, customerId: customer.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = savedDetailsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const item = await prisma.savedBookingDetails.update({
    where: { id },
    data: {
      label: data.label,
      serviceType: data.serviceType,
      journeyType: data.journeyType,
      tripType: data.tripType,
      airportCode: data.airportCode || null,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      passengers: data.passengers,
      luggage: data.luggage,
      vehicleType: data.vehicleType,
      driverId: data.driverId || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getCustomerUserWithDailyMfa(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const customer = await ensureCustomer(user);
  const existing = await prisma.savedBookingDetails.findFirst({
    where: { id, customerId: customer.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.savedBookingDetails.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
