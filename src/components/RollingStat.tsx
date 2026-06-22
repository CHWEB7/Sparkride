"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}

type RollingStatProps = {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  className?: string;
};

export function RollingStat({
  value,
  label,
  suffix = "",
  delay = 0,
  className = "",
}: RollingStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const duration = 2000;
    let frame = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, delay, reduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.65,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 ${className}`}
    >
      <p className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold tracking-[-0.03em] text-dark dark:text-white leading-none">
        {formatNumber(display)}
        {suffix}
      </p>
      <p className="mt-3 text-sm sm:text-[15px] text-muted leading-relaxed max-w-[14rem]">
        {label}
      </p>
    </motion.div>
  );
}
