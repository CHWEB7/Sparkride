"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteContainer } from "@/components/SiteContainer";
import { SERVICES } from "@/lib/services";

const CARD_GAP = 16;
const FERRY_INDEX = SERVICES.findIndex((service) => service.id === "ferry-ports");

export function ServicesSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [leadSpacer, setLeadSpacer] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScroll > 8 && el.scrollLeft < maxScroll - 8);
  }, []);

  const layoutCarousel = useCallback(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const firstCard = track.querySelector<HTMLElement>("[data-service-card]");
    if (!firstCard || FERRY_INDEX < 0) return;

    const cardWidth = firstCard.offsetWidth;
    if (!cardWidth) return;

    const paddingLeft = Number.parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
    const ferryCenter =
      FERRY_INDEX * (cardWidth + CARD_GAP) + cardWidth * 0.5;

    const spacer = Math.round(scroller.clientWidth - paddingLeft - ferryCenter);
    const nextSpacer = Math.max(0, spacer);
    setLeadSpacer((prev) => (prev === nextSpacer ? prev : nextSpacer));

    requestAnimationFrame(() => {
      if (nextSpacer === 0) {
        const ferryCard = track.querySelector<HTMLElement>(
          '[data-service-id="ferry-ports"]'
        );
        if (ferryCard) {
          scroller.scrollLeft = Math.max(
            0,
            ferryCard.offsetLeft + ferryCard.offsetWidth * 0.5 - scroller.clientWidth
          );
        }
      } else {
        scroller.scrollLeft = 0;
      }
      updateScrollState();
    });
  }, [updateScrollState]);

  useEffect(() => {
    layoutCarousel();

    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const observer = new ResizeObserver(layoutCarousel);
    observer.observe(scroller);
    observer.observe(track);

    window.addEventListener("load", layoutCarousel);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", layoutCarousel);
    };
  }, [layoutCarousel]);

  const scrollByCards = useCallback(
    (direction: "left" | "right") => {
      const el = scrollerRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const card = track.querySelector<HTMLElement>("[data-service-card]");
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
          className="services-carousel overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div ref={trackRef} className="flex w-max gap-4">
            <div
              className="shrink-0"
              style={{ width: leadSpacer }}
              aria-hidden
            />

            {SERVICES.map((service) => (
              <article
                key={service.id}
                data-service-card
                data-service-id={service.id}
                className="group relative flex w-[min(78vw,304px)] sm:w-[320px] lg:w-[336px] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] min-h-[500px] sm:min-h-[560px] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]"
              >
                <Image
                  src={service.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 78vw, 336px"
                  priority={service.id === "airport-transfers"}
                  onLoad={layoutCarousel}
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

            <div className="services-carousel-spacer shrink-0" aria-hidden />
          </div>
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
