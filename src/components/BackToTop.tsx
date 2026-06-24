"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BackToTopProps = {
  visible: boolean;
};

export function BackToTop({ visible }: BackToTopProps) {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.25 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed right-4 sm:right-8 bottom-6 sm:bottom-8 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-gradient text-white shadow-lg shadow-brand/25 hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
