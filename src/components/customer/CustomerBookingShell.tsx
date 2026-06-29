"use client";

import Link from "next/link";
import {
  Bookmark,
  CalendarClock,
  History,
  LayoutGrid,
  LogOut,
  Plus,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import type { CustomerProfile } from "@/lib/customer";

export type CustomerPortalView = "home" | "active" | "history" | "saved" | "account";

type NavItem = {
  id: CustomerPortalView;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Overview", icon: LayoutGrid },
  { id: "active", label: "Upcoming trips", icon: CalendarClock },
  { id: "history", label: "Past trips", icon: History },
  { id: "saved", label: "Saved routes", icon: Bookmark },
  { id: "account", label: "Account", icon: User },
];

type CustomerBookingShellProps = {
  profile: CustomerProfile;
  activeView: CustomerPortalView;
  onNavigate: (view: CustomerPortalView) => void;
  onNewBooking: () => void;
  onSignOut: () => void;
  children: React.ReactNode;
};

export function CustomerBookingShell({
  profile,
  activeView,
  onNavigate,
  onNewBooking,
  onSignOut,
  children,
}: CustomerBookingShellProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const firstName = profile.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-gray-900 dark:bg-dark dark:text-gray-100">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-gray-200/80 bg-[#f8f9fa] dark:border-white/10 dark:bg-dark-elevated md:flex">
        <div className="border-b border-gray-200/80 px-5 py-4 dark:border-white/10">
          <Logo href="/book" size="header" light={!isLight} />
          <p className="mt-3 text-xs font-medium text-muted">Customer bookings</p>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <button
            type="button"
            onClick={onNewBooking}
            className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand bg-white px-4 py-2.5 text-sm font-semibold text-brand shadow-sm transition-all hover:bg-brand hover:text-white dark:bg-dark dark:hover:bg-brand"
          >
            <Plus className="h-4 w-4" />
            New booking
          </button>

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-light text-brand shadow-sm dark:bg-brand/15 dark:text-brand-end"
                      : "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <div className="rounded-2xl bg-brand-gradient p-4 text-white">
              <p className="text-sm font-semibold">Need help?</p>
              <p className="mt-1 text-xs text-white/85 leading-relaxed">
                Questions about a trip or booking? We&apos;re here to help.
              </p>
              <Link
                href="mailto:info@sparkride.co.uk"
                className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand"
              >
                Contact us
              </Link>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-dark">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium dark:text-white">{firstName}</p>
                <p className="truncate text-xs text-muted">{profile.email}</p>
              </div>
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white hover:text-dark dark:hover:bg-white/5 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-dark-elevated md:px-6 md:py-4">
          <div className="flex items-center gap-3 md:hidden">
            <Logo href="/book" size="sm" light={!isLight} />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:justify-between">
            <p className="hidden text-sm text-muted md:block">
              Welcome back, <span className="font-medium text-dark dark:text-white">{firstName}</span>
            </p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={onNewBooking}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-brand px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white md:hidden"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-200/80 bg-white px-3 py-2 md:hidden dark:border-white/10 dark:bg-dark-elevated">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-brand-light text-brand dark:bg-brand/15"
                    : "text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { NAV_ITEMS };
