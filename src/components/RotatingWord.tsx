"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WORDS = ["freely", "confidently", "comfortably", "effortlessly"] as const;
const INTERVAL_MS = 2800;

export function RotatingWord({
  words = WORDS,
}: {
  words?: readonly string[];
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || reduceMotion || words.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [mounted, reduceMotion, words]);

  const word = words[index] ?? words[0];

  if (!mounted) {
    return (
      <span className="rotating-word-slot text-brand-gradient" aria-hidden>
        {words[0]}
      </span>
    );
  }

  if (reduceMotion) {
    return <span className="rotating-word-slot text-brand-gradient">{word}</span>;
  }

  return (
    <span className="rotating-word-slot" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="rotating-word-item text-brand-gradient"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
