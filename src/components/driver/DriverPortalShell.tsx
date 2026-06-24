"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/driver/LogoutButton";

const SIDEBAR_STORAGE_KEY = "sparkride_driver_sidebar_collapsed";

type DriverPortalShellProps = {
  driverName: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/driver/dashboard", label: "Bookings", icon: CalendarDays },
  { href: "/driver/settings", label: "Settings", icon: Settings },
];

export function DriverPortalShell({ driverName, children }: DriverPortalShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-[#f8f9fa] transition-all duration-200 ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <div className={`flex h-14 items-center border-b border-gray-200 ${collapsed ? "justify-center px-2" : "px-4"}`}>
          {collapsed ? (
            <Link href="/driver/dashboard" className="font-bold text-emerald-600">
              S
            </Link>
          ) : (
            <Logo href="/driver/dashboard" size="header" />
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white hover:text-gray-800 ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-col transition-all duration-200 ${collapsed ? "pl-[72px]" : "pl-60"}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/90 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LayoutGrid className="h-4 w-4" />
            <span>Driver portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">{driverName}</span>
            <LogoutButton variant="light" />
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
