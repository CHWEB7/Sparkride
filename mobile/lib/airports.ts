import type { Airport } from "./types";

export const DEFAULT_AIRPORTS: Airport[] = [
  { code: "LBA", name: "Leeds Bradford", city: "Leeds", region: "Yorkshire" },
  { code: "MAN", name: "Manchester", city: "Manchester", region: "North West" },
  { code: "LPL", name: "Liverpool John Lennon", city: "Liverpool", region: "North West" },
  { code: "EMA", name: "East Midlands", city: "Nottingham", region: "East Midlands" },
  { code: "BHX", name: "Birmingham", city: "Birmingham", region: "West Midlands" },
  { code: "LHR", name: "Heathrow", city: "London", region: "London" },
  { code: "LGW", name: "Gatwick", city: "London", region: "London" },
  { code: "STN", name: "Stansted", city: "London", region: "London" },
  { code: "LTN", name: "Luton", city: "London", region: "London" },
  { code: "NCL", name: "Newcastle", city: "Newcastle", region: "North East" },
];
