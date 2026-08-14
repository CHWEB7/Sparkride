import { getHubSingleTripPrice } from "./hub-pricing";
import { formatTownList, SERVICE_AREA } from "./service-area";

const lbaPrice = getHubSingleTripPrice("LBA");
const manPrice = getHubSingleTripPrice("MAN");
const fixedTowns = formatTownList(SERVICE_AREA.fixedPriceTowns);

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQS: FaqItem[] = [
  {
    question: "How do I pay for my booking?",
    answer:
      "After your driver accepts the booking, you will receive a secure Square payment link by email and on your booking page. Payment is completed on Square's hosted checkout — Sparkride never stores your card details. Funds go directly to your driver's Square account.",
  },
  {
    question: "How do I book a transfer?",
    answer:
      "Choose your service, enter your pickup and drop-off details, select your vehicle, and confirm online. You will receive a reference number straight away and your driver will confirm the booking.",
  },
  {
    question: "Are your vehicles fully electric?",
    answer:
      "Yes. Sparkride operates a fully electric fleet. Every journey is powered by clean energy, helping reduce emissions and fuel use compared with a conventional private hire.",
  },
  {
    question: "Is the price fixed when I book?",
    answer:
      "Yes. The price you see when booking is the fixed fare for your trip. After your driver accepts the booking, you can pay online via a secure Square payment link sent by email and shown on your booking page. Sparkride does not store card details.",
  },
  {
    question: "What if I am collected from a non-fixed-price location?",
    answer:
      "The system will detect this when you make a booking. Our drivers have to confirm the trips that you book, and the driver will send you a custom quote via email for you to review. If you choose to accept, that price is then fixed for your trip.",
  },
  {
    question: "Which airports do you cover?",
    answer:
      "We cover major UK airports including Leeds Bradford, Manchester, Heathrow, Gatwick, Birmingham, Liverpool, Newcastle, and more. Airport transfers can be booked as single or return journeys.",
  },
  {
    question: "What if my flight is delayed?",
    answer:
      "Include your flight number when booking so we can monitor arrival times. For airport pickups we adjust collection accordingly — just contact us if your plans change.",
  },
  {
    question: "Do you offer corporate and private hire?",
    answer:
      "Yes. Beyond airport transfers we provide corporate travel, private hire, ferry port transfers, and theme park journeys. All services use the same professional drivers and electric vehicles.",
  },
  {
    question: `Do you cover Wakefield, Pontefract, and other West Yorkshire towns?`,
    answer: `Yes. Fixed-price airport transfers are available when you are collected from ${fixedTowns}. Book online to confirm your pickup and see the fare before you travel.`,
  },
  {
    question: `How much is a transfer from Castleford to Leeds Bradford Airport?`,
    answer: `A single journey from Castleford to Leeds Bradford Airport is £${lbaPrice} fixed. Return journeys are £${lbaPrice * 2}. The price is confirmed before you travel.`,
  },
  {
    question: "Do you pick up from Leeds?",
    answer:
      "We serve Leeds and the wider West Yorkshire area. Leeds city centre pickups may receive a custom quote depending on your exact location — book online and your driver will confirm the fixed fare or send a quote for you to review.",
  },
  {
    question: `How much is a taxi from Castleford to Manchester Airport?`,
    answer: `A fixed single journey from Castleford to Manchester Airport is £${manPrice}. Return transfers are £${manPrice * 2}. Book online for an instant confirmed price.`,
  },
  {
    question: "Is there an electric airport transfer service in West Yorkshire?",
    answer:
      "Yes. Sparkride is a fully electric private hire service based in Castleford, West Yorkshire. We provide fixed-price airport transfers to Leeds Bradford, Manchester, and all major UK airports — book online 24/7.",
  },
];
