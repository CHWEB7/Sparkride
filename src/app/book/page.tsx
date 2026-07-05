import { redirect } from "next/navigation";
import { BookPageContent } from "@/components/BookPageContent";
import { getCustomerUserFromCookies } from "@/lib/customer-auth";
import { ensureCustomer } from "@/lib/customer";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const query = await searchParams;
  const fromAi = query.from === "ai";
  const user = await getCustomerUserFromCookies();

  if (!user && !fromAi) {
    redirect("/login?redirect=/book");
  }

  const profile = user ? await ensureCustomer(user) : null;

  return <BookPageContent profile={profile} />;
}
