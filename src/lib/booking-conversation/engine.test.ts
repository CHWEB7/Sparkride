import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySuggestion,
  applyTypedInput,
  createInitialConversationState,
  filterSuggestions,
  isReadyToHandoff,
  resolveConversationStep,
} from "./engine.ts";

describe("booking conversation engine", () => {
  it("starts on journey step", () => {
    const state = createInitialConversationState();
    assert.equal(resolveConversationStep(state.draft), "journey");
    assert.equal(state.messages[0]?.text, "Do you want a single or return journey?");
  });

  it("advances from journey to service", () => {
    const state = createInitialConversationState();
    const next = applySuggestion(state, {
      id: "single",
      label: "Single journey",
      value: "SINGLE",
    });
    assert.equal(next.draft.journeyType, "SINGLE");
    assert.equal(resolveConversationStep(next.draft), "service");
  });

  it("filters hub suggestions by query", () => {
    const state = createInitialConversationState();
    let next = applySuggestion(state, {
      id: "single",
      label: "Single journey",
      value: "SINGLE",
    });
    next = applySuggestion(next, {
      id: "airport",
      label: "Airport transfer",
      value: "AIRPORT_TRANSFER",
    });
    next = applySuggestion(next, {
      id: "to",
      label: "To airport",
      value: "TO_AIRPORT",
    });

    const hubs = filterSuggestions(
      [
        { id: "MAN", label: "MAN — Manchester", value: "MAN" },
        { id: "LBA", label: "LBA — Leeds Bradford", value: "LBA" },
      ],
      "manchester"
    );
    assert.equal(hubs.length, 1);
    assert.equal(hubs[0]?.value, "MAN");
  });

  it("parses typed return journey", () => {
    const state = createInitialConversationState();
    const next = applyTypedInput(state, "return trip");
    assert.equal(next.draft.journeyType, "RETURN");
    assert.equal(resolveConversationStep(next.draft), "service");
  });

  it("reaches summary after full chip flow", () => {
    let state = createInitialConversationState();
    state = applySuggestion(state, {
      id: "single",
      label: "Single journey",
      value: "SINGLE",
    });
    state = applySuggestion(state, {
      id: "airport",
      label: "Airport transfer",
      value: "AIRPORT_TRANSFER",
    });
    state = applySuggestion(state, {
      id: "to",
      label: "To airport",
      value: "TO_AIRPORT",
    });
    state = applySuggestion(state, {
      id: "LBA",
      label: "LBA — Leeds Bradford",
      value: "LBA",
    });
    state = applyTypedInput(state, "12 High Street, Castleford");
    state = applyTypedInput(state, "tomorrow 8am");
    state = applySuggestion(state, {
      id: "p2l2",
      label: "2 passengers, 2 bags",
      value: "2|2",
    });

    assert.equal(resolveConversationStep(state.draft), "summary");
    assert.equal(isReadyToHandoff(state), true);
  });
});
