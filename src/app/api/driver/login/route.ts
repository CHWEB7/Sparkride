import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createDriverSession, setDriverCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: { email: parsed.data.email },
    });

    if (!driver || !(await bcrypt.compare(parsed.data.password, driver.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createDriverSession({
      driverId: driver.id,
      email: driver.email,
      name: driver.name,
    });

    await setDriverCookie(token);

    return NextResponse.json({ name: driver.name });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
