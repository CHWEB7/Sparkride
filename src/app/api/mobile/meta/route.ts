import { NextResponse } from "next/server";
import { AIRPORTS, VEHICLE_PRICES } from "@/lib/airports";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      airports: AIRPORTS,
      vehiclePrices: VEHICLE_PRICES,
      vehicleTypes: [
        { value: "SALOON", label: "Saloon", desc: "Up to 3 passengers" },
        { value: "ESTATE", label: "Estate", desc: "Extra luggage space" },
        { value: "MPV", label: "MPV", desc: "Up to 6 passengers" },
        { value: "EXECUTIVE", label: "Executive", desc: "Premium comfort" },
      ],
      statuses: ["PENDING", "CONFIRMED", "EN_ROUTE", "COMPLETED", "CANCELLED"],
    },
    { headers: corsHeaders }
  );
}
