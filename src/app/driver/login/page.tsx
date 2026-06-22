import { Suspense } from "react";
import { DriverLoginForm } from "@/components/driver/DriverLoginForm";

export default function DriverLoginPage() {
  return (
    <Suspense>
      <DriverLoginForm />
    </Suspense>
  );
}
