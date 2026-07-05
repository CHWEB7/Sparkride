import { addDays, format, nextDay, parse } from "date-fns";
import { estimatePrice } from "@/lib/airports";
import {
  applyPickupAddress,
  applyServiceSelection,
  applyWizardFieldUpdate,
  INITIAL_WIZARD_FORM,
  isHubServiceType,
  type WizardForm,
} from "@/lib/booking-wizard/steps";
import {
  formatHubLabel,
  getDirectionOptions,
  getHub,
  getHubList,
  getHubPickerLabel,
  getServiceLabel,
  isHubTransfer,
  PORT_TRANSFER,
} from "@/lib/hubs";
import type {
  ConversationMessage,
  ConversationPrompt,
  ConversationState,
  ConversationStepId,
  ConversationSuggestion,
} from "@/lib/booking-conversation/types";

const COMMON_TIMES = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

const SERVICE_SUGGESTIONS: ConversationSuggestion[] = [
  { id: "airport", label: "Airport transfer", value: "AIRPORT_TRANSFER" },
  { id: "port", label: "Ferry & cruise port", value: PORT_TRANSFER },
  { id: "prebooked", label: "Pre-booked journey", value: "PRE_BOOKED" },
];

export function createInitialConversationState(): ConversationState {
  return {
    step: "journey",
    draft: { ...INITIAL_WIZARD_FORM },
    messages: [
      {
        role: "assistant",
        text: "Do you want a single or return journey?",
      },
    ],
  };
}

export function resolveConversationStep(draft: WizardForm): ConversationStepId {
  if (!draft.journeyType) return "journey";
  if (!draft.serviceType) return "service";
  if (draft.journeyType === "SINGLE" && isHubTransfer(draft.serviceType) && !draft.tripType) {
    return "direction";
  }
  if (isHubTransfer(draft.serviceType) && !draft.hubConfirmed) return "hub";
  if (!draft.pickupAddress.trim()) return "pickupAddress";
  if (
    draft.serviceType === "PRE_BOOKED" &&
    draft.journeyType !== "RETURN" &&
    !draft.dropoffAddress.trim()
  ) {
    return "dropoffAddress";
  }
  if (!draft.pickupDate || !draft.pickupTime) return "schedule";
  if (draft.journeyType === "RETURN" && (!draft.returnDate || !draft.returnTime)) {
    return "returnSchedule";
  }
  if (!draft.stepPartyConfirmed) return "party";
  return "summary";
}

function getStepMessage(step: ConversationStepId, draft: WizardForm): string {
  switch (step) {
    case "journey":
      return "Do you want a single or return journey?";
    case "service":
      return "What type of transfer do you need?";
    case "direction":
      return `Is this to or from the ${getHubPickerLabel(draft.serviceType).toLowerCase()}?`;
    case "hub":
      return `Which ${getHubPickerLabel(draft.serviceType).toLowerCase()}?`;
    case "pickupAddress":
      if (draft.journeyType === "RETURN" || draft.tripType === "TO_AIRPORT") {
        return "What's your pickup address? (home or hotel)";
      }
      if (draft.tripType === "FROM_AIRPORT") {
        return "Where should we drop you off?";
      }
      return "What's your pickup address?";
    case "dropoffAddress":
      return "Where is your drop-off address?";
    case "schedule":
      return "When should we pick you up? Choose a date and time.";
    case "returnSchedule":
      return "When is your return pickup? Choose a date and time.";
    case "party":
      return "How many passengers and bags are travelling?";
    case "summary":
      return "Here's your trip summary. Continue to choose a driver and complete your booking.";
    default:
      return "How can I help with your booking?";
  }
}

function getStepPlaceholder(step: ConversationStepId, draft: WizardForm): string {
  switch (step) {
    case "pickupAddress":
    case "dropoffAddress":
      return "e.g. 12 High Street, Castleford WF10 1AA";
    case "schedule":
    case "returnSchedule":
      return "e.g. Friday 6am or Tomorrow 10:00";
    case "party":
      return "e.g. 2 passengers, 3 bags";
    default:
      return "Type to filter options or press Enter";
  }
}

function buildSuggestions(step: ConversationStepId, draft: WizardForm): ConversationSuggestion[] {
  switch (step) {
    case "journey":
      return [
        { id: "single", label: "Single journey", value: "SINGLE" },
        { id: "return", label: "Return journey", value: "RETURN" },
      ];
    case "service":
      return SERVICE_SUGGESTIONS;
    case "direction":
      return getDirectionOptions(draft.serviceType).map((option) => ({
        id: option.value,
        label: option.label,
        value: option.value,
      }));
    case "hub":
      return getHubList(draft.serviceType).map((hub) => ({
        id: hub.code,
        label: `${hub.code} — ${hub.name}`,
        value: hub.code,
      }));
    case "schedule":
    case "returnSchedule":
      return buildScheduleSuggestions();
    case "party":
      return [
        { id: "p1l1", label: "1 passenger, 1 bag", value: "1|1" },
        { id: "p2l2", label: "2 passengers, 2 bags", value: "2|2" },
        { id: "p3l3", label: "3 passengers, 3 bags", value: "3|3" },
        { id: "p4l4", label: "4 passengers, 4 bags", value: "4|4" },
      ];
    case "summary":
      return [
        { id: "continue", label: "Continue to book", value: "continue" },
        { id: "restart", label: "Start over", value: "restart" },
      ];
    default:
      return [];
  }
}

function buildScheduleSuggestions(): ConversationSuggestion[] {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const suggestions: ConversationSuggestion[] = [
    {
      id: "today-08",
      label: `Today ${formatTimeLabel("08:00")}`,
      value: `${format(today, "yyyy-MM-dd")}|08:00`,
    },
    {
      id: "tomorrow-08",
      label: `Tomorrow ${formatTimeLabel("08:00")}`,
      value: `${format(tomorrow, "yyyy-MM-dd")}|08:00`,
    },
    {
      id: "tomorrow-10",
      label: `Tomorrow ${formatTimeLabel("10:00")}`,
      value: `${format(tomorrow, "yyyy-MM-dd")}|10:00`,
    },
  ];

  for (const time of COMMON_TIMES.slice(2, 5)) {
    suggestions.push({
      id: `tomorrow-${time}`,
      label: `Tomorrow ${formatTimeLabel(time)}`,
      value: `${format(tomorrow, "yyyy-MM-dd")}|${time}`,
    });
  }

  return suggestions;
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

export function filterSuggestions(
  suggestions: ConversationSuggestion[],
  query: string
): ConversationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return suggestions;
  return suggestions.filter(
    (suggestion) =>
      suggestion.label.toLowerCase().includes(q) ||
      suggestion.value.toLowerCase().includes(q)
  );
}

export function getEstimatedPrice(draft: WizardForm): number | null {
  if (!draft.journeyType || !draft.serviceType) return null;
  return estimatePrice(
    draft.vehicleType,
    draft.tripType,
    draft.journeyType,
    draft.serviceType,
    draft.airportCode
  );
}

export function getCurrentPrompt(state: ConversationState): ConversationPrompt {
  const step = resolveConversationStep(state.draft);
  return {
    message: getStepMessage(step, state.draft),
    step,
    suggestions: buildSuggestions(step, state.draft),
    inputPlaceholder: getStepPlaceholder(step, state.draft),
    showBack: state.messages.some((message) => message.role === "user"),
    estimatedPrice: getEstimatedPrice(state.draft),
  };
}

function appendMessages(
  state: ConversationState,
  userText: string,
  nextDraft: WizardForm
): ConversationMessage[] {
  const nextStep = resolveConversationStep(nextDraft);
  const messages: ConversationMessage[] = [
    ...state.messages,
    { role: "user", text: userText },
  ];

  if (nextStep !== state.step || nextStep === "summary") {
    messages.push({ role: "assistant", text: getStepMessage(nextStep, nextDraft) });
  }

  return messages;
}

export function applySuggestion(
  state: ConversationState,
  suggestion: ConversationSuggestion
): ConversationState {
  if (state.step === "summary" && suggestion.value === "restart") {
    return createInitialConversationState();
  }
  if (state.step === "summary" && suggestion.value === "continue") {
    return { ...state, step: "summary" };
  }

  const parsed = parseSuggestionAnswer(state.step, suggestion, state.draft);
  if (!parsed) return state;

  return {
    step: resolveConversationStep(parsed.draft),
    draft: parsed.draft,
    messages: appendMessages(state, suggestion.label, parsed.draft),
  };
}

function parseSuggestionAnswer(
  step: ConversationStepId,
  suggestion: ConversationSuggestion,
  draft: WizardForm
): { draft: WizardForm } | null {
  switch (step) {
    case "journey":
      return {
        draft: applyWizardFieldUpdate(draft, "journeyType", suggestion.value),
      };
    case "service":
      return { draft: applyServiceSelection(draft, suggestion.value) };
    case "direction":
      return { draft: applyWizardFieldUpdate(draft, "tripType", suggestion.value) };
    case "hub":
      return {
        draft: {
          ...applyWizardFieldUpdate(draft, "airportCode", suggestion.value),
          hubConfirmed: true,
        },
      };
    case "schedule": {
      const [date, time] = suggestion.value.split("|");
      return {
        draft: {
          ...draft,
          pickupDate: date,
          pickupTime: time,
        },
      };
    }
    case "returnSchedule": {
      const [date, time] = suggestion.value.split("|");
      return {
        draft: {
          ...draft,
          returnDate: date,
          returnTime: time,
        },
      };
    }
    case "party": {
      const [passengers, luggage] = suggestion.value.split("|").map(Number);
      return {
        draft: {
          ...draft,
          passengers,
          luggage,
          stepPartyConfirmed: true,
        },
      };
    }
    default:
      return null;
  }
}

export function parseTypedInput(
  step: ConversationStepId,
  text: string,
  draft: WizardForm
): { draft: WizardForm; label: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  switch (step) {
    case "journey": {
      const lower = trimmed.toLowerCase();
      if (lower.includes("return")) {
        return {
          draft: applyWizardFieldUpdate(draft, "journeyType", "RETURN"),
          label: "Return journey",
        };
      }
      if (lower.includes("single") || lower.includes("one way") || lower.includes("one-way")) {
        return {
          draft: applyWizardFieldUpdate(draft, "journeyType", "SINGLE"),
          label: "Single journey",
        };
      }
      return null;
    }
    case "service": {
      const lower = trimmed.toLowerCase();
      if (lower.includes("airport")) {
        return { draft: applyServiceSelection(draft, "AIRPORT_TRANSFER"), label: "Airport transfer" };
      }
      if (lower.includes("ferry") || lower.includes("cruise") || lower.includes("port")) {
        return {
          draft: applyServiceSelection(draft, PORT_TRANSFER),
          label: "Ferry & cruise port",
        };
      }
      if (lower.includes("pre") || lower.includes("private") || lower.includes("hire")) {
        return {
          draft: applyServiceSelection(draft, "PRE_BOOKED"),
          label: "Pre-booked journey",
        };
      }
      return null;
    }
    case "direction": {
      const lower = trimmed.toLowerCase();
      if (lower.includes("from")) {
        return {
          draft: applyWizardFieldUpdate(draft, "tripType", "FROM_AIRPORT"),
          label: "From airport",
        };
      }
      if (lower.includes("to")) {
        return {
          draft: applyWizardFieldUpdate(draft, "tripType", "TO_AIRPORT"),
          label: "To airport",
        };
      }
      return null;
    }
    case "hub": {
      const hubs = getHubList(draft.serviceType);
      const lower = trimmed.toLowerCase();
      const match =
        hubs.find(
          (hub) =>
            hub.code.toLowerCase() === lower ||
            hub.name.toLowerCase().includes(lower) ||
            hub.city.toLowerCase().includes(lower)
        ) ?? hubs.find((hub) => lower.includes(hub.code.toLowerCase()));
      if (!match) return null;
      return {
        draft: {
          ...applyWizardFieldUpdate(draft, "airportCode", match.code),
          hubConfirmed: true,
        },
        label: `${match.code} — ${match.name}`,
      };
    }
    case "pickupAddress":
      if (trimmed.length < 3) return null;
      return { draft: applyPickupAddress(draft, trimmed), label: trimmed };
    case "dropoffAddress":
      if (trimmed.length < 3) return null;
      return { draft: { ...draft, dropoffAddress: trimmed }, label: trimmed };
    case "schedule":
    case "returnSchedule": {
      const parsed = parseScheduleInput(trimmed);
      if (!parsed) return null;
      if (step === "schedule") {
        return {
          draft: { ...draft, pickupDate: parsed.date, pickupTime: parsed.time },
          label: `${parsed.date} at ${formatTimeLabel(parsed.time)}`,
        };
      }
      return {
        draft: { ...draft, returnDate: parsed.date, returnTime: parsed.time },
        label: `${parsed.date} at ${formatTimeLabel(parsed.time)}`,
      };
    }
    case "party": {
      const passengers = Number(
        trimmed.match(/(\d+)\s*passenger/i)?.[1] ?? trimmed.match(/^(\d+)/)?.[1]
      );
      const luggage = Number(trimmed.match(/(\d+)\s*bag/i)?.[1] ?? passengers);
      if (!passengers || passengers < 1 || passengers > 8) return null;
      return {
        draft: {
          ...draft,
          passengers,
          luggage: Math.min(10, luggage || passengers),
          stepPartyConfirmed: true,
        },
        label: `${passengers} passenger${passengers === 1 ? "" : "s"}, ${luggage || passengers} bag${(luggage || passengers) === 1 ? "" : "s"}`,
      };
    }
    default:
      return null;
  }
}

function parseScheduleInput(text: string): { date: string; time: string } | null {
  const lower = text.toLowerCase();
  const today = new Date();
  let date: Date | null = null;

  if (lower.includes("today")) date = today;
  else if (lower.includes("tomorrow")) date = addDays(today, 1);
  else {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;
    for (let i = 0; i < dayNames.length; i++) {
      if (lower.includes(dayNames[i])) {
        date = nextDay(today, i as 0 | 1 | 2 | 3 | 4 | 5 | 6);
        break;
      }
    }
  }

  if (!date) {
    const iso = text.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (iso) {
      const parsed = parse(iso, "yyyy-MM-dd", new Date());
      if (!Number.isNaN(parsed.getTime())) date = parsed;
    }
  }

  const timeMatch =
    text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i) ??
    text.match(/(\d{1,2})\s*(am|pm)/i);
  if (!date || !timeMatch) return null;

  let hour = Number(timeMatch[1]);
  const minutes = timeMatch[2] && /^\d+$/.test(timeMatch[2]) ? Number(timeMatch[2]) : 0;
  const meridiem = (timeMatch[3] ?? timeMatch[2])?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const time = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { date: format(date, "yyyy-MM-dd"), time };
}

export function applyTypedInput(state: ConversationState, text: string): ConversationState {
  const parsed = parseTypedInput(state.step, text, state.draft);
  if (!parsed) return state;

  return {
    step: resolveConversationStep(parsed.draft),
    draft: parsed.draft,
    messages: appendMessages(state, parsed.label, parsed.draft),
  };
}

export function goBack(state: ConversationState): ConversationState {
  const messages = [...state.messages];
  if (messages.length < 2) return state;

  messages.pop();
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
  if (lastUserIndex >= 0) messages.splice(lastUserIndex);

  const draft = rewindDraft(state.draft, state.step);
  const step = resolveConversationStep(draft);

  return {
    step,
    draft,
    messages: [...messages, { role: "assistant", text: getStepMessage(step, draft) }],
  };
}

function rewindDraft(draft: WizardForm, step: ConversationStepId): WizardForm {
  switch (step) {
    case "summary":
      return { ...draft, stepPartyConfirmed: false };
    case "party":
      return { ...draft, stepPartyConfirmed: false };
    case "returnSchedule":
      return { ...draft, returnDate: "", returnTime: "" };
    case "schedule":
      return { ...draft, pickupDate: "", pickupTime: "" };
    case "dropoffAddress":
      return { ...draft, dropoffAddress: "" };
    case "pickupAddress":
      return { ...draft, pickupAddress: "" };
    case "hub":
      return { ...draft, airportCode: "", hubConfirmed: false };
    case "direction":
      return { ...draft, tripType: "TO_AIRPORT" };
    case "service":
      return { ...INITIAL_WIZARD_FORM, journeyType: draft.journeyType };
    case "journey":
      return { ...INITIAL_WIZARD_FORM };
    default:
      return draft;
  }
}

export function buildSummaryLines(draft: WizardForm): string[] {
  const hub = isHubServiceType(draft.serviceType)
    ? getHub(draft.airportCode, draft.serviceType)
    : undefined;
  const lines = [
    `Journey: ${draft.journeyType === "RETURN" ? "Return" : "Single"}`,
    `Service: ${getServiceLabel(draft.serviceType)}`,
  ];
  if (hub) lines.push(`Hub: ${formatHubLabel(hub, draft.serviceType)}`);
  lines.push(`Pickup: ${draft.pickupAddress}`);
  if (draft.dropoffAddress && draft.serviceType === "PRE_BOOKED") {
    lines.push(`Drop-off: ${draft.dropoffAddress}`);
  }
  lines.push(`Outbound: ${draft.pickupDate} at ${formatTimeLabel(draft.pickupTime)}`);
  if (draft.journeyType === "RETURN") {
    lines.push(`Return: ${draft.returnDate} at ${formatTimeLabel(draft.returnTime)}`);
  }
  lines.push(
    `Party: ${draft.passengers} passenger${draft.passengers === 1 ? "" : "s"}, ${draft.luggage} bag${draft.luggage === 1 ? "" : "s"}`
  );
  return lines;
}

export function isReadyToHandoff(state: ConversationState): boolean {
  return resolveConversationStep(state.draft) === "summary";
}
