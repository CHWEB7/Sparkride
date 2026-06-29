"use client";

import { Minus, Plus, Luggage, Users } from "lucide-react";

type PartySizePickerProps = {
  passengers: number;
  luggage: number;
  onPassengersChange: (value: number) => void;
  onLuggageChange: (value: number) => void;
};

function CounterRow({
  icon: Icon,
  label,
  value,
  min,
  max,
  onChange,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-dark px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light/70 dark:bg-brand/15">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div>
          <p className="font-medium dark:text-white">{label}</p>
          <p className="text-xs text-muted">Tap to adjust</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-dark dark:text-white disabled:opacity-40 transition-colors hover:bg-brand-light/60 dark:hover:bg-brand/20"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-lg font-semibold dark:text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white disabled:opacity-40 transition-opacity hover:opacity-90"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PartySizePicker({
  passengers,
  luggage,
  onPassengersChange,
  onLuggageChange,
}: PartySizePickerProps) {
  return (
    <div className="space-y-4">
      <CounterRow
        icon={Users}
        label="Passengers"
        value={passengers}
        min={1}
        max={8}
        onChange={onPassengersChange}
      />
      <CounterRow
        icon={Luggage}
        label="Luggage pieces"
        value={luggage}
        min={0}
        max={10}
        onChange={onLuggageChange}
      />
    </div>
  );
}
