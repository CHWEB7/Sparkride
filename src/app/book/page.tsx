import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookPageContent } from "@/components/BookPageContent";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

export default async function BookPage() {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/book");

  const profile = await ensureCustomer(user);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-white dark:bg-dark">
        <BookPageContent profile={profile} />
      </main>
      <Footer />
    </>
  );
}
