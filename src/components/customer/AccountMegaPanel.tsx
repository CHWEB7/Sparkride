"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AccountMegaPanelProps = {
  onClose: () => void;
};

export function AccountMegaPanel({ onClose }: AccountMegaPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading account…</p>;
  }

  if (!email) {
    return (
      <div className="grid sm:grid-cols-2 gap-6 max-w-xl">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
            Get started
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link
                href="/login?redirect=/book"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/signup?redirect=/book"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end transition-colors"
              >
                <User className="w-4 h-4" />
                Create account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
            Why sign up?
          </p>
          <p className="text-sm text-muted leading-relaxed">
            An account is required to book airport transfers, view your trips, and
            manage your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-xl">
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
          Signed in as
        </p>
        <p className="text-sm font-medium text-dark dark:text-white break-all mb-4">
          {email}
        </p>
        <ul className="space-y-2.5">
          <li>
            <Link
              href="/my-bookings"
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              My bookings
            </Link>
          </li>
          <li>
            <Link
              href="/account"
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end transition-colors"
            >
              <User className="w-4 h-4" />
              Account
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
          Session
        </p>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
