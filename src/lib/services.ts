export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string;
  localContent: string[];
  metaTitle: string;
  metaDescription: string;
  relatedLinks: { label: string; href: string }[];
  href: string;
  cta: string;
  image: string;
  buttonClass: string;
};

export const SERVICES: ServiceItem[] = [
  {
    id: "airport-transfers",
    slug: "airport-transfers",
    title: "Airport transfers",
    teaser: "Fixed-price rides to and from all major UK airports.",
    description:
      "Professional drivers, flight tracking, and 24/7 availability for single and return airport journeys across Yorkshire and the UK.",
    localContent: [
      "Sparkride provides fixed-price electric airport transfers from Castleford and West Yorkshire to Leeds Bradford, Manchester, Liverpool, East Midlands, Birmingham, London airports, Newcastle, and more.",
      "When you are collected from Castleford, Wakefield, Pontefract, Knottingley, Normanton, or Featherstone, your fare is fixed at booking — Leeds Bradford from £45, Manchester from £100.",
    ],
    metaTitle: "Airport Transfers Castleford & West Yorkshire",
    metaDescription:
      "Fixed-price electric airport transfers from Castleford and West Yorkshire. Leeds Bradford from £45. Flight monitoring, 24/7 booking.",
    relatedLinks: [
      { label: "Castleford airport transfers", href: "/locations/castleford" },
      { label: "Castleford to Leeds Bradford", href: "/routes/castleford-to-leeds-bradford-airport" },
      { label: "Castleford to Manchester Airport", href: "/routes/castleford-to-manchester-airport" },
      { label: "View fixed fares", href: "/fares" },
    ],
    href: "/services/airport-transfers",
    cta: "Book a transfer",
    image: "/images/Services/airport-transfer.jpg",
    buttonClass: "bg-brand-gradient text-white hover:opacity-90",
  },
  {
    id: "private-hire",
    slug: "private-hire",
    title: "Private hire",
    teaser: "Pre-booked journeys for nights out, events, and local travel.",
    description:
      "Saloon, estate, MPV and executive vehicles for any destination — nights out, appointments, and point-to-point travel.",
    localContent: [
      "Pre-book private hire journeys across Castleford, Wakefield, Pontefract, and the wider West Yorkshire area. Ideal for nights out, appointments, events, and local point-to-point travel.",
      "Every private hire booking uses our fully electric fleet with professional drivers — book online 24/7 and receive a reference number straight away.",
    ],
    metaTitle: "Private Hire Castleford & West Yorkshire",
    metaDescription:
      "Pre-booked electric private hire in Castleford and West Yorkshire. Saloon, estate, MPV and executive vehicles. Book online 24/7.",
    relatedLinks: [
      { label: "West Yorkshire service area", href: "/locations/west-yorkshire" },
      { label: "Book online", href: "/book" },
    ],
    href: "/services/private-hire",
    cta: "Reserve a ride",
    image: "/images/Services/private-hire.jpg",
    buttonClass: "bg-white text-dark hover:bg-white/90",
  },
  {
    id: "corporate",
    slug: "corporate",
    title: "Corporate",
    teaser: "Account travel for teams, clients, and business events.",
    description:
      "Centralised billing, priority booking, and dedicated support for companies that need reliable private hire across the region.",
    localContent: [
      "Corporate travel accounts for West Yorkshire businesses needing reliable airport transfers, client pickups, and event transport from Castleford and surrounding areas.",
      "Centralised billing, priority booking, and dedicated support — all powered by our fully electric fleet for a professional, sustainable impression.",
    ],
    metaTitle: "Corporate Travel West Yorkshire",
    metaDescription:
      "Corporate private hire and airport transfers for West Yorkshire businesses. Centralised billing, electric fleet, priority booking.",
    relatedLinks: [
      { label: "Airport transfers", href: "/services/airport-transfers" },
      { label: "Contact us", href: "mailto:info@sparkride.co.uk" },
    ],
    href: "/services/corporate",
    cta: "Corporate travel",
    image: "/images/Services/corporate.jpg",
    buttonClass: "bg-dark text-white hover:opacity-90",
  },
  {
    id: "ferry-ports",
    slug: "ferry-ports",
    title: "Ferry & cruise ports",
    teaser: "Fixed-price transfers to Hull, Dover, Southampton and more.",
    description:
      "Door-to-port transfers for cross-channel sailings and UK cruise terminals — fixed pricing from West Yorkshire pickup areas.",
    localContent: [
      "Fixed-price transfers from Castleford and West Yorkshire to Hull ferry terminal, Dover, Southampton cruise terminals, and other UK ports.",
      "Door-to-port service with fixed fares confirmed at booking — ideal for cross-channel sailings and cruise holidays.",
    ],
    metaTitle: "Ferry & Cruise Port Transfers West Yorkshire",
    metaDescription:
      "Fixed-price ferry and cruise port transfers from Castleford and West Yorkshire. Hull, Dover, Southampton and more.",
    relatedLinks: [
      { label: "View port fares", href: "/fares" },
      { label: "West Yorkshire pickups", href: "/locations/west-yorkshire" },
    ],
    href: "/services/ferry-ports",
    cta: "Book port transfer",
    image: "/images/Services/ferry-ports.jpg",
    buttonClass: "bg-sky-400 text-[#0c2238] hover:bg-sky-300",
  },
  {
    id: "theme-parks",
    slug: "theme-parks",
    title: "Theme parks",
    teaser: "Family days out with direct transfers to the UK's best parks.",
    description:
      "Comfortable MPV and executive options for Alton Towers, Drayton Manor, Flamingo Land and more.",
    localContent: [
      "Family days out from Castleford and West Yorkshire to Alton Towers, Drayton Manor, Flamingo Land, and other UK theme parks.",
      "Comfortable MPV and executive vehicle options for groups — pre-book online and travel in our fully electric fleet.",
    ],
    metaTitle: "Theme Park Transfers West Yorkshire",
    metaDescription:
      "Theme park transfers from Castleford and West Yorkshire. Alton Towers, Drayton Manor, Flamingo Land and more. Book online.",
    relatedLinks: [
      { label: "Private hire", href: "/services/private-hire" },
      { label: "Book online", href: "/book" },
    ],
    href: "/services/theme-parks",
    cta: "Plan your day out",
    image: "/images/Services/theme-parks.jpg",
    buttonClass: "bg-brand-gradient text-white hover:opacity-90",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}
