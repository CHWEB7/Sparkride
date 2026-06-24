"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/driver/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const SIDEBAR_STORAGE_KEY = "sparkride_driver_sidebar_collapsed";

type DriverPortalShellProps = {
  driverName: string;
  children: React.ReactNode;
};

const topNavItems = [
  { href: "/driver/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/driver/bookings", label: "Bookings Manager", icon: LayoutGrid },
  { href: "/driver/calendar", label: "Bookings Calendar", icon: CalendarDays },
  { href: "/driver/customers", label: "Customers", icon: Users },
];

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/driver/bookings")) return "Bookings Manager";
  if (pathname.startsWith("/driver/calendar")) return "Bookings Calendar";
  if (pathname.startsWith("/driver/customers")) return "Customers";
  if (pathname.startsWith("/driver/settings")) return "Settings";
  return "Dashboard";
}

const settingsSubItems = [
  { href: "/driver/settings/integrations", label: "Integrations" },
  { href: "/driver/settings/availability", label: "Availability" },
  { href: "/driver/settings", label: "Account" },
];

export function DriverPortalShell({ driverName, children }: DriverPortalShellProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const settingsActive = pathname.startsWith("/driver/settings");

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (settingsActive) setSettingsOpen(true);
  }, [settingsActive]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  function navLinkClass(active: boolean) {
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-white text-gray-900 shadow-sm border border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/10"
        : "text-gray-600 hover:bg-white/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
    } ${collapsed ? "justify-center" : ""}`;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 dark:bg-dark dark:text-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-[#f8f9fa] transition-all duration-200 dark:border-white/10 dark:bg-dark-elevated ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <div
          className={`flex h-14 items-center border-b border-gray-200 dark:border-white/10 ${
            collapsed ? "justify-center px-2" : "px-4"
          }`}
        >
          {collapsed ? (
            <Link href="/driver/dashboard" className="font-bold text-emerald-600 dark:text-brand-end">
              S
            </Link>
          ) : (
            <Logo href="/driver/dashboard" size="header" light={!isLight} />
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {topNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={navLinkClass(active)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}

          <div>
            <button
              type="button"
              title={collapsed ? "Settings" : undefined}
              onClick={() => {
                if (collapsed) {
                  window.location.href = "/driver/settings";
                  return;
                }
                setSettingsOpen((o) => !o);
              }}
              className={`${navLinkClass(settingsActive)} w-full`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Settings</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>
            {!collapsed && settingsOpen && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-3 dark:border-white/10">
                {settingsSubItems.map(({ href, label }) => {
                  const active =
                    href === "/driver/settings"
                      ? pathname === "/driver/settings"
                      : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "font-medium text-emerald-600 dark:text-brand-end"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-3 dark:border-white/10">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className={`flex h-screen flex-col transition-all duration-200 ${collapsed ? "pl-[72px]" : "pl-60"}`}>
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-white/10 dark:bg-dark/90 lg:px-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <LayoutDashboard className="h-4 w-4" />
            <span>{pageTitle(pathname)}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{driverName}</span>
            <LogoutButton variant={isLight ? "light" : "dark"} />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 lg:px-5 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
