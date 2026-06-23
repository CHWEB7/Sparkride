import { Suspense } from "react";
import { DriverEnrollForm } from "@/components/driver/DriverEnrollForm";

export default function DriverEnrollPage() {
  return (
    <Suspense>
      <DriverEnrollForm />
    </Suspense>
  );
}
