import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  const checks: Record<string, string> = {
    supabaseEnv: isSupabaseConfigured() ? "ok" : "missing",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    return NextResponse.json(
      {
        status: "unhealthy",
        checks,
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    checks,
  });
}
