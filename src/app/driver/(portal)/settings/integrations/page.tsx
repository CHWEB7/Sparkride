import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DriverSquareConnect } from "@/components/driver/DriverSquareConnect";
import { getDriverSession } from "@/lib/driver-auth";
import { getDriverSquareStatus } from "@/lib/square/driver-status";
import { getSquareSetupDiagnostics } from "@/lib/square/setup-diagnostics";

export default async function DriverIntegrationsPage() {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const [initialStatus, setupDiagnostics] = await Promise.all([
    getDriverSquareStatus(session.driverId),
    Promise.resolve(getSquareSetupDiagnostics()),
  ]);

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

      {!setupDiagnostics.readyToConnect && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Square setup needs attention before connecting</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {setupDiagnostics.issues.slice(0, 4).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <Suspense fallback={null}>
        <DriverSquareConnect initialStatus={initialStatus} />
      </Suspense>
    </div>
  );
}
