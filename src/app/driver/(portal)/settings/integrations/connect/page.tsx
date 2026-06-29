import { redirect } from "next/navigation";
import { SquareConnectGuide } from "@/components/driver/SquareConnectGuide";
import { getDriverSession } from "@/lib/driver-auth";
import { getSquareSetupDiagnostics } from "@/lib/square/setup-diagnostics";

type ConnectPageProps = {
  searchParams: Promise<{ reconnect?: string }>;
};

export default async function SquareConnectPage({ searchParams }: ConnectPageProps) {
  const session = await getDriverSession();
  if (!session) redirect("/driver/login?redirect=/driver/settings/integrations/connect");

  const params = await searchParams;
  const reconnect = params.reconnect === "1";
  const diagnostics = getSquareSetupDiagnostics();

  return <SquareConnectGuide diagnostics={diagnostics} reconnect={reconnect} />;
}
