import Link from "next/link";
import { Plane } from "lucide-react";

const SIZES = {
  sm: { box: "w-7 h-7", icon: "w-3.5 h-3.5", text: "text-lg" },
  md: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-xl" },
  lg: { box: "w-10 h-10", icon: "w-5 h-5", text: "text-2xl" },
} as const;

type LogoProps = {
  size?: keyof typeof SIZES;
  showText?: boolean;
  href?: string;
  className?: string;
  light?: boolean;
};

export function Logo({ size = "md", showText = true, href = "/", className = "", light = false }: LogoProps) {
  const s = SIZES[size];

  const mark = (
    <>
      <div
        className={`${s.box} rounded-full bg-brand-gradient flex items-center justify-center shrink-0`}
      >
        <Plane className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <span
          className={`${s.text} font-semibold tracking-[-0.02em] ${
            light ? "text-white" : "dark:text-white"
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
  const s = SIZES[size];
  return (
    <div
      className={`${s.box} rounded-full bg-brand-gradient flex items-center justify-center shrink-0 ${className}`}
    >
      <Plane className={`${s.icon} text-white`} />
    </div>
  );
}
