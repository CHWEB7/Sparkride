import { getHubSingleTripPrice } from "./hub-pricing";
import { formatTownList, SERVICE_AREA } from "./service-area";
import { CASTLEFORD_ROUTES } from "./routes";

export type LocationDefinition = {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  isFixedPrice: boolean;
  faqs: { question: string; answer: string }[];
};

const lbaPrice = getHubSingleTripPrice("LBA");
const fixedTowns = formatTownList(SERVICE_AREA.fixedPriceTowns);

function topRoutes(limit = 5) {
  return CASTLEFORD_ROUTES.slice(0, limit);
}

export const LOCATIONS: LocationDefinition[] = [
  {
    slug: "castleford",
    name: "Castleford",
    title: "Airport Transfers Castleford",
    metaDescription:
      "Fixed-price electric airport transfers from Castleford, West Yorkshire. Leeds Bradford from £45. Book online 24/7 with Sparkride.",
    h1: "Castleford airport transfers — fixed prices from £45",
    intro: [
      "Sparkride is based in Castleford and specialises in fixed-price electric airport transfers across West Yorkshire and the UK. Whether you are heading to Leeds Bradford for a short hop or Manchester, Heathrow, or Gatwick for a longer journey, you will see the fare before you travel.",
      "Our fully electric fleet means every airport run is quieter, cleaner, and more comfortable — with professional drivers, flight monitoring on arrivals, and 24/7 online booking.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "How much is Castleford to Leeds Bradford Airport?",
        answer: `A single journey from Castleford to Leeds Bradford Airport is £${lbaPrice} fixed. Return transfers are £${lbaPrice * 2}.`,
      },
      {
        question: "Can I book a Castleford airport transfer online?",
        answer:
          "Yes. Book online at any time — enter your pickup in Castleford, choose your airport, and confirm your fixed fare instantly.",
      },
    ],
  },
  {
    slug: "west-yorkshire",
    name: "West Yorkshire",
    title: "West Yorkshire Airport Transfers",
    metaDescription:
      "Fixed-price airport transfers from West Yorkshire including Castleford, Wakefield, Pontefract, and surrounding towns. Electric fleet, 24/7 booking.",
    h1: "West Yorkshire airport transfers — fixed pricing",
    intro: [
      `Sparkride provides fixed-price airport transfers when you are collected from ${fixedTowns}. We cover Leeds Bradford, Manchester, Liverpool, East Midlands, Birmingham, London airports, Newcastle, and more.`,
      "Based in Castleford, we know West Yorkshire roads and airport routes. Every journey uses our fully electric fleet with fixed fares confirmed before you travel — no surge pricing, no hidden airport drop-off fees passed on to you.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Which West Yorkshire towns have fixed airport transfer prices?",
        answer: `Fixed fares apply when you are collected from ${fixedTowns}. Book online to confirm your pickup location and see the price before you travel.`,
      },
      {
        question: "Do you cover all of West Yorkshire?",
        answer:
          "We serve the wider West Yorkshire area. Towns outside our fixed-price zone receive a custom quote from your driver when you book — you can accept or decline before travelling.",
      },
    ],
  },
  {
    slug: "leeds",
    name: "Leeds",
    title: "Leeds Bradford Airport Transfers",
    metaDescription:
      "Leeds Bradford airport transfers from West Yorkshire from £45. Fixed-price electric taxis from Castleford and surrounding areas. Book online with Sparkride.",
    h1: "Leeds Bradford airport transfers from West Yorkshire",
    intro: [
      `Leeds Bradford Airport (LBA) is the closest major airport to Castleford and West Yorkshire — and our most popular route at £${lbaPrice} single from the fixed-price pickup zone.`,
      "Whether you live in Leeds, Castleford, Wakefield, or Pontefract, Sparkride provides fixed-price electric transfers to Leeds Bradford and all other UK airports. Leeds city centre pickups may receive a custom quote depending on your exact address — book online and your driver will confirm the fare.",
    ],
    isFixedPrice: false,
    faqs: [
      {
        question: "How much is a Leeds Bradford airport transfer?",
        answer: `From Castleford and fixed-price West Yorkshire towns, Leeds Bradford is £${lbaPrice} single and £${lbaPrice * 2} return. Leeds city pickups are quoted at booking.`,
      },
      {
        question: "Do you do airport pickups at Leeds Bradford?",
        answer:
          "Yes. We monitor incoming flights when you provide a flight number and adjust your pickup time for delays at no extra charge where possible.",
      },
    ],
  },
  {
    slug: "wakefield",
    name: "Wakefield",
    title: "Airport Transfers Wakefield",
    metaDescription:
      "Fixed-price airport transfers from Wakefield, West Yorkshire. Leeds Bradford from £45, Manchester from £100. Electric fleet, book online 24/7.",
    h1: "Wakefield airport transfers — fixed prices",
    intro: [
      "Wakefield is within Sparkride's fixed-price pickup zone for airport, ferry, and cruise terminal transfers. Book online and see your fare before you travel — no surprises.",
      "Popular routes from Wakefield include Leeds Bradford (£45), Manchester (£100), and London airports. Our fully electric fleet serves Wakefield residents with professional drivers and 24/7 availability.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Is Wakefield in your fixed-price area?",
        answer:
          "Yes. Wakefield is included in our fixed-price West Yorkshire pickup zone for airport transfers. Book online to confirm your fare.",
      },
      {
        question: "How do I get from Wakefield to Manchester Airport?",
        answer: `A fixed single journey from Wakefield to Manchester Airport is £${getHubSingleTripPrice("MAN")}. Book online for an instant confirmed price.`,
      },
    ],
  },
  {
    slug: "pontefract",
    name: "Pontefract",
    title: "Airport Transfers Pontefract",
    metaDescription:
      "Fixed-price airport transfers from Pontefract, West Yorkshire. Electric private hire to Leeds Bradford, Manchester, and UK airports. Book with Sparkride.",
    h1: "Pontefract airport transfers — fixed prices",
    intro: [
      "Pontefract is part of Sparkride's fixed-price service area for airport transfers across West Yorkshire. Based just minutes away in Castleford, we know the local routes to Leeds Bradford, Manchester, and beyond.",
      "Every Pontefract airport transfer uses our fully electric fleet with fixed fares confirmed at booking. Single and return journeys are available to all major UK airports.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Can I book an airport transfer from Pontefract?",
        answer:
          "Yes. Pontefract is in our fixed-price pickup zone. Enter your Pontefract address when booking online to see your fixed fare.",
      },
      {
        question: "What is the cheapest airport from Pontefract?",
        answer: `Leeds Bradford is the closest airport — £${lbaPrice} single from Pontefract and surrounding West Yorkshire towns.`,
      },
    ],
  },
  {
    slug: "knottingley",
    name: "Knottingley",
    title: "Airport Transfers Knottingley",
    metaDescription:
      "Fixed-price airport transfers from Knottingley to Leeds Bradford, Manchester, and UK airports. Electric fleet based in Castleford. Book online 24/7.",
    h1: "Knottingley airport transfers — fixed prices",
    intro: [
      "Knottingley residents can book fixed-price airport transfers with Sparkride from our Castleford base. Leeds Bradford, Manchester, and all major UK airports are available with fares confirmed before you travel.",
      "Our electric private hire service covers Knottingley as part of the West Yorkshire fixed-price zone — professional drivers, flight monitoring, and 24/7 online booking.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Do you pick up from Knottingley?",
        answer:
          "Yes. Knottingley is within our fixed-price West Yorkshire pickup area for airport transfers.",
      },
      {
        question: "How far is Knottingley from Leeds Bradford Airport?",
        answer: `The journey typically takes around 40–55 minutes. Fixed fare is £${lbaPrice} single from Knottingley.`,
      },
    ],
  },
  {
    slug: "normanton",
    name: "Normanton",
    title: "Airport Transfers Normanton",
    metaDescription:
      "Fixed-price airport transfers from Normanton, West Yorkshire. Electric taxis to Leeds Bradford, Manchester, and UK airports. Book with Sparkride.",
    h1: "Normanton airport transfers — fixed prices",
    intro: [
      "Normanton is within Sparkride's fixed-price pickup zone for airport transfers. Book online from Normanton to Leeds Bradford, Manchester, Liverpool, East Midlands, Birmingham, London airports, and more.",
      "Every journey uses our fully electric fleet with fixed fares — no hidden airport fees passed on to you. Professional drivers and 24/7 availability from our Castleford base.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Is Normanton covered for fixed airport fares?",
        answer:
          "Yes. Normanton is included in our West Yorkshire fixed-price zone. Book online to confirm your fare instantly.",
      },
      {
        question: "What airports can I reach from Normanton?",
        answer:
          "All major UK airports including Leeds Bradford, Manchester, Liverpool, East Midlands, Birmingham, Heathrow, Gatwick, Stansted, Luton, and Newcastle.",
      },
    ],
  },
  {
    slug: "featherstone",
    name: "Featherstone",
    title: "Airport Transfers Featherstone",
    metaDescription:
      "Fixed-price airport transfers from Featherstone, West Yorkshire. Electric private hire to Leeds Bradford and UK airports. Book online with Sparkride.",
    h1: "Featherstone airport transfers — fixed prices",
    intro: [
      "Featherstone is part of Sparkride's West Yorkshire fixed-price service area. Whether you are flying from Leeds Bradford or heading to Manchester, Heathrow, or Gatwick, you will know the cost before you travel.",
      "Our Castleford-based electric fleet serves Featherstone with professional drivers, flight monitoring on arrivals, and fixed single or return fares to all major UK airports.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Can I get a fixed-price airport taxi from Featherstone?",
        answer:
          "Yes. Featherstone is in our fixed-price pickup zone. Book online to see your fare before you confirm.",
      },
      {
        question: "How much is Featherstone to Leeds Bradford?",
        answer: `A single journey is £${lbaPrice} fixed. Return is £${lbaPrice * 2}.`,
      },
    ],
  },
  {
    slug: "garforth",
    name: "Garforth",
    title: "Airport Transfers Garforth",
    metaDescription:
      "Fixed-price airport transfers from Garforth, West Yorkshire. Electric taxis to Leeds Bradford, Manchester, and UK airports. Book online with Sparkride.",
    h1: "Garforth airport transfers — fixed prices",
    intro: [
      "Garforth is within Sparkride's fixed-price West Yorkshire pickup zone. Book online for fixed fares to Leeds Bradford, Manchester, and all major UK airports.",
      "Our fully electric fleet based in Castleford provides professional airport transfers from Garforth with 24/7 online booking and flight monitoring on arrivals.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Do you cover Garforth for airport transfers?",
        answer:
          "Yes. Garforth is in our fixed-price service area. Enter your Garforth address when booking to confirm your fare.",
      },
      {
        question: "What is the fare from Garforth to Manchester Airport?",
        answer: `A fixed single journey is £${getHubSingleTripPrice("MAN")}. Book online for an instant price.`,
      },
    ],
  },
  {
    slug: "kippax",
    name: "Kippax",
    title: "Airport Transfers Kippax",
    metaDescription:
      "Fixed-price airport transfers from Kippax, West Yorkshire. Electric private hire to Leeds Bradford and UK airports. Book with Sparkride.",
    h1: "Kippax airport transfers — fixed prices",
    intro: [
      "Kippax residents can book fixed-price airport transfers with Sparkride from our Castleford base. Leeds Bradford, Manchester, and all major UK airports are available with fares confirmed before you travel.",
      "Our electric private hire service covers Kippax as part of the West Yorkshire fixed-price zone — professional drivers and 24/7 online booking.",
    ],
    isFixedPrice: true,
    faqs: [
      {
        question: "Is Kippax in your fixed-price area?",
        answer:
          "Yes. Kippax is included in our West Yorkshire fixed-price pickup zone for airport transfers.",
      },
      {
        question: "How much is Kippax to Leeds Bradford Airport?",
        answer: `A single journey is £${lbaPrice} fixed from Kippax and surrounding West Yorkshire towns.`,
      },
    ],
  },
];

export function getLocationBySlug(slug: string): LocationDefinition | undefined {
  return LOCATIONS.find((location) => location.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((location) => location.slug);
}

export function getTopRoutesForLocation() {
  return topRoutes(5);
}
