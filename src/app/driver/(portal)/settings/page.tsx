import { Suspense } from "react";
import { DriverChangePassword } from "@/components/driver/DriverChangePassword";
import { DriverSquareConnect } from "@/components/driver/DriverSquareConnect";
import { DriverBlockOutDates } from "@/components/driver/DriverBlockOutDates";

export default function DriverSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage payments, security, and your availability.
        </p>
      </div>

      <Suspense fallback={null}>
        <DriverSquareConnect theme="light" />
      </Suspense>

      <DriverBlockOutDates />

      <DriverChangePassword theme="light" />
    </div>
  );
}
