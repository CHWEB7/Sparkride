import type { WizardForm } from "@/lib/booking-wizard/steps";

export type ConversationStepId =
  | "journey"
  | "service"
  | "direction"
  | "hub"
  | "pickupAddress"
  | "dropoffAddress"
  | "schedule"
  | "returnSchedule"
  | "party"
  | "summary";

export type ConversationRole = "assistant" | "user";

export type ConversationMessage = {
  role: ConversationRole;
  text: string;
};

export type ConversationSuggestion = {
  id: string;
  label: string;
  value: string;
};

export type ConversationState = {
  step: ConversationStepId;
  draft: WizardForm;
  messages: ConversationMessage[];
};

export type ConversationPrompt = {
  message: string;
  step: ConversationStepId;
  suggestions: ConversationSuggestion[];
  inputPlaceholder: string;
  showBack: boolean;
  estimatedPrice: number | null;
};
