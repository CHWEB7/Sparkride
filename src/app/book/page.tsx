import { redirect } from "next/navigation";
import { BookPageContent } from "@/components/BookPageContent";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

export default async function BookPage() {
  const user = await getCustomerUserFromCookies();
  if (!user) redirect("/login?redirect=/book");

  const profile = await ensureCustomer(user);

  return <BookPageContent profile={profile} />;
}
