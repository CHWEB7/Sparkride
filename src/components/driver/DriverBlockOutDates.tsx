"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";

type BlockOut = {
  id: string;
  startDate: string;
  endDate: string;
  label: string | null;
};

export function DriverBlockOutDates() {
  const [items, setItems] = useState<BlockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/driver/block-outs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load block-out dates");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load block-out dates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/driver/block-outs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, label: label.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add block-out");
      setItems((prev) =>
        [...prev, data].sort((a, b) => a.startDate.localeCompare(b.startDate))
      );
      setStartDate("");
      setEndDate("");
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add block-out");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/driver/block-outs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to remove block-out");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function formatRange(start: string, end: string) {
    const startLabel = format(parseISO(start), "d MMM yyyy");
    const endLabel = format(parseISO(end), "d MMM yyyy");
    return start === end ? startLabel : `${startLabel} – ${endLabel}`;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CalendarOff className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Block-out dates</h2>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-2xl">
            Mark annual leave or days off. Customers will not be able to select you for pickups on
            these dates (including return journeys on blocked days).
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">From</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">To</label>
          <input
            type="date"
            required
            min={startDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Label (optional)</label>
          <input
            type="text"
            placeholder="e.g. Annual leave"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add dates
          </button>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading block-out dates…
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No block-out dates yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{formatRange(item.startDate, item.endDate)}</p>
                  {item.label && <p className="text-gray-500">{item.label}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
