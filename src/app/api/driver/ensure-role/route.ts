import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DRIVER_ROLE } from "@/lib/driver-auth";

/**
 * After password sign-in, patches app_metadata.role = driver when the email
 * exists in the Driver table. Avoids manual Supabase dashboard edits.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (user.app_metadata?.role === DRIVER_ROLE) {
    return NextResponse.json({ ok: true, role: DRIVER_ROLE, already: true });
  }

  const driver = await prisma.driver.findUnique({
    where: { email: user.email.toLowerCase() },
  });

  if (!driver) {
    return NextResponse.json(
      { error: "No driver account exists for this email" },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      role: DRIVER_ROLE,
    },
  });

  if (updateError) {
    console.error("ensure-driver-role failed:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (driver.authUserId !== user.id) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { authUserId: user.id },
    });
  }

  await supabase.auth.refreshSession();

  return NextResponse.json({ ok: true, role: DRIVER_ROLE });
}
