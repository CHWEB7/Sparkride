import { DriverBlockOutDates } from "@/components/driver/DriverBlockOutDates";

export default function DriverAvailabilityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Availability
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Block out dates when you are not available for bookings.
        </p>
      </div>

      <DriverBlockOutDates />
    </div>
  );
}
