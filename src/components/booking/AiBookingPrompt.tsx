"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { SuggestionChips } from "@/components/booking/SuggestionChips";
import {
  applySuggestion,
  applyTypedInput,
  buildSummaryLines,
  createInitialConversationState,
  filterSuggestions,
  getCurrentPrompt,
  goBack,
  isReadyToHandoff,
} from "@/lib/booking-conversation/engine";
import type { ConversationState } from "@/lib/booking-conversation/types";
import { saveBookingDraft } from "@/lib/booking-wizard/draft";

export function AiBookingPrompt() {
  const router = useRouter();
  const [state, setState] = useState<ConversationState>(() => createInitialConversationState());
  const [input, setInput] = useState("");
  const [handoffLoading, setHandoffLoading] = useState(false);

  const prompt = useMemo(() => getCurrentPrompt(state), [state]);
  const filteredSuggestions = useMemo(
    () => filterSuggestions(prompt.suggestions, input),
    [prompt.suggestions, input]
  );
  const summaryLines = useMemo(
    () => (prompt.step === "summary" ? buildSummaryLines(state.draft) : []),
    [prompt.step, state.draft]
  );

  function handleSuggestionSelect(id: string) {
    const suggestion = prompt.suggestions.find((item) => item.id === id);
    if (!suggestion) return;

    if (prompt.step === "summary" && suggestion.value === "continue") {
      void handleContinue();
      return;
    }

    setState((prev) => applySuggestion(prev, suggestion));
    setInput("");
  }

  async function handleContinue() {
    setHandoffLoading(true);
    const { stepPartyConfirmed: _party, hubConfirmed: _hub, ...draft } = state.draft;
    saveBookingDraft({ ...draft, source: "ai" });
    router.push("/book?from=ai");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    if (prompt.step === "summary") return;

    const matched = filteredSuggestions.length === 1 ? filteredSuggestions[0] : null;
    if (matched && prompt.suggestions.length > 1) {
      handleSuggestionSelect(matched.id);
      return;
    }

    const next = applyTypedInput(state, trimmed);
    if (next !== state) {
      setState(next);
      setInput("");
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-gray-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-dark-elevated/95 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand dark:text-brand-end">
        <Sparkles className="h-4 w-4" />
        AI booking assistant
      </div>

      <div className="mb-4 max-h-48 space-y-2 overflow-y-auto pr-1">
        {state.messages.slice(-6).map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === "assistant"
                ? "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-100"
                : "ml-auto bg-brand-light/50 text-gray-900 dark:bg-brand/15 dark:text-white"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {prompt.step === "summary" && summaryLines.length > 0 && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
          <ul className="space-y-1 text-gray-700 dark:text-gray-200">
            {summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {prompt.estimatedPrice != null && (
            <p className="mt-3 text-base font-bold text-brand dark:text-brand-end">
              Estimated from £{prompt.estimatedPrice}
            </p>
          )}
        </div>
      )}

      {prompt.estimatedPrice != null && prompt.step !== "summary" && (
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Estimated from <span className="font-semibold text-brand">£{prompt.estimatedPrice}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          {prompt.showBack && (
            <button
              type="button"
              onClick={() => {
                setState((prev) => goBack(prev));
                setInput("");
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-white/15 dark:text-gray-300"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={prompt.inputPlaceholder}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/15 dark:bg-dark dark:text-white"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={handoffLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Send"
          >
            {handoffLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        <SuggestionChips
          suggestions={filteredSuggestions}
          onSelect={handleSuggestionSelect}
          disabled={handoffLoading}
        />
      </form>

      {isReadyToHandoff(state) && (
        <button
          type="button"
          disabled={handoffLoading}
          onClick={() => void handleContinue()}
          className="mt-4 w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {handoffLoading ? "Opening booking…" : "Continue to book"}
        </button>
      )}
    </div>
  );
}
