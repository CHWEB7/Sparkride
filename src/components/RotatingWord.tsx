"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WORDS = ["freely", "confidently", "comfortably", "effortlessly"] as const;
const INTERVAL_MS = 2800;

export function RotatingWord({
  words = WORDS,
  className = "",
}: {
  words?: readonly string[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [reduceMotion, words]);

  const word = words[index] ?? words[0];

  return (
    <span
      className={`relative inline-block overflow-hidden align-bottom text-brand-gradient ${className}`}
      style={{ minWidth: "11.5ch", height: "1.08em" }}
      aria-live="polite"
    >
      {reduceMotion ? (
        <span className="inline-block">{word}</span>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={word}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 inline-block whitespace-nowrap"
          >
            {word}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}
