import { Suspense } from "react";
import { CustomerSignupForm } from "@/components/customer/CustomerSignupForm";

export default function SignupPage() {
  return (
    <Suspense>
      <CustomerSignupForm />
    </Suspense>
  );
}
