"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type BookingModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

export function BookingModal({ onClose, children }: BookingModalProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.button
        type="button"
        aria-label="Close booking"
        className="absolute inset-0 bg-black/45 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="New booking"
        className="relative flex w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-booking-bg dark:bg-dark-elevated shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        initial={{ y: 48, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200/60 dark:border-white/10 px-5 sm:px-6 py-4 bg-white/80 dark:bg-dark/80 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Sparkride</p>
            <h2 className="text-lg font-semibold dark:text-white">Book your journey</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2.5 text-muted hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </motion.div>
    </div>,
    document.body
  );
}
