import { BUSINESS } from "./business";

export const SERVICE_AREA = {
  hub: "Castleford",
  region: "West Yorkshire",
  county: "Yorkshire",
  phone: BUSINESS.phone,
  email: BUSINESS.email,
  /** Towns with fixed airport/ferry/cruise transfer pricing from the West Yorkshire pickup zone. */
  fixedPriceTowns: [
    "Castleford",
    "Pontefract",
    "Knottingley",
    "Normanton",
    "Featherstone",
    "Wakefield",
    "Garforth",
    "Kippax",
  ],
  /** Larger centres — book online; custom quote if outside the fixed-price zone. */
  quoteTowns: ["Leeds", "Bradford", "Doncaster"],
} as const;

export function formatTownList(towns: readonly string[]): string {
  if (towns.length <= 1) return towns[0] ?? "";
  return `${towns.slice(0, -1).join(", ")} and ${towns[towns.length - 1]}`;
}

export function getAllServedTowns(): string[] {
  return [...SERVICE_AREA.fixedPriceTowns, ...SERVICE_AREA.quoteTowns];
}
