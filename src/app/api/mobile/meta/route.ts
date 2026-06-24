import { NextResponse } from "next/server";
import { AIRPORTS, VEHICLE_PRICES } from "@/lib/airports";
import { getCombinedPorts } from "@/lib/hubs";
import { CRUISE_TERMINALS } from "@/lib/cruise-terminals";
import { FERRY_PORTS } from "@/lib/ferry-ports";

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
      ferryPorts: FERRY_PORTS,
      cruiseTerminals: CRUISE_TERMINALS,
      ports: getCombinedPorts(),
      vehiclePrices: VEHICLE_PRICES,
      vehicleTypes: [
        { value: "SALOON", label: "Saloon", desc: "Up to 3 passengers" },
        { value: "ESTATE", label: "Estate", desc: "Extra luggage space" },
        { value: "MPV", label: "MPV", desc: "Up to 6 passengers" },
        { value: "EXECUTIVE", label: "Executive", desc: "Premium comfort" },
      ],
      statuses: ["PENDING", "CONFIRMED", "PAID", "COMPLETED", "CANCELLED"],
    },
    { headers: corsHeaders }
  );
}
