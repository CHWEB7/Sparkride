"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CustomerNav() {
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) return null;

  if (!email) {
    return (
      <div className="hidden sm:flex items-center gap-3">
        <Link
          href="/login?redirect=/book"
          className="text-sm font-medium text-dark dark:text-gray-200 hover:opacity-70 transition-opacity"
        >
          Sign in
        </Link>
        <Link
          href="/signup?redirect=/book"
          className="inline-flex items-center px-5 py-2.5 bg-dark dark:bg-white text-white dark:text-dark text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-3">
      <Link
        href="/my-bookings"
        className="text-sm font-medium text-dark dark:text-gray-200 hover:opacity-70 transition-opacity"
      >
        My bookings
      </Link>
      <Link
        href="/account"
        className="text-sm font-medium text-dark dark:text-gray-200 hover:opacity-70 transition-opacity"
      >
        Account
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-sm font-medium text-muted hover:text-dark dark:hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
