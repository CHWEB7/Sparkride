"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, User, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/book",
    label: "Portal hub",
    icon: Home,
    match: (pathname) => pathname === "/book" || pathname.startsWith("/book/"),
  },
  {
    href: "/my-bookings",
    label: "My bookings",
    icon: CalendarDays,
    match: (pathname) =>
      pathname === "/my-bookings" ||
      pathname.startsWith("/my-bookings/") ||
      pathname.startsWith("/booking/"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (pathname) => pathname === "/account" || pathname.startsWith("/account/"),
  },
];

function bookingReferenceFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/booking\/([^/]+)/);
  return match?.[1] ?? null;
}

export function CustomerBookingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bookingReference = bookingReferenceFromPath(pathname);

  function handlePortalHubClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/book") {
      event.preventDefault();
      window.location.assign("/book");
    }
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 dark:bg-dark">
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-dark/95">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-brand">
            Customer booking
          </p>
          <nav
            aria-label="Customer booking areas"
            className="mt-3 flex flex-wrap gap-2 pb-4"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              const isPortalHub = item.href === "/book";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isPortalHub ? handlePortalHubClick : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "bg-booking-bg text-muted hover:text-dark dark:bg-dark-elevated dark:hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {bookingReference && (
            <div className="flex flex-wrap items-center gap-2 pb-4 text-sm text-muted">
              <Link href="/my-bookings" className="font-medium text-brand hover:underline">
                My bookings
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
              <span className="font-semibold text-dark dark:text-white">{bookingReference}</span>
            </div>
          )}
        </div>
      </div>

      {children}
    </main>
  );
}
