"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteContainer } from "@/components/SiteContainer";
import { SERVICES } from "@/lib/services";

const CARD_GAP = 16;

export function ServicesSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScroll > 8 && el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState]);

  const scrollByCards = useCallback(
    (direction: "left" | "right") => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-service-card]");
      if (!card) return;
      const distance =
        (card.offsetWidth + CARD_GAP) * (direction === "left" ? -1 : 1);
      el.scrollBy({ left: distance, behavior: "smooth" });
      window.setTimeout(updateScrollState, 320);
    },
    [updateScrollState]
  );

  return (
    <section id="services" className="py-20 sm:py-24 bg-app-bg dark:bg-dark overflow-hidden">
      <SiteContainer className="mb-10 sm:mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.029em] dark:text-white">
            Our services
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Premium private hire from Castleford — airports, ferry ports, theme parks, and business travel.
          </p>
        </div>
      </SiteContainer>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="services-carousel flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SERVICES.map((service) => (
            <article
              key={service.id}
              data-service-card
              className="group relative flex w-[min(78vw,304px)] sm:w-[320px] lg:w-[336px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] min-h-[500px] sm:min-h-[560px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]"
            >
              <Image
                src={service.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 78vw, 336px"
                priority={service.id === "airport-transfers"}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/55" />

              <div className="relative z-10 flex flex-col p-7 sm:p-8">
                <h3 className="text-[1.75rem] sm:text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] text-white">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-[30ch] text-[0.95rem] sm:text-base leading-relaxed text-white/85">
                  {service.teaser}
                </p>
                <Link
                  href={service.href}
                  className={`mt-6 inline-flex w-fit items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity ${service.buttonClass}`}
                >
                  {service.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <SiteContainer className="mt-6 sm:mt-8">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => scrollByCards("left")}
              disabled={!canScrollLeft}
              aria-label="Previous service"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-dark-elevated text-dark dark:text-white transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards("right")}
              disabled={!canScrollRight}
              aria-label="Next service"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-dark-elevated text-dark dark:text-white transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </SiteContainer>
      </div>
    </section>
  );
}
