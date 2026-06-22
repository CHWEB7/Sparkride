"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Play, Trash2 } from "lucide-react";

type SavedItem = {
  id: string;
  label: string;
  pickupAddress: string;
  dropoffAddress: string;
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportCode: string | null;
  passengers: number;
  luggage: number;
  vehicleType: string;
  driverId: string | null;
  notes: string | null;
};

type SavedDetailsManagerProps = {
  onUseTemplate: (item: SavedItem) => void;
  onBack: () => void;
};

export function SavedDetailsManager({ onUseTemplate }: SavedDetailsManagerProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SavedItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customer/saved-details");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved trip?")) return;
    await fetch(`/api/customer/saved-details/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/customer/saved-details/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === editing.id ? data : i)));
    setEditing(null);
    setSaving(false);
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-dark text-dark dark:text-gray-100 focus:border-brand outline-none text-sm";

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">Label</label>
          <input
            className={inputClass}
            value={editing.label}
            onChange={(e) => setEditing({ ...editing, label: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Pickup address</label>
          <input
            className={inputClass}
            value={editing.pickupAddress}
            onChange={(e) => setEditing({ ...editing, pickupAddress: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Drop-off address</label>
          <input
            className={inputClass}
            value={editing.dropoffAddress}
            onChange={(e) => setEditing({ ...editing, dropoffAddress: e.target.value })}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Passengers</label>
            <input
              type="number"
              min={1}
              max={8}
              className={inputClass}
              value={editing.passengers}
              onChange={(e) =>
                setEditing({ ...editing, passengers: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Luggage</label>
            <input
              type="number"
              min={0}
              max={10}
              className={inputClass}
              value={editing.luggage}
              onChange={(e) =>
                setEditing({ ...editing, luggage: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Notes</label>
          <textarea
            rows={3}
            className={inputClass}
            value={editing.notes ?? ""}
            onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-gradient text-white font-semibold rounded-full"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="px-6 py-3 text-muted font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-booking-bg dark:bg-dark-elevated p-8 text-center text-muted">
        No saved trip details yet. Complete a booking and tick &quot;Save these details&quot; at
        the end.
      </div>
    );
  }

  return (
    <ul className="space-y-4 max-w-3xl">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl bg-booking-bg dark:bg-dark-elevated p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold dark:text-white">{item.label}</p>
            <p className="text-sm text-muted mt-1 truncate">
              {item.pickupAddress} → {item.dropoffAddress}
            </p>
            <p className="text-xs text-muted mt-1">
              {item.passengers} passengers · {item.luggage} luggage
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onUseTemplate(item)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold"
            >
              <Play className="w-4 h-4" />
              Use
            </button>
            <button
              type="button"
              onClick={() => setEditing(item)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-dark border border-gray-200 dark:border-white/10 text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 text-sm font-medium hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
