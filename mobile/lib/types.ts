export type Booking = {
  id: string;
  reference: string;
  status: string;
  serviceType: string;
  journeyType: string;
  tripType: string;
  airportCode: string | null;
  airportName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  returnPickupDate: string | null;
  passengers: number;
  luggage: number;
  vehicleType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber: string | null;
  returnFlightNumber: string | null;
  notes: string | null;
  estimatedPrice: number | null;
};

export type BookingInput = {
  serviceType: "AIRPORT_TRANSFER" | "FERRY_PORT_TRANSFER" | "CRUISE_TERMINAL_TRANSFER" | "PORT_TRANSFER" | "PRE_BOOKED";
  journeyType: "SINGLE" | "RETURN";
  tripType: "TO_AIRPORT" | "FROM_AIRPORT";
  airportCode?: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  luggage: number;
  vehicleType: "SALOON" | "ESTATE" | "MPV" | "EXECUTIVE";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber?: string;
  returnFlightNumber?: string;
  notes?: string;
};

export type Airport = {
  code: string;
  name: string;
  city: string;
  region: string;
};

export type AppMeta = {
  airports: Airport[];
  vehicleTypes: { value: string; label: string; desc: string }[];
  statuses: string[];
};
