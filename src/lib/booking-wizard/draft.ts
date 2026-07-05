import { INITIAL_WIZARD_FORM, type WizardForm } from "@/lib/booking-wizard/steps";

export const BOOKING_DRAFT_STORAGE_KEY = "sparkride-booking-draft";
export const BOOKING_DRAFT_SOURCE_KEY = "sparkride-booking-draft-source";

export type BookingDraft = Partial<WizardForm> & {
  source?: "ai" | "manual";
};

export function mergeDraftWithDefaults(draft: BookingDraft): WizardForm {
  return { ...INITIAL_WIZARD_FORM, ...draft };
}

export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    if (draft.source) {
      localStorage.setItem(BOOKING_DRAFT_SOURCE_KEY, draft.source);
    }
  } catch {
    // ignore quota errors
  }
}

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function loadBookingDraftSource(): "ai" | "manual" | null {
  if (typeof window === "undefined") return null;
  const source = localStorage.getItem(BOOKING_DRAFT_SOURCE_KEY);
  if (source === "ai" || source === "manual") return source;
  return null;
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
  localStorage.removeItem(BOOKING_DRAFT_SOURCE_KEY);
}

export function hasBookingDraft(): boolean {
  return loadBookingDraft() !== null;
}
