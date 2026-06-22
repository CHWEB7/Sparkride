import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export async function ensureCustomer(user: User): Promise<CustomerProfile> {
  const email = user.email;
  if (!email) {
    throw new Error("User email is required");
  }

  const meta = user.user_metadata ?? {};
  const name = typeof meta.name === "string" ? meta.name : null;
  const phone = typeof meta.phone === "string" ? meta.phone : null;

  return prisma.customer.upsert({
    where: { id: user.id },
    update: { email, name: name ?? undefined, phone: phone ?? undefined },
    create: { id: user.id, email, name, phone },
    select: { id: true, email: true, name: true, phone: true },
  });
}

export async function updateCustomerProfile(
  userId: string,
  data: { name?: string; phone?: string }
) {
  return prisma.customer.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, phone: true },
  });
}
