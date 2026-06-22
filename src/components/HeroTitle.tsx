"use client";

import { RotatingWord } from "./RotatingWord";

export function HeroTitle() {
  return (
    <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] text-dark dark:text-white leading-[1.05]">
      Travel <RotatingWord /> with{" "}
      <span className="text-brand-gradient">Sparkride</span>
    </h1>
  );
}
