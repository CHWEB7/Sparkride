import type { ReactNode } from "react";

export function SiteContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${className}`}>{children}</div>
  );
}
