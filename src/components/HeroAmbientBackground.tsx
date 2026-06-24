"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  twinkle: number;
  twinkleSpeed: number;
};

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.2 + 0.4,
    opacity: Math.random() * 0.55 + 0.15,
    speedX: (Math.random() - 0.5) * 0.38,
    speedY: (Math.random() - 0.5) * 0.28,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.04 + 0.018,
  }));
}

export function HeroAmbientBackground({ forceDark = false }: { forceDark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(
        Math.floor((width * height) / 7500),
        width,
        height
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const isDark =
        forceDark || document.documentElement.classList.contains("dark");
      const dustColor = isDark ? "255, 255, 255" : "106, 104, 222";

      for (const p of particlesRef.current) {
        if (!reduceMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.twinkle += p.twinkleSpeed;

          if (p.x < -4) p.x = width + 4;
          if (p.x > width + 4) p.x = -4;
          if (p.y < -4) p.y = height + 4;
          if (p.y > height + 4) p.y = -4;
        }

        const twinkle = 0.55 + Math.sin(p.twinkle) * 0.45;
        const alpha = p.opacity * twinkle * (isDark ? 1 : 0.65);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dustColor}, ${alpha})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [forceDark]);

  const ambientClass = forceDark ? "hero-ambient hero-ambient--forced-dark" : "hero-ambient";

  return (
    <div className={`${ambientClass} absolute inset-0 overflow-hidden`} aria-hidden>
      <div className="hero-ambient-gradient" />
      <div className="hero-ambient-orb hero-ambient-orb--1" />
      <div className="hero-ambient-orb hero-ambient-orb--2" />
      <div className="hero-ambient-orb hero-ambient-orb--3" />
      <div className="hero-ambient-orb hero-ambient-orb--4" />
      <div className="hero-ambient-orb hero-ambient-orb--5" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
      <div className="hero-ambient-vignette" />
      <div className="hero-ambient-readability" />
    </div>
  );
}
