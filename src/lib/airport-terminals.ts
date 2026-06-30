export type AirportTerminal = {
  id: string;
  label: string;
};

const AIRPORT_TERMINALS: Record<string, AirportTerminal[]> = {
  LBA: [{ id: "T1", label: "Terminal 1" }],
  MAN: [
    { id: "T1", label: "Terminal 1" },
    { id: "T2", label: "Terminal 2" },
    { id: "T3", label: "Terminal 3" },
  ],
  LPL: [{ id: "MAIN", label: "Main terminal" }],
  EMA: [{ id: "MAIN", label: "Main terminal" }],
  BHX: [
    { id: "T1", label: "Terminal 1" },
    { id: "T2", label: "Terminal 2" },
  ],
  LHR: [
    { id: "T2", label: "Terminal 2" },
    { id: "T3", label: "Terminal 3" },
    { id: "T4", label: "Terminal 4" },
    { id: "T5", label: "Terminal 5" },
  ],
  LGW: [
    { id: "NORTH", label: "North terminal" },
    { id: "SOUTH", label: "South terminal" },
  ],
  STN: [{ id: "MAIN", label: "Main terminal" }],
  LTN: [{ id: "MAIN", label: "Main terminal" }],
  NCL: [{ id: "MAIN", label: "Main terminal" }],
};

export function getAirportTerminals(airportCode: string): AirportTerminal[] {
  return AIRPORT_TERMINALS[airportCode] ?? [{ id: "MAIN", label: "Main terminal" }];
}

export function getAirportTerminalLabel(airportCode: string, terminalId: string): string {
  const terminal = getAirportTerminals(airportCode).find((item) => item.id === terminalId);
  return terminal?.label ?? terminalId;
}
