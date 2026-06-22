import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDriverUser } from "@/lib/driver-auth-edge";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const DRIVER_PUBLIC_PATHS = ["/driver/login", "/driver/enroll"];

export async function updateDriverSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        experimental: { passkey: true },
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = DRIVER_PUBLIC_PATHS.some((path) => pathname === path);
  const isProtected = pathname.startsWith("/driver/") && !isPublic;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/driver/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isDriverUser(user) && pathname === "/driver/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/driver/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && !isDriverUser(user) && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/driver/login";
    url.searchParams.set("error", "not_driver");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
