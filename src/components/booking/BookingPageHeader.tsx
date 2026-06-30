"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, CalendarClock, LogOut, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import type { CustomerProfile } from "@/lib/customer";

type BookingPageHeaderProps = {
  profile: CustomerProfile | null;
  onProfileChange?: (profile: CustomerProfile | null) => void;
};

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export function BookingPageHeader({ profile, onProfileChange }: BookingPageHeaderProps) {
  const { canToggle, zone } = useTheme();
  const showThemeToggle = canToggle && zone === "customer";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await fetch("/api/auth/sign-out", { method: "POST" });
    await supabase.auth.signOut();
    onProfileChange?.(null);
    setMenuOpen(false);
    window.location.reload();
  }

  const initials = profile ? getInitials(profile.name, profile.email) : "";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-dark/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Logo href="/" size="header" />

        <div className="flex items-center gap-2 sm:gap-3">
          {showThemeToggle && <ThemeToggle />}

          {profile ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center bg-brand text-sm font-bold text-white"
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-dark-elevated">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.name || "Your account"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {profile.email}
                    </p>
                  </div>

                  <Link
                    href="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                  >
                    <CalendarClock className="h-4 w-4 text-brand" />
                    My bookings
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                  >
                    <Bookmark className="h-4 w-4 text-brand" />
                    Saved routes
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                  >
                    <User className="h-4 w-4 text-brand" />
                    Account settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4 text-brand" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
