import { redirect } from "next/navigation";
import {
  driverHasVerifiedTotp,
  driverSessionIsMfaComplete,
} from "@/lib/driver-mfa";
import { getDriverSession } from "@/lib/driver-auth";
import { DriverPortalShell } from "@/components/driver/DriverPortalShell";

export default async function DriverPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login");

  const hasTotp = await driverHasVerifiedTotp(session.authUserId);
  if (!hasTotp) redirect("/driver/enroll");

  const mfaComplete = await driverSessionIsMfaComplete();
  if (!mfaComplete) redirect("/driver/login?mfa=required");

  return <DriverPortalShell driverName={session.name}>{children}</DriverPortalShell>;
}
