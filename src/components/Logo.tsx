"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { height: 28, width: 112, icon: "w-3.5 h-3.5", box: "w-7 h-7", text: "text-lg" },
  md: { height: 32, width: 128, icon: "w-4 h-4", box: "w-8 h-8", text: "text-xl" },
  lg: { height: 40, width: 160, icon: "w-5 h-5", box: "w-10 h-10", text: "text-2xl" },
} as const;

type LogoProps = {
  size?: keyof typeof SIZES;
  showText?: boolean;
  href?: string;
  className?: string;
  light?: boolean;
};

function LogoImage({
  size,
  light,
}: {
  size: keyof typeof SIZES;
  light?: boolean;
}) {
  const s = SIZES[size];
  const [src, setSrc] = useState(light ? "/logo-light.png" : "/logo.png");
  const [useIcon, setUseIcon] = useState(false);

  if (useIcon) {
    return (
      <div
        className={`${s.box} rounded-full bg-brand-gradient flex items-center justify-center shrink-0`}
      >
        <Plane className={`${s.icon} text-white`} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Sparkride"
      width={s.width}
      height={s.height}
      className="h-auto w-auto max-h-[var(--logo-h)] object-contain shrink-0"
      style={{ "--logo-h": `${s.height}px` } as React.CSSProperties}
      priority
      onError={() => {
        if (light && src === "/logo-light.png") {
          setSrc("/logo.png");
          return;
        }
        setUseIcon(true);
      }}
    />
  );
}

export function Logo({
  size = "md",
  showText = false,
  href = "/",
  className = "",
  light = false,
}: LogoProps) {
  const s = SIZES[size];

  const mark = (
    <>
      <LogoImage size={size} light={light} />
      {showText && (
        <span
          className={`${s.text} font-semibold tracking-[-0.02em] ${
            light ? "text-white" : "text-dark dark:text-white"
          }`}
        >
          Sparkride
        </span>
      )}
    </>
  );

  if (!href) {
    return <div className={`flex items-center gap-2 ${className}`}>{mark}</div>;
  }

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      {mark}
    </Link>
  );
}

export function LogoMark({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div className={className}>
      <LogoImage size={size} />
    </div>
  );
}
