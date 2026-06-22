"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteContainer } from "@/components/SiteContainer";

const FAQS = [
  {
    question: "How do I book a transfer?",
    answer:
      "Choose your service, enter your pickup and drop-off details, select your vehicle, and confirm online. You will receive a reference number straight away and your driver will confirm the booking.",
  },
  {
    question: "Are your vehicles fully electric?",
    answer:
      "Yes. Sparkride operates a fully electric fleet. Every journey is powered by clean energy, helping reduce emissions and fuel use compared with a conventional private hire.",
  },
  {
    question: "Is the price fixed when I book?",
    answer:
      "Yes. The price you see at checkout is the price you pay — no surge pricing and no hidden fees. Payment is made to your driver on the day of travel.",
  },
  {
    question: "Which airports do you cover?",
    answer:
      "We cover major UK airports including Leeds Bradford, Manchester, Heathrow, Gatwick, Birmingham, Liverpool, Newcastle, and more. Airport transfers can be booked as single or return journeys.",
  },
  {
    question: "What if my flight is delayed?",
    answer:
      "Include your flight number when booking so we can monitor arrival times. For airport pickups we adjust collection accordingly — just contact us if your plans change.",
  },
  {
    question: "Do you offer corporate and private hire?",
    answer:
      "Yes. Beyond airport transfers we provide corporate travel, private hire, ferry port transfers, and theme park journeys. All services use the same professional drivers and electric vehicles.",
  },
] as const;

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-black/8 dark:border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 sm:py-6 text-left group"
      >
        <span className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-dark dark:text-white group-hover:text-brand dark:group-hover:text-brand-end transition-colors">
          {question}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/8 dark:border-white/12 bg-white dark:bg-dark-elevated transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-muted" strokeWidth={2} />
        </span>
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
            <p className="pb-5 sm:pb-6 pr-12 text-sm sm:text-[15px] leading-relaxed text-muted">
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
    <section id="how-it-works" className="py-20 sm:py-24 bg-app-bg dark:bg-dark">
      <SiteContainer>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            FAQ
          </p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl dark:text-white leading-[1.05]">
            Questions answered
          </h2>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            Everything you need to know about booking, pricing, and travelling
            with Sparkride&apos;s electric fleet.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-[28px] border border-black/8 dark:border-white/10 bg-white dark:bg-dark-elevated px-5 sm:px-7 shadow-[0_24px_60px_-32px_rgba(25,28,35,0.18)]">
          {FAQS.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
