"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

type RollingStatProps = {
  value: number;
  label: string;
  unit?: string;
  delay?: number;
  className?: string;
};

export function RollingStat({
  value,
  label,
  unit,
  delay = 0,
  className = "",
}: RollingStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const [revealed, setRevealed] = useState(reduceMotion ?? false);

  const finalText = `${formatNumber(value)}${unit ? ` ${unit}` : ""}`;

  useEffect(() => {
    if (!isInView) return;

    const revealTimer = window.setTimeout(() => setRevealed(true), delay);

    if (reduceMotion) {
      setDisplay(value);
      return () => window.clearTimeout(revealTimer);
    }

    const duration = 1400;
    const startAt = performance.now() + delay;
    let frame = 0;
    let lastValue = -1;

    const tick = (now: number) => {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const next = Math.round(value * eased);

      if (next !== lastValue) {
        lastValue = next;
        setDisplay(next);
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(revealTimer);
      cancelAnimationFrame(frame);
    };
  }, [isInView, value, delay, reduceMotion]);

  return (
    <div
      ref={ref}
      className={`flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 transition-opacity duration-700 ease-out ${
        revealed ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <p
        className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-[-0.03em] text-dark dark:text-white leading-none whitespace-nowrap tabular-nums"
        aria-label={finalText}
      >
        {formatNumber(display)}
        {unit ? <span>{unit}</span> : null}
      </p>
      <p className="mt-3 text-sm sm:text-[15px] text-muted leading-relaxed max-w-[14rem]">
        {label}
      </p>
    </div>
  );
}
