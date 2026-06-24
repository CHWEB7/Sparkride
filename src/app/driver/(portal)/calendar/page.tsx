import { DriverBookingsCalendar } from "@/components/driver/DriverBookingsCalendar";
import { isTestDriver } from "@/lib/driver-access";
import { getDriverSession } from "@/lib/driver-auth";

export default async function DriverCalendarPage() {
  const session = await getDriverSession();
  if (!session) return null;

  const scopeLabel = isTestDriver(session.email)
    ? "All paid bookings (test account)"
    : "Your paid bookings";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Bookings Calendar
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{scopeLabel}</p>
      </div>

      <DriverBookingsCalendar />
    </div>
  );
}
