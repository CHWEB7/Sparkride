import { Suspense } from "react";
import { DriverSquareConnect } from "@/components/driver/DriverSquareConnect";

export default function DriverIntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect payment providers to collect fares online.
        </p>
      </div>

      <Suspense fallback={null}>
        <DriverSquareConnect />
      </Suspense>
    </div>
  );
}
