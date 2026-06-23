"use client";

import { FaresTable } from "@/components/FaresTable";
import { FARE_SECTIONS } from "@/lib/fares";

export function FaresSections() {
  return (
    <div className="border-y border-black/8 dark:border-white/10">
      {FARE_SECTIONS.map((section, index) => (
        <FaresTable
          key={section.title}
          section={section}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}
