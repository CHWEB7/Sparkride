import { prisma } from "@/lib/prisma";

const REQUIRED_TABLES = [
  "Customer",
  "Driver",
  "Booking",
  "SavedBookingDetails",
  "DriverBlockOut",
  "CustomerMfaSession",
] as const;

const REQUIRED_BOOKING_COLUMNS = [
  "paymentStatus",
  "amountDue",
  "squarePaymentLinkId",
  "squarePaymentLinkUrl",
  "squarePaymentId",
  "paidAt",
] as const;

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${table}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

export type SchemaCheckResult = {
  ok: boolean;
  missingTables: string[];
  missingColumns: string[];
};

export async function checkDatabaseSchema(): Promise<SchemaCheckResult> {
  const missingTables: string[] = [];
  const missingColumns: string[] = [];

  for (const table of REQUIRED_TABLES) {
    if (!(await tableExists(table))) {
      missingTables.push(table);
    }
  }

  if (missingTables.length === 0) {
    for (const column of REQUIRED_BOOKING_COLUMNS) {
      if (!(await columnExists("Booking", column))) {
        missingColumns.push(`Booking.${column}`);
      }
    }
  }

  return {
    ok: missingTables.length === 0 && missingColumns.length === 0,
    missingTables,
    missingColumns,
  };
}
