"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CustomerProfile } from "@/lib/customer";

export function AccountForm({ customer }: { customer: CustomerProfile }) {
  const router = useRouter();
  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-6 space-y-5 shadow-md"
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
          Profile updated
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
        <input
          type="email"
          disabled
          value={customer.email}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1.5">Full name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-dark dark:text-white focus:border-brand outline-none text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand-gradient hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Save changes
      </button>
    </form>
  );
}
