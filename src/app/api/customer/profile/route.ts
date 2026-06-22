import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerUserFromRequest } from "@/lib/customer-auth";
import { ensureCustomer, updateCustomerProfile } from "@/lib/customer";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});

export async function GET(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await ensureCustomer(user);
  return NextResponse.json(customer);
}

export async function POST(req: NextRequest) {
  const user = await getCustomerUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await ensureCustomer(user);
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest) {
  const user = await getCustomerUserWithDailyMfa(req);
  if (!user) {
    const authed = await getCustomerUserFromRequest(req);
    if (authed) {
      return NextResponse.json({ error: "Email verification required", code: "mfa_required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  await ensureCustomer(user);
  const customer = await updateCustomerProfile(user.id, parsed.data);

  const supabase = await createClient();
  await supabase.auth.updateUser({
    data: {
      name: parsed.data.name ?? customer.name,
      phone: parsed.data.phone ?? customer.phone,
    },
  });

  return NextResponse.json(customer);
}
