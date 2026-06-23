import { AIRPORTS } from "./airports";
import { getCombinedPorts } from "./hubs";
import {
  getHubSingleTripPrice,
  type FareRow,
  type FareSection,
} from "./hub-pricing";

function toFareRow(hub: { code: string; name: string }): FareRow {
  const single = getHubSingleTripPrice(hub.code);
  return {
    code: hub.code,
    name: hub.name,
    single,
    return: single * 2,
  };
}

export const FARE_SECTIONS: FareSection[] = [
  {
    title: "Airports",
    rows: AIRPORTS.map(toFareRow),
  },
  {
    title: "Ferry & cruise ports",
    rows: getCombinedPorts().map(toFareRow),
  },
];
