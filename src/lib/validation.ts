import { z } from "zod";

export const bookingSchema = z
  .object({
    serviceType: z.enum(["AIRPORT_TRANSFER", "PRE_BOOKED"]),
    journeyType: z.enum(["SINGLE", "RETURN"]),
    tripType: z.enum(["TO_AIRPORT", "FROM_AIRPORT"]),
    airportCode: z.string().optional(),
    pickupAddress: z.string().min(3, "Pickup address is required"),
    dropoffAddress: z.string().min(3, "Drop-off address is required"),
    pickupDate: z.string().min(1, "Date is required"),
    pickupTime: z.string().min(1, "Time is required"),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    passengers: z.coerce.number().int().min(1).max(8),
    luggage: z.coerce.number().int().min(0).max(10),
    vehicleType: z.enum(["SALOON", "ESTATE", "MPV", "EXECUTIVE"]),
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Valid email required"),
    customerPhone: z.string().min(10, "Valid phone number required"),
    flightNumber: z.string().optional(),
    returnFlightNumber: z.string().optional(),
    notes: z.string().optional(),
    driverId: z.string().min(1, "Please select a driver"),
    saveDetails: z.boolean().optional(),
    savedDetailsLabel: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.serviceType === "AIRPORT_TRANSFER") {
      if (!data.airportCode || data.airportCode.length !== 3) {
        ctx.addIssue({ code: "custom", message: "Airport is required", path: ["airportCode"] });
      }
    }

    if (data.journeyType === "RETURN") {
      if (!data.returnDate) {
        ctx.addIssue({ code: "custom", message: "Return date is required", path: ["returnDate"] });
      }
      if (!data.returnTime) {
        ctx.addIssue({ code: "custom", message: "Return time is required", path: ["returnTime"] });
      }
      if (data.returnDate && data.pickupDate && data.returnDate < data.pickupDate) {
        ctx.addIssue({
          code: "custom",
          message: "Return date must be on or after outbound date",
          path: ["returnDate"],
        });
      }
    }
  });

export type BookingInput = z.infer<typeof bookingSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "EN_ROUTE", "COMPLETED", "CANCELLED"]),
});
