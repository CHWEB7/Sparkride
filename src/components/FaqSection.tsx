"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteContainer } from "@/components/SiteContainer";

const FAQS = [
  {
    question: "How do I pay for my booking?",
    answer:
      "After your driver confirms the booking, you will receive a secure Square payment link by email and on your booking page. Payment is completed on Square's hosted checkout — Sparkride never stores your card details. Funds go directly to your driver's Square account.",
  },
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
      "Yes. The price you see when booking is the fixed fare for your trip. After your driver confirms the booking, you can pay online via a secure Square payment link sent by email and shown on your booking page. Sparkride does not store card details.",
  },
  {
    question: "What if I am collected from a non-fixed-price location?",
    answer:
      "The system will detect this when you make a booking. Our drivers have to confirm the trips that you book, and the driver will send you a custom quote via email for you to review. If you choose to accept, that price is then fixed for your trip.",
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
        className="flex w-full items-center justify-between gap-6 py-5 sm:py-6 px-4 sm:px-6 text-left group"
      >
        <span className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-dark dark:text-white group-hover:text-brand dark:group-hover:text-brand-end transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${
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
            <p className="px-4 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-[15px] leading-relaxed text-muted max-w-3xl">
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
