import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDriverAvailableForBooking } from "@/lib/driver-availability";
import { bookingSchema } from "@/lib/validation";
import { generateReference } from "@/lib/auth";
import { getHub, formatHubLabel, isHubTransfer, normalizeServiceType } from "@/lib/hubs";
import { estimatePrice } from "@/lib/airports";
import { getCustomerUserFromRequest, getCustomerUserWithDailyMfa } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCustomerUserWithDailyMfa(req);
    if (!user) {
      const authed = await getCustomerUserFromRequest(req);
      if (authed) {
        return json({ error: "Email verification required", code: "mfa_required" }, 403);
      }
      return json({ error: "Sign in required to create a booking" }, 401);
    }

    const customer = await ensureCustomer(user);
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return json({ error: parsed.error.errors[0]?.message || "Invalid input" }, 400);
    }

    const data = parsed.data;
    const storedServiceType = normalizeServiceType(data.serviceType, data.airportCode);
    const hub =
      isHubTransfer(data.serviceType) && data.airportCode
        ? getHub(data.airportCode, data.serviceType)
        : null;

    if (isHubTransfer(data.serviceType) && !hub) {
      return json({ error: "Invalid destination" }, 400);
    }

    const pickupDate = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const returnPickupDate =
      data.journeyType === "RETURN" && data.returnDate && data.returnTime
        ? new Date(`${data.returnDate}T${data.returnTime}:00`)
        : null;

    const customerName = customer.name || data.customerName;
    const customerPhone = customer.phone || data.customerPhone;

    if (!customerName?.trim()) {
      return json({ error: "Please add your name in Account settings" }, 400);
    }
    if (!customerPhone?.trim()) {
      return json({ error: "Please add your phone number in Account settings" }, 400);
    }

    const driver = await prisma.driver.findFirst({
      where: { id: data.driverId, bookable: true },
    });
    if (!driver) {
      return json({ error: "Please select a valid driver" }, 400);
    }

    const driverAvailable = await isDriverAvailableForBooking(
      driver.id,
      pickupDate,
      returnPickupDate
    );
    if (!driverAvailable) {
      return json(
        { error: "The selected driver is not available on your travel dates. Please choose another driver." },
        400
      );
    }

    const booking = await prisma.booking.create({
      data: {
        reference: generateReference(),
        customerId: customer.id,
        driverId: driver.id,
        serviceType: storedServiceType,
        journeyType: data.journeyType,
        tripType: data.tripType,
        airportCode: hub?.code ?? null,
        airportName: hub?.name ?? null,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        pickupDate,
        returnPickupDate,
        passengers: data.passengers,
        luggage: data.luggage,
        vehicleType: driver.vehicleType,
        customerName,
        customerEmail: customer.email,
        customerPhone,
        flightNumber: data.flightNumber || null,
        returnFlightNumber: data.returnFlightNumber || null,
        notes: data.notes || null,
        estimatedPrice: estimatePrice(
          driver.vehicleType,
          data.tripType,
          data.journeyType,
          data.serviceType,
          data.airportCode
        ),
      },
    });

    if (data.saveDetails) {
      const label =
        data.savedDetailsLabel?.trim() ||
        `${data.pickupAddress.slice(0, 24)}…`;
      await prisma.savedBookingDetails.create({
        data: {
          customerId: customer.id,
          label,
          serviceType: storedServiceType,
          journeyType: data.journeyType,
          tripType: data.tripType,
          airportCode: hub?.code ?? null,
          pickupAddress: data.pickupAddress,
          dropoffAddress: data.dropoffAddress,
          passengers: data.passengers,
          luggage: data.luggage,
          vehicleType: driver.vehicleType,
          driverId: driver.id,
          notes: data.notes || null,
        },
      });
    }

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
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return json({ error: "Reference required" }, 400);
  }

  const customer = await ensureCustomer(user);
  const booking = await prisma.booking.findUnique({ where: { reference: ref } });

  if (!booking || booking.customerId !== customer.id) {
    return json({ error: "Booking not found" }, 404);
  }

  return json(booking);
}
