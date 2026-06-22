import { Suspense } from "react";
import { CustomerVerify2faForm } from "@/components/customer/CustomerVerify2faForm";

export default function Verify2faPage() {
  return (
    <Suspense>
      <CustomerVerify2faForm />
    </Suspense>
  );
}
