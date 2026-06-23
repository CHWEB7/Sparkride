import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDriverSession } from "@/lib/driver-auth";
import {
  driverHasVerifiedTotp,
  driverSessionIsMfaComplete,
} from "@/lib/driver-mfa";
import { driverBookingsFilter, isTestDriver } from "@/lib/driver-access";
import { DriverDashboard } from "@/components/driver/DriverDashboard";
import { Suspense } from "react";
import { DriverSquareConnect } from "@/components/driver/DriverSquareConnect";
import { DriverChangePassword } from "@/components/driver/DriverChangePassword";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/driver/LogoutButton";

export default async function DriverDashboardPage() {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const hasTotp = await driverHasVerifiedTotp(session.authUserId);
  if (!hasTotp) redirect("/driver/enroll");

  const mfaComplete = await driverSessionIsMfaComplete();
  if (!mfaComplete) redirect("/driver/login?mfa=required");

  let bookings: Awaited<ReturnType<typeof prisma.booking.findMany>> = [];
  let dbError: string | null = null;
  try {
    bookings = await prisma.booking.findMany({
      where: driverBookingsFilter(session),
      orderBy: { pickupDate: "asc" },
    });
  } catch (error) {
    console.error("Driver dashboard bookings query failed:", error);
    dbError =
      "The database needs a one-time update. In Supabase SQL Editor, run the script at prisma/sql/add-payment-columns.sql, then reload this page.";
  }

  const scopeLabel = isTestDriver(session.email)
    ? "All bookings (test account)"
    : "Your assigned bookings";

  return (
    <div className="min-h-screen bg-dark">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo href="/" light size="header" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {session.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
        <p className="text-gray-400 mb-8">{scopeLabel}</p>
        {dbError ? (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100 text-sm leading-relaxed">
            {dbError}
          </div>
        ) : (
          <>
            <Suspense fallback={null}>
              <DriverSquareConnect />
            </Suspense>
            <DriverChangePassword />
            <DriverDashboard bookings={JSON.parse(JSON.stringify(bookings))} />
          </>
        )}
      </main>
    </div>
  );
}
