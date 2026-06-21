import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { generateReference } from "@/lib/auth";
import { getAirport, estimatePrice } from "@/lib/airports";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.errors[0]?.message || "Invalid input" }, 400);
    }

    const data = parsed.data;
    const isAirport = data.serviceType === "AIRPORT_TRANSFER";
    const airport = isAirport && data.airportCode ? getAirport(data.airportCode) : null;

    if (isAirport && !airport) {
      return json({ error: "Invalid airport" }, 400);
    }

    const pickupDate = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const returnPickupDate =
      data.journeyType === "RETURN" && data.returnDate && data.returnTime
        ? new Date(`${data.returnDate}T${data.returnTime}:00`)
        : null;

    const booking = await prisma.booking.create({
      data: {
        reference: generateReference(),
        serviceType: data.serviceType,
        journeyType: data.journeyType,
        tripType: data.tripType,
        airportCode: airport?.code ?? null,
        airportName: airport?.name ?? null,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        pickupDate,
        returnPickupDate,
        passengers: data.passengers,
        luggage: data.luggage,
        vehicleType: data.vehicleType,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        flightNumber: data.flightNumber || null,
        returnFlightNumber: data.returnFlightNumber || null,
        notes: data.notes || null,
        estimatedPrice: estimatePrice(
          data.vehicleType,
          data.tripType,
          data.journeyType,
          data.serviceType
        ),
      },
    });

    return json({
      id: booking.id,
      reference: booking.reference,
      estimatedPrice: booking.estimatedPrice,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return json({ error: "Failed to create booking" }, 500);
  }
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return json({ error: "Reference required" }, 400);
  }

  const booking = await prisma.booking.findUnique({ where: { reference: ref } });
  if (!booking) {
    return json({ error: "Booking not found" }, 404);
  }

  return json(booking);
}
