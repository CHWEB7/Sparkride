import { VehicleType } from "@prisma/client";
import { TEST_DRIVER_EMAIL } from "@/lib/driver-access";

export type BookableDriver = {
  id: string;
  name: string;
  vehicleLabel: string;
  vehicleType: VehicleType;
  maxSeats: number;
};

export type DriverSeed = {
  email: string;
  name: string;
  phone: string;
  vehicleLabel: string;
  vehicleType: VehicleType;
  maxSeats: number;
  password?: string;
};

export const DEFAULT_DRIVER_PASSWORD = "driver123";
export const TEST_DRIVER_PASSWORD = "TestDriver2024!";

export const BOOKABLE_DRIVER_SEEDS: DriverSeed[] = [
  {
    email: "lee@sparkride.co.uk",
    name: "Lee",
    phone: "07700 900101",
    vehicleLabel: "KIA Carnival (6 seater)",
    vehicleType: "MPV",
    maxSeats: 6,
  },
  {
    email: "darren@sparkride.co.uk",
    name: "Darren",
    phone: "07700 900102",
    vehicleLabel: "Tesla Model 3 (4 seater)",
    vehicleType: "EXECUTIVE",
    maxSeats: 4,
  },
  {
    email: TEST_DRIVER_EMAIL,
    name: "Test Driver",
    phone: "07700 900199",
    vehicleLabel: "Saloon (4 seater)",
    vehicleType: "SALOON",
    maxSeats: 4,
    password: TEST_DRIVER_PASSWORD,
  },
];

export function getDriverSeedPassword(seed: DriverSeed): string {
  return seed.password ?? process.env.DRIVER_PASSWORD ?? DEFAULT_DRIVER_PASSWORD;
}
