"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, Car, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  cardClass: string;
  buttonClass: string;
  iconWrapClass: string;
};

const SERVICES: Service[] = [
  {
    id: "airport-transfers",
    title: "Airport transfers",
    description: "Fixed-price rides to and from all major UK airports. Professional drivers, flight tracking, and 24/7 availability.",
    href: "/book",
    cta: "Book a transfer",
    icon: Plane,
    cardClass:
      "bg-dark text-white border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]",
    buttonClass: "bg-brand-gradient text-white hover:opacity-90",
    iconWrapClass: "bg-white/10 text-brand-end",
  },
  {
    id: "private-hire",
    title: "Private hire",
    description: "Pre-booked journeys for nights out, events, and local travel. Saloon, estate, MPV and executive vehicles.",
    href: "/book",
    cta: "Reserve a ride",
    icon: Car,
    cardClass:
      "bg-brand-gradient text-white shadow-[0_24px_60px_-20px_rgba(106,104,222,0.55)]",
    buttonClass: "bg-white text-dark hover:bg-white/90",
    iconWrapClass: "bg-white/20 text-white",
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Account travel for teams and clients. Centralised billing, priority booking, and dedicated support for your business.",
    href: "/book",
    cta: "Corporate travel",
    icon: Building2,
    cardClass:
      "bg-white dark:bg-dark-elevated text-dark dark:text-white border border-black/5 dark:border-white/10 shadow-[0_24px_60px_-24px_rgba(106,104,222,0.25)]",
    buttonClass:
      "bg-dark dark:bg-white text-white dark:text-dark hover:opacity-90",
    iconWrapClass: "bg-brand-light dark:bg-brand/10 text-brand",
  },
];

const CARD_WIDTH = 320;
const CARD_GAP = 20;

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
      const distance = (CARD_WIDTH + CARD_GAP) * (direction === "left" ? -1 : 1);
      el.scrollBy({ left: distance, behavior: "smooth" });
      window.setTimeout(updateScrollState, 320);
    },
    [updateScrollState]
  );

  return (
    <section id="services" className="py-24 bg-app-bg dark:bg-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.029em] dark:text-white">
            Our services
          </h2>
          <p className="mt-4 text-lg text-muted">
            Premium private hire from Castleford — airport runs, local journeys, and business travel.
          </p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto px-1 sm:px-0 pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center"
        >
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className={`group relative flex w-[min(82vw,320px)] shrink-0 snap-center flex-col rounded-[28px] p-7 min-h-[480px] transition-transform duration-300 hover:-translate-y-1 ${service.cardClass}`}
            >
              <div className="relative z-10">
                <h3 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.02em]">
                  {service.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed opacity-85">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity ${service.buttonClass}`}
                >
                  {service.cta}
                </Link>
              </div>

              <div className="mt-auto pt-10 relative z-10 flex justify-center">
                <div
                  className={`flex h-36 w-36 items-center justify-center rounded-[24px] ${service.iconWrapClass}`}
                >
                  <service.icon className="h-16 w-16" strokeWidth={1.25} />
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 rounded-b-[28px] opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,255,255,0.35) 0%, transparent 70%)",
                }}
              />
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3 sm:mt-10">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            disabled={!canScrollLeft}
            aria-label="Previous service"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-dark-elevated text-dark dark:text-white transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            disabled={!canScrollRight}
            aria-label="Next service"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-dark-elevated text-dark dark:text-white transition-opacity disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
