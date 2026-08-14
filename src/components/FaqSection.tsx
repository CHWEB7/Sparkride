"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteContainer } from "@/components/SiteContainer";
import { FAQS } from "@/lib/faqs";

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  className = "",
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 sm:gap-6 py-4 sm:py-6 px-3 sm:px-6 text-left group"
      >
        <span className="text-sm sm:text-lg font-semibold tracking-[-0.02em] text-dark dark:text-white group-hover:text-brand dark:group-hover:text-brand-end transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-3 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-[15px] leading-relaxed text-muted max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="how-it-works" className="py-14 sm:py-24 bg-app-bg dark:bg-dark">
      <SiteContainer>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            FAQ
          </p>
          <h2 className="font-display mt-2 sm:mt-3 text-3xl sm:text-5xl dark:text-white leading-[1.05]">
            Questions answered
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted leading-relaxed">
            Everything you need to know about booking airport transfers from Castleford and West
            Yorkshire with Sparkride&apos;s electric fleet.
          </p>
        </div>

        <div className="border-y border-black/8 dark:border-white/10">
          <div className="grid lg:grid-cols-2">
            {FAQS.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
                className={[
                  "border-b border-black/8 dark:border-white/10",
                  index % 2 === 0
                    ? "lg:border-r lg:border-black/8 lg:dark:border-white/10"
                    : "",
                  index >= FAQS.length - (FAQS.length % 2 === 0 ? 2 : 1)
                    ? "lg:border-b-0"
                    : "",
                  index === FAQS.length - 1 ? "border-b-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
