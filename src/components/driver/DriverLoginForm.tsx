"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, Loader2 } from "lucide-react";

export function DriverLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/driver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push("/driver/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Sparkride</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Driver portal</h1>
          <p className="mt-2 text-gray-400 text-sm">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-elevated rounded-2xl p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-brand outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gradient hover:bg-brand-gradient-hover disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-gray-500 text-xs">
          <p>
            <span className="text-gray-400">Test driver:</span> test@sparkride.co.uk /{" "}
            TestDriver2024!
          </p>
          <p>
            <span className="text-gray-400">Lee & Darren:</span> lee@ or darren@sparkride.co.uk /{" "}
            driver123
          </p>
          <p>
            <span className="text-gray-400">Legacy demo:</span> driver@sparkride.co.uk / driver123
          </p>
        </div>
      </div>
    </div>
  );
}
