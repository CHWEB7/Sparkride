"use client";

import { RotatingWord } from "./RotatingWord";

export function HeroTitle() {
  return (
    <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] text-dark dark:text-white leading-[1.05]">
      <span className="inline-flex flex-wrap items-baseline gap-x-[0.2em]">
        <span>Travel</span>
        <RotatingWord />
      </span>{" "}
      with <span className="text-white">Sparkride</span>
    </h1>
  );
}
