"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import type { CancellationPolicySection } from "@/lib/cancellation-policy-sections";
import { CANCELLATION_POLICY_TITLE } from "@/lib/cancellation-policy";

type CancellationPolicyTimelineProps = {
  sections: CancellationPolicySection[];
  bookingUrl: string;
};

export function CancellationPolicyTimeline({
  sections,
  bookingUrl,
}: CancellationPolicyTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const elements = sections
      .map((section) => sectionRefs.current[section.id])
      .filter((node): node is HTMLElement => node != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-12% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sections]);

  const activeIndex = sections.findIndex((section) => section.id === activeId);

  return (
    <div className="relative">
      <div className="mb-10 sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand sm:text-sm">
          Policy
        </p>
        <h1 className="font-display mt-2 text-3xl leading-[1.05] tracking-[-0.02em] dark:text-white sm:mt-3 sm:text-5xl">
          {CANCELLATION_POLICY_TITLE}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg">
          Please read this policy before completing payment for your booking. It explains
          cancellations, flight delays, waiting time, and no-shows.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
        <div className="relative min-w-0">
          <div
            aria-hidden
            className="absolute bottom-0 left-[7px] top-0 w-px bg-gray-200 lg:hidden dark:bg-white/10"
          />
          <motion.div
            aria-hidden
            className="absolute left-[7px] w-px origin-top bg-brand-gradient lg:hidden"
            initial={false}
            animate={{
              height: reduceMotion
                ? "100%"
                : `${Math.max(8, ((activeIndex + 1) / sections.length) * 100)}%`,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />

          <div className="space-y-12 sm:space-y-16">
            {sections.map((section, index) => {
              const isActive = section.id === activeId;
              const isPast = index < activeIndex;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(node) => {
                    sectionRefs.current[section.id] = node;
                  }}
                  className="relative scroll-mt-28 pl-8 sm:pl-10 lg:pl-0"
                >
                  <div className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center lg:hidden">
                    <motion.span
                      aria-hidden
                      className={`absolute inset-0 rounded-full ${
                        isActive ? "bg-brand/20" : "bg-transparent"
                      }`}
                      animate={
                        isActive && !reduceMotion
                          ? { scale: [1, 1.5, 1], opacity: [0.45, 0.12, 0.45] }
                          : { scale: 1, opacity: 0 }
                      }
                      transition={
                        isActive && !reduceMotion
                          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    />
                    <motion.span
                      className={`relative z-10 block h-2.5 w-2.5 rounded-full border-2 ${
                        isActive
                          ? "border-brand bg-brand"
                          : isPast
                            ? "border-brand bg-brand/80"
                            : "border-gray-300 bg-white dark:border-white/20 dark:bg-dark"
                      }`}
                      animate={{ scale: isActive ? 1.2 : 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    />
                  </div>

                  <h2
                    className={`text-xl font-semibold tracking-[-0.02em] transition-colors sm:text-2xl ${
                      isActive
                        ? "text-brand dark:text-brand-end"
                        : "text-dark dark:text-white"
                    }`}
                  >
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base [&_strong]:font-semibold [&_strong]:text-dark dark:[&_strong]:text-gray-100">
                    {section.content}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-28" aria-label="Policy sections">
            <div className="relative pr-6">
              <div
                aria-hidden
                className="absolute bottom-2 right-[7px] top-2 w-px bg-gray-200 dark:bg-white/10"
              />
              <motion.div
                aria-hidden
                className="absolute right-[7px] w-px origin-top bg-brand-gradient"
                initial={false}
                animate={{
                  height: reduceMotion
                    ? "100%"
                    : `${Math.max(12, ((activeIndex + 1) / sections.length) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                style={{ top: "0.5rem" }}
              />

              <ol className="space-y-5">
                {sections.map((section, index) => {
                  const isActive = section.id === activeId;
                  const isPast = index < activeIndex;

                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-start justify-end gap-3 text-right"
                      >
                        <span
                          className={`text-sm leading-snug transition-colors ${
                            isActive
                              ? "font-semibold text-brand dark:text-brand-end"
                              : isPast
                                ? "font-medium text-dark/80 dark:text-gray-200"
                                : "text-gray-600 group-hover:text-dark dark:text-gray-400 dark:group-hover:text-white"
                          }`}
                        >
                          {section.title}
                        </span>
                        <span className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                          <motion.span
                            aria-hidden
                            className={`absolute inset-0 rounded-full ${
                              isActive ? "bg-brand/20" : "bg-transparent"
                            }`}
                            animate={
                              isActive && !reduceMotion
                                ? { scale: [1, 1.45, 1], opacity: [0.45, 0.15, 0.45] }
                                : { scale: 1, opacity: 0 }
                            }
                            transition={
                              isActive && !reduceMotion
                                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                : { duration: 0.2 }
                            }
                          />
                          <motion.span
                            className={`relative z-10 block h-2.5 w-2.5 rounded-full border-2 ${
                              isActive
                                ? "border-brand bg-brand"
                                : isPast
                                  ? "border-brand bg-brand/80"
                                  : "border-gray-300 bg-white dark:border-white/20 dark:bg-dark"
                            }`}
                            animate={{ scale: isActive ? 1.2 : 1 }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                          />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>
        </aside>
      </div>

      <div className="mt-12 flex flex-wrap gap-2.5 border-t border-black/8 pt-8 sm:mt-16 sm:gap-3 dark:border-white/10">
        <AnimatedGradientButton href={bookingUrl} className="px-5 py-2.5 text-sm">
          Book a transfer
        </AnimatedGradientButton>
        <a
          href="mailto:info@sparkride.co.uk"
          className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
