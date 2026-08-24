type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
  title?: string;
};

/**
 * Interlocking dual-hexagon mark that reads as ∞.
 * Stroke-based so it scales cleanly next to the wordmark.
 */
function HostMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      {/* Continuous infinity path with hexagonal facets */}
      <path
        d="
          M18 4
          L30 4
          L38 18
          L30 32
          L18 32
          L10 18
          Z
        "
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="
          M34 4
          L46 4
          L54 18
          L46 32
          L34 32
          L26 18
          Z
        "
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Hostfinity lockup: lowercase "host" + mint hexagon-infinity mark.
 */
export function Logo({
  className = "",
  variant = "full",
  title = "Hostfinity",
}: LogoProps) {
  if (variant === "mark") {
    return (
      <span className={`inline-flex text-brand-mint ${className}`} title={title}>
        <HostMark className="h-[1em] w-auto" />
        <span className="sr-only">{title}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-[0.22em] leading-none ${className}`}
      title={title}
    >
      <span className="font-display text-[1em] font-semibold tracking-[-0.045em] text-white lowercase">
        host
      </span>
      <span className="text-brand-mint translate-y-[0.04em]">
        <HostMark className="h-[0.88em] w-auto" />
      </span>
      <span className="sr-only">{title}</span>
    </span>
  );
}
