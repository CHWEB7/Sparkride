"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { height: 40, width: 160, icon: "w-4 h-4", box: "w-9 h-9", text: "text-lg" },
  md: { height: 48, width: 192, icon: "w-4 h-4", box: "w-10 h-10", text: "text-xl" },
  lg: { height: 56, width: 224, icon: "w-5 h-5", box: "w-12 h-12", text: "text-2xl" },
  xl: { height: 68, width: 272, icon: "w-6 h-6", box: "w-14 h-14", text: "text-3xl" },
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
