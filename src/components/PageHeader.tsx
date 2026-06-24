import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-8 lg:mb-10">
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.029em] dark:text-white leading-[1.1]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-muted font-normal tracking-[-0.01em] max-w-2xl">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
