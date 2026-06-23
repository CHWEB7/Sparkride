import { isBookableHub } from "./hub-pricing";

export type CruiseTerminal = {
  code: string;
  name: string;
  city: string;
  region: string;
};

const ALL_CRUISE_TERMINALS: CruiseTerminal[] = [
  { code: "SOU", name: "Southampton", city: "Southampton", region: "Hampshire" },
  { code: "DCT", name: "Dover Cruise Terminal", city: "Dover", region: "Kent" },
  { code: "LCT", name: "Liverpool Cruise Terminal", city: "Liverpool", region: "North West" },
  { code: "PRT", name: "Port of Tyne", city: "Newcastle", region: "North East" },
];

export const CRUISE_TERMINALS = ALL_CRUISE_TERMINALS.filter((terminal) =>
  isBookableHub(terminal.code)
);

export function getCruiseTerminal(code: string): CruiseTerminal | undefined {
  return CRUISE_TERMINALS.find((terminal) => terminal.code === code);
}
