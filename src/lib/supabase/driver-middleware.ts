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

  if (user && isDriverUser(user)) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = (factors?.totp?.length ?? 0) > 0;
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const mfaComplete = aal?.currentLevel === "aal2";

    if (!hasVerifiedTotp && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/driver/enroll";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (hasVerifiedTotp && !mfaComplete && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/driver/login";
      url.searchParams.set("mfa", "required");
      return NextResponse.redirect(url);
    }

    if (pathname === "/driver/login" && hasVerifiedTotp && mfaComplete) {
      const url = request.nextUrl.clone();
      url.pathname = "/driver/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (pathname === "/driver/enroll" && hasVerifiedTotp && mfaComplete) {
      const url = request.nextUrl.clone();
      url.pathname = "/driver/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (user && !isDriverUser(user) && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/driver/login";
    url.searchParams.set("error", "not_driver");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
