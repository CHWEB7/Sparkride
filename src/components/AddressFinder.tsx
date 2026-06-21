"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, X } from "lucide-react";

type AddressSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

type AddressFinderProps = {
  value: string;
  onChange: (address: string) => void;
  label: string;
  placeholder?: string;
  hint?: string;
  inputClass: string;
  labelClass: string;
};

function createSessionToken() {
  return crypto.randomUUID();
}

export function AddressFinder({
  value,
  onChange,
  label,
  placeholder = "e.g. 12 High Street, Castleford",
  hint,
  inputClass,
  labelClass,
}: AddressFinderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(createSessionToken());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddresses = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        sessionToken: sessionTokenRef.current,
      });
      const res = await fetch(`/api/addresses?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lookup failed");

      setResults(data.addresses ?? []);
      setOpen((data.addresses ?? []).length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find addresses");
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchAddresses(query), 400);
    return () => clearTimeout(timer);
  }, [query, searchAddresses]);

  async function selectAddress(address: AddressSuggestion) {
    setSelecting(true);
    setError("");

    try {
      const params = new URLSearchParams({
        placeId: address.placeId,
        sessionToken: sessionTokenRef.current,
      });
      const res = await fetch(`/api/addresses/details?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not load address");

      onChange(data.formattedAddress || address.label);
      setQuery(data.postcode || address.secondaryText || "");
      setOpen(false);
      sessionTokenRef.current = createSessionToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load address");
      onChange(address.label);
      setOpen(false);
    } finally {
      setSelecting(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError("");
    sessionTokenRef.current = createSessionToken();
  }

  return (
    <div ref={containerRef} className="relative">
      <label className={labelClass}>{label}</label>

      <div className="mb-3 p-4 rounded-xl bg-white/70 dark:bg-brand/5 shadow-sm dark:border dark:border-brand/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-brand shrink-0" />
            <span className="text-sm font-medium text-brand dark:text-brand-end">
              Find your address
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted font-medium">
            Google Maps
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter postcode or start typing your address"
            className={`${inputClass} flex-1`}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-3 py-3 rounded-xl bg-white dark:bg-dark-elevated shadow-sm text-muted hover:text-dark dark:hover:text-white dark:border dark:border-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {open && results.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-3 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-dark shadow-lg dark:border dark:border-white/10 divide-y divide-gray-100/80 dark:divide-white/10"
            >
              {results.map((address) => (
                <li key={address.placeId}>
                  <button
                    type="button"
                    disabled={selecting}
                    onClick={() => selectAddress(address)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-light/60 dark:hover:bg-brand/10 transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium dark:text-white truncate">
                        {address.mainText || address.label}
                      </div>
                      {address.secondaryText && (
                        <div className="text-xs text-muted truncate mt-0.5">
                          {address.secondaryText}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {error && <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>}
        {!error && loading && query.length >= 3 && (
          <p className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching Google Maps…
          </p>
        )}
        {!error && !loading && query.length > 0 && query.length < 3 && (
          <p className="mt-2 text-xs text-muted">Type at least 3 characters to search</p>
        )}
      </div>

      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />

      {hint && <p className="text-xs text-muted mt-2">{hint}</p>}
    </div>
  );
}
