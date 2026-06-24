import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DriverSquareConnect } from "@/components/driver/DriverSquareConnect";
import { getDriverSession } from "@/lib/driver-auth";
import { getDriverSquareStatus } from "@/lib/square/driver-status";

export default async function DriverIntegrationsPage() {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const initialStatus = await getDriverSquareStatus(session.driverId);

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
        <DriverSquareConnect initialStatus={initialStatus} />
      </Suspense>
    </div>
  );
}
