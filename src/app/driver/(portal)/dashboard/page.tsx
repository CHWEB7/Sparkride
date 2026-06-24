import { prisma } from "@/lib/prisma";
import { getDriverSession } from "@/lib/driver-auth";
import { driverBookingsFilter, isTestDriver } from "@/lib/driver-access";
import { DriverPerformanceDashboard } from "@/components/driver/DriverPerformanceDashboard";

export default async function DriverDashboardPage() {
  const session = await getDriverSession();
  if (!session) return null;

  let bookings: Array<{
    status: string;
    pickupDate: Date;
    estimatedPrice: number | null;
    paymentStatus: string;
  }> = [];

  try {
    bookings = await prisma.booking.findMany({
      where: driverBookingsFilter(session),
      select: {
        status: true,
        pickupDate: true,
        estimatedPrice: true,
        paymentStatus: true,
      },
      orderBy: { pickupDate: "desc" },
    });
  } catch (error) {
    console.error("Driver dashboard stats query failed:", error);
  }

  const scopeLabel = isTestDriver(session.email)
    ? "All bookings (test account)"
    : "Your assigned bookings";

  return (
    <div className="h-full min-h-0">
      <DriverPerformanceDashboard
        bookings={JSON.parse(JSON.stringify(bookings))}
        scopeLabel={scopeLabel}
      />
    </div>
  );
}
