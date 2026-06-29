import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkDatabaseSchema } from "@/lib/db-schema";

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

  let schema: Awaited<ReturnType<typeof checkDatabaseSchema>> | undefined;
  try {
    schema = await checkDatabaseSchema();
    checks.schema = schema.ok ? "ok" : "out_of_date";
  } catch (error) {
    checks.schema = "error";
    return NextResponse.json(
      {
        status: "degraded",
        checks,
        error: error instanceof Error ? error.message : "Schema check failed",
      },
      { status: 503 }
    );
  }

  if (!schema.ok) {
    return NextResponse.json(
      {
        status: "degraded",
        checks,
        schema,
        hint: "Run prisma/sql/ensure-production-schema.sql in the Supabase SQL Editor.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    checks,
    schema,
  });
}
