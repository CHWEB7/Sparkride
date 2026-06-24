import { prisma } from "@/lib/prisma";
import { getDriverSession } from "@/lib/driver-auth";
import { driverBookingsFilter, isTestDriver } from "@/lib/driver-access";
import { DriverBookingsTable } from "@/components/driver/DriverBookingsTable";

export default async function DriverBookingsPage() {
  const session = await getDriverSession();
  if (!session) return null;

  let bookings: Awaited<ReturnType<typeof prisma.booking.findMany>> = [];
  let dbError: string | null = null;
  try {
    bookings = await prisma.booking.findMany({
      where: driverBookingsFilter(session),
      orderBy: { pickupDate: "asc" },
    });
  } catch (error) {
    console.error("Driver bookings query failed:", error);
    dbError =
      "The database needs a one-time update. In Supabase SQL Editor, run prisma/sql/add-payment-columns.sql, then reload this page.";
  }

  const scopeLabel = isTestDriver(session.email)
    ? "All bookings (test account)"
    : "Your assigned bookings";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Bookings Manager
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{scopeLabel}</p>
      </div>

      {dbError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {dbError}
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <DriverBookingsTable bookings={JSON.parse(JSON.stringify(bookings))} fullHeight />
        </div>
      )}
    </div>
  );
}
