import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDriverSession } from "@/lib/auth";
import { driverBookingsFilter, isTestDriver } from "@/lib/driver-access";
import { DriverDashboard } from "@/components/driver/DriverDashboard";
import { Plane } from "lucide-react";
import { LogoutButton } from "@/components/driver/LogoutButton";

export default async function DriverDashboardPage() {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const bookings = await prisma.booking.findMany({
    where: driverBookingsFilter(session),
    orderBy: { pickupDate: "asc" },
  });

  const scopeLabel = isTestDriver(session.email)
    ? "All bookings (test account)"
    : "Your assigned bookings";

  return (
    <div className="min-h-screen bg-dark">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Sparkride</span>
          </Link>

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
        <DriverDashboard bookings={JSON.parse(JSON.stringify(bookings))} />
      </main>
    </div>
  );
}
