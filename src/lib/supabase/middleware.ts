import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  MFA_COOKIE_NAME,
  signedInTodayLondon,
  verifyMfaCookie,
} from "@/lib/daily-mfa-edge";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function redirectToLogin(request: NextRequest, error?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

function redirectToVerify2fa(request: NextRequest) {
  const url = request.nextUrl.clone();
  const redirect = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/verify-2fa";
  url.search = "";
  url.searchParams.set("redirect", redirect);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
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
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isVerify2fa = pathname === "/verify-2fa";
  const isProtected =
    pathname.startsWith("/book") ||
    pathname.startsWith("/my-bookings") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/booking/");

  if (!user && (isProtected || isVerify2fa)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", isVerify2fa ? "/book" : pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const mfaCookie = await verifyMfaCookie(
      request.cookies.get(MFA_COOKIE_NAME)?.value,
      process.env.JWT_SECRET
    );
    const mfaVerified = mfaCookie?.userId === user.id;

    if (!mfaVerified) {
      if (!signedInTodayLondon(user)) {
        await supabase.auth.signOut();
        const res = redirectToLogin(request, "session_expired");
        res.cookies.set(MFA_COOKIE_NAME, "", { path: "/", maxAge: 0 });
        return res;
      }

      if (isProtected) {
        return redirectToVerify2fa(request);
      }

      if (isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/verify-2fa";
        url.searchParams.set(
          "redirect",
          request.nextUrl.searchParams.get("redirect") || "/book"
        );
        return NextResponse.redirect(url);
      }
    } else {
      if (isVerify2fa || isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = request.nextUrl.searchParams.get("redirect") || "/book";
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
