"use client";

type BookingSectionNextButtonProps = {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
};

export function BookingSectionNextButton({
  onClick,
  label = "Next",
  disabled = false,
}: BookingSectionNextButtonProps) {
  return (
    <div className="mt-5 flex justify-end border-t border-gray-200 pt-4 dark:border-white/10">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex min-w-[8.5rem] items-center justify-center bg-brand-gradient-animated px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}

export function BookingSectionError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>;
}
