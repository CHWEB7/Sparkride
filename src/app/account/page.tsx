import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AccountForm } from "@/components/customer/AccountForm";
import { BackToPortalHub } from "@/components/customer/BackToPortalHub";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

export default async function AccountPage() {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/account");

  const customer = await ensureCustomer(user);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-16 pt-24 dark:bg-dark">
        <SiteContainer className="max-w-lg">
          <BackToPortalHub className="mb-6" />
          <h1 className="text-3xl font-semibold tracking-[-0.02em] dark:text-white">Account</h1>
          <p className="mt-2 text-muted">Update your contact details for bookings</p>
          <div className="mt-8">
            <AccountForm customer={customer} />
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
