import Link from "next/link";
import type { ReactNode } from "react";

type AnimatedGradientButtonProps = {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

export function AnimatedGradientButton({
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  children,
}: AnimatedGradientButtonProps) {
  const classes = `inline-flex items-center justify-center px-5 py-2.5 bg-brand-gradient-animated text-white font-medium tracking-[-0.01em] rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
