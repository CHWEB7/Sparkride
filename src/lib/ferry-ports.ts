import { isBookableHub } from "./hub-pricing";

export type FerryPort = {
  code: string;
  name: string;
  city: string;
  region: string;
};

const ALL_FERRY_PORTS: FerryPort[] = [
  { code: "HUL", name: "Hull", city: "Hull", region: "Yorkshire" },
  { code: "DOV", name: "Dover", city: "Dover", region: "Kent" },
];

export const FERRY_PORTS = ALL_FERRY_PORTS.filter((port) => isBookableHub(port.code));

export function getFerryPort(code: string): FerryPort | undefined {
  return FERRY_PORTS.find((port) => port.code === code);
}
