import { AiBookingPrompt } from "@/components/booking/AiBookingPrompt";

export function AiBookingHero() {
  return (
    <div className="mt-8 sm:mt-10">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted dark:text-gray-300">
        Book your trip in seconds
      </p>
      <AiBookingPrompt />
    </div>
  );
}
