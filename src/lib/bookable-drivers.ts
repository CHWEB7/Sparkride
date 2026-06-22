import { VehicleType } from "@prisma/client";

export type BookableDriver = {
  id: string;
  name: string;
  vehicleLabel: string;
  vehicleType: VehicleType;
  maxSeats: number;
};

export const BOOKABLE_DRIVER_SEEDS = [
  {
    email: "lee@sparkride.co.uk",
    name: "Lee",
    phone: "07700 900101",
    vehicleLabel: "KIA Carnival (6 seater)",
    vehicleType: "MPV" as VehicleType,
    maxSeats: 6,
  },
  {
    email: "darren@sparkride.co.uk",
    name: "Darren",
    phone: "07700 900102",
    vehicleLabel: "Tesla Model 3 (4 seater)",
    vehicleType: "EXECUTIVE" as VehicleType,
    maxSeats: 4,
  },
] as const;
