import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/customer/CustomerLoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <CustomerLoginForm />
    </Suspense>
  );
}
