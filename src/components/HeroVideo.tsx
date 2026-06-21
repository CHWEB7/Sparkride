"use client";

import { useEffect, useRef, useState } from "react";

const HERO_CLIPS = [
  {
    src: "https://assets.mixkit.co/videos/preview/mixkit-electric-car-at-charging-station-50380-large.mp4",
    fallback: "/videos/hero-charge.mp4",
  },
  {
    src: "https://assets.mixkit.co/videos/preview/mixkit-driving-a-green-electric-car-50378-large.mp4",
    fallback: "/videos/hero-drive.mp4",
  },
] as const;

export function HeroVideo() {
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const video = refs.current[active];
    if (!video) return;

    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {});

    const onEnded = () => setActive((current) => (current + 1) % HERO_CLIPS.length);
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [active, reduceMotion]);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-[#1a2332] to-brand-start/40" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_CLIPS.map((clip, index) => (
        <video
          key={clip.src}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          muted
          playsInline
          preload={index === 0 ? "auto" : "metadata"}
          poster=""
          aria-hidden
        >
          <source src={clip.src} type="video/mp4" />
          <source src={clip.fallback} type="video/mp4" />
        </video>
      ))}

      {/* Bolt-style colour grade + left-side readability */}
      <div className="absolute inset-0 bg-[#0a1628]/35 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/70 to-dark/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-dark/25" />
    </div>
  );
}
