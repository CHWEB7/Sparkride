import { formatFare, type FareSection } from "@/lib/hub-pricing";

export function FaresTable({ section }: { section: FareSection }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-dark dark:text-white">
        {section.title}
      </h2>

      <div className="mt-5 border-y border-black/8 dark:border-white/10">
        <div className="hidden sm:grid sm:grid-cols-[1fr_7rem_7rem] gap-4 px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted border-b border-black/8 dark:border-white/10">
          <span>Destination</span>
          <span className="text-right">Single</span>
          <span className="text-right">Return</span>
        </div>

        {section.rows.map((row, index) => (
          <div
            key={row.code}
            className={[
              "flex flex-wrap sm:grid sm:grid-cols-[1fr_7rem_7rem] gap-x-4 gap-y-1 items-baseline px-4 sm:px-6 py-4 sm:py-5 border-b border-black/8 dark:border-white/10",
              index === section.rows.length - 1 ? "border-b-0" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="w-full sm:w-auto text-base font-semibold tracking-[-0.02em] text-dark dark:text-white">
              {row.name}
            </span>
            <span className="text-sm text-muted sm:hidden">Single</span>
            <span className="text-base font-semibold text-brand sm:text-right">
              {formatFare(row.single)}
            </span>
            <span className="text-sm text-muted sm:hidden">Return</span>
            <span className="text-base font-semibold text-dark dark:text-white sm:text-right">
              {formatFare(row.return)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
