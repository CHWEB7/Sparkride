export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string;
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
    href: "/services/corporate",
    cta: "Corporate travel",
    image: "/images/Services/corporate.jpg",
    buttonClass: "bg-dark text-white hover:opacity-90",
  },
  {
    id: "ferry-ports",
    slug: "ferry-ports",
    title: "Ferry ports",
    teaser: "Door-to-port transfers for cross-channel and UK sailings.",
    description:
      "Relaxed pickup times and generous luggage space for Hull, Dover, Liverpool and other ferry terminals.",
    href: "/services/ferry-ports",
    cta: "Book ferry transfer",
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
    href: "/services/theme-parks",
    cta: "Plan your day out",
    image: "/images/Services/theme-parks.jpg",
    buttonClass: "bg-brand-gradient text-white hover:opacity-90",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}
