"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { height: 32, width: 146, icon: "w-4 h-4", box: "w-9 h-9", text: "text-lg" },
  md: {
    height: 40,
    width: 182,
    icon: "w-4 h-4",
    box: "w-10 h-10",
    text: "text-xl",
    mobileHeight: 32,
  },
  lg: { height: 48, width: 219, icon: "w-5 h-5", box: "w-12 h-12", text: "text-2xl" },
  xl: { height: 56, width: 255, icon: "w-6 h-6", box: "w-14 h-14", text: "text-3xl" },
  header: { height: 42, width: 191, icon: "w-5 h-5", box: "w-11 h-11", text: "text-2xl", mobileHeight: 32, mobileWidth: 146 },
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
  const isHeader = size === "header";
  const mobileHeight = "mobileHeight" in s ? s.mobileHeight : s.height;
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
      className={`w-auto max-w-none object-contain object-left shrink-0 ${
        isHeader || "mobileHeight" in s
          ? "h-[var(--logo-mobile-h)] sm:h-[var(--logo-h)]"
          : "h-[var(--logo-h)]"
      }`}
      style={
        {
          "--logo-h": `${s.height}px`,
          "--logo-mobile-h": `${mobileHeight}px`,
        } as React.CSSProperties
      }
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
    <Link
      href={href}
      className={`inline-flex items-center ${
        size === "header"
          ? "min-h-[32px] sm:min-h-[42px]"
          : size === "md"
            ? "min-h-8 sm:min-h-10"
            : ""
      } ${className}`}
      style={
        size === "header" || size === "md"
          ? undefined
          : { minHeight: `${s.height}px` }
      }
    >
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
