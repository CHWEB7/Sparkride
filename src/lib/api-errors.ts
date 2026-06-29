import { Prisma } from "@prisma/client";

export function isPrismaMissingResourceError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): { message: string; status: number; code?: string } {
  if (isPrismaMissingResourceError(error)) {
    return {
      message:
        "Booking is temporarily unavailable because the database schema is out of date. Please contact support or try again after the next deploy.",
      status: 503,
      code: "schema_out_of_date",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { message: "A record with those details already exists.", status: 409 };
    }
  }

  if (error instanceof Error && error.message === "User email is required") {
    return { message: "Your account is missing an email address.", status: 400 };
  }

  return { message: fallback, status: 500 };
}
