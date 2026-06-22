export type CruiseTerminal = {
  code: string;
  name: string;
  city: string;
  region: string;
};

export const CRUISE_TERMINALS: CruiseTerminal[] = [
  { code: "SOU", name: "Southampton", city: "Southampton", region: "Hampshire" },
  { code: "DCT", name: "Dover Cruise Terminal", city: "Dover", region: "Kent" },
  { code: "LCT", name: "Liverpool Cruise Terminal", city: "Liverpool", region: "North West" },
  { code: "GRK", name: "Greenock", city: "Glasgow", region: "Scotland" },
  { code: "PRT", name: "Port of Tyne", city: "Newcastle", region: "North East" },
  { code: "BEL", name: "Belfast", city: "Belfast", region: "Northern Ireland" },
];

export function getCruiseTerminal(code: string): CruiseTerminal | undefined {
  return CRUISE_TERMINALS.find((terminal) => terminal.code === code);
}
