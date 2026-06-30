import { BookPageContent } from "@/components/BookPageContent";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

export default async function BookPage() {
  const user = await getCustomerUserFromCookies();
  const profile = user ? await ensureCustomer(user) : null;

  return <BookPageContent profile={profile} />;
}
