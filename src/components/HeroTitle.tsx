"use client";

import { RotatingWord } from "./RotatingWord";

export function HeroTitle() {
  return (
    <h1 className="font-display text-[2.35rem] leading-[1.08] sm:text-6xl lg:text-[4.5rem] sm:leading-[1.05] text-dark dark:text-white">
      <span className="inline-flex items-baseline gap-x-[0.2em]">
        <span>Travel</span>
        <RotatingWord />
      </span>{" "}
      <span className="whitespace-nowrap">
        with <span className="text-white">Sparkride</span>
      </span>
    </h1>
  );
}
