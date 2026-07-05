"use client";

type SuggestionChipsProps = {
  suggestions: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="listbox"
      aria-label="Suggested answers"
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          role="option"
          disabled={disabled}
          onClick={() => onSelect(suggestion.id)}
          className="shrink-0 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-brand hover:bg-brand-light/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-dark-elevated dark:text-gray-100 dark:hover:border-brand-end dark:hover:bg-brand/10 dark:hover:text-brand-end"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
