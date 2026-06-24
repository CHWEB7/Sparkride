"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type BlockOut = {
  id: string;
  startDate: string;
  endDate: string;
  label: string | null;
};

export function DriverBlockOutDates() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [items, setItems] = useState<BlockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");

  const sectionClass = isLight
    ? "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    : "rounded-2xl border border-white/10 bg-white/5 p-6";

  const iconWrapClass = isLight
    ? "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
    : "flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-brand-end";

  const titleClass = isLight ? "text-lg font-semibold text-gray-900" : "text-lg font-semibold text-white";
  const bodyClass = isLight
    ? "mt-1 text-sm text-gray-500 leading-relaxed max-w-2xl"
    : "mt-1 text-sm text-gray-400 leading-relaxed max-w-2xl";

  const labelClass = isLight
    ? "mb-1.5 block text-xs font-medium text-gray-600"
    : "mb-1.5 block text-xs font-medium text-gray-400";

  const inputClass = isLight
    ? "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
    : "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  const errorClass = isLight
    ? "mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    : "mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200";

  const submitBtnClass = isLight
    ? "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
    : "inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50";

  const listClass = isLight
    ? "divide-y divide-gray-100 rounded-lg border border-gray-200"
    : "divide-y divide-white/10 rounded-lg border border-white/10";

  const itemTitleClass = isLight ? "font-medium text-gray-900" : "font-medium text-white";
  const mutedTextClass = isLight ? "text-sm text-gray-500" : "text-sm text-gray-400";
  const removeBtnClass = isLight
    ? "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
    : "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10";

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
    <section className={sectionClass}>
      <div className="flex items-start gap-3">
        <div className={iconWrapClass}>
          <CalendarOff className="h-5 w-5" />
        </div>
        <div>
          <h2 className={titleClass}>Block-out dates</h2>
          <p className={bodyClass}>
            Mark annual leave or days off. Customers will not be able to select you for pickups on
            these dates (including return journeys on blocked days).
          </p>
        </div>
      </div>

      {error && <div className={errorClass}>{error}</div>}

      <form onSubmit={handleAdd} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>From</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <input
            type="date"
            required
            min={startDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelClass}>Label (optional)</label>
          <input
            type="text"
            placeholder="e.g. Annual leave"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button type="submit" disabled={saving} className={submitBtnClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add dates
          </button>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className={`flex items-center gap-2 py-4 ${mutedTextClass}`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading block-out dates…
          </div>
        ) : items.length === 0 ? (
          <p className={`py-2 ${mutedTextClass}`}>No block-out dates yet.</p>
        ) : (
          <ul className={listClass}>
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className={itemTitleClass}>{formatRange(item.startDate, item.endDate)}</p>
                  {item.label && <p className={isLight ? "text-gray-500" : "text-gray-400"}>{item.label}</p>}
                </div>
                <button type="button" onClick={() => handleDelete(item.id)} className={removeBtnClass}>
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
