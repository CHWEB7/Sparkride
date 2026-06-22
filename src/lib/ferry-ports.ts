export type FerryPort = {
  code: string;
  name: string;
  city: string;
  region: string;
};

export const FERRY_PORTS: FerryPort[] = [
  { code: "HUL", name: "Hull", city: "Hull", region: "Yorkshire" },
  { code: "DOV", name: "Dover", city: "Dover", region: "Kent" },
  { code: "PTM", name: "Portsmouth", city: "Portsmouth", region: "Hampshire" },
  { code: "HLY", name: "Holyhead", city: "Holyhead", region: "Wales" },
  { code: "HRW", name: "Harwich", city: "Harwich", region: "Essex" },
  { code: "NSH", name: "North Shields", city: "Newcastle", region: "North East" },
  { code: "BHK", name: "Birkenhead", city: "Liverpool", region: "North West" },
];

export function getFerryPort(code: string): FerryPort | undefined {
  return FERRY_PORTS.find((port) => port.code === code);
}
