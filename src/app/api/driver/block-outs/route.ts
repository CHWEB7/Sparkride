import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireDriverSessionWithMfa } from "@/lib/driver-auth";
import { parseLondonDateInput, toLondonDateString } from "@/lib/driver-availability";

const createSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    label: z.string().max(120).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export async function GET() {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blockOuts = await prisma.driverBlockOut.findMany({
      where: { driverId: session.driverId },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(
      blockOuts.map((row) => ({
        id: row.id,
        startDate: toLondonDateString(row.startDate),
        endDate: toLondonDateString(row.endDate),
        label: row.label,
      }))
    );
  } catch (error) {
    console.error("Driver block-outs list failed:", error);
    return NextResponse.json(
      {
        error:
          "Block-out dates are not available yet. Run prisma/sql/add-driver-blockouts.sql in Supabase.",
      },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.driverBlockOut.create({
      data: {
        driverId: session.driverId,
        startDate: parseLondonDateInput(parsed.data.startDate),
        endDate: parseLondonDateInput(parsed.data.endDate),
        label: parsed.data.label?.trim() || null,
      },
    });

    return NextResponse.json({
      id: created.id,
      startDate: toLondonDateString(created.startDate),
      endDate: toLondonDateString(created.endDate),
      label: created.label,
    });
  } catch (error) {
    console.error("Driver block-out create failed:", error);
    return NextResponse.json({ error: "Failed to save block-out dates" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireDriverSessionWithMfa();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing block-out id" }, { status: 400 });
  }

  const result = await prisma.driverBlockOut.deleteMany({
    where: { id, driverId: session.driverId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Block-out not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
