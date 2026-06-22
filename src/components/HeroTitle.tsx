"use client";

import { RotatingWord } from "./RotatingWord";

export function HeroTitle() {
  return (
    <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] text-dark dark:text-white leading-[1.05]">
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
