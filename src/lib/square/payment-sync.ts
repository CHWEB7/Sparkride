import { prisma } from "@/lib/prisma";
import { getDriverAccessToken } from "@/lib/square/driver-tokens";
import { squareRequest } from "@/lib/square/client";
import { completeBookingPayment } from "@/lib/booking-confirmation";

type SquarePayment = {
  id?: string;
  status?: string;
  reference_id?: string;
};

type PaymentLinkResponse = {
  payment_link?: {
    id?: string;
    order_id?: string;
  };
};

type OrderResponse = {
  order?: {
    id?: string;
    state?: string;
    reference_id?: string;
  };
};

type SearchPaymentsResponse = {
  payments?: SquarePayment[];
};

export type PaymentSyncHints = {
  squarePaymentId?: string | null;
  squareOrderId?: string | null;
};

async function retrieveSquarePayment(
  accessToken: string,
  paymentId: string
): Promise<SquarePayment | null> {
  const result = await squareRequest<{ payment?: SquarePayment }>({
    accessToken,
    path: `/v2/payments/${encodeURIComponent(paymentId)}`,
  });
  if (!result.ok) return null;
  return result.data.payment ?? null;
}

async function searchSquarePaymentByReference(
  accessToken: string,
  reference: string
): Promise<SquarePayment | null> {
  const result = await squareRequest<SearchPaymentsResponse>({
    accessToken,
    method: "POST",
    path: "/v2/payments/search",
    body: {
      query: {
        filter: {
          reference_id: {
            exact: reference,
          },
        },
        sort: {
          sort_field: "CREATED_AT",
          sort_order: "DESC",
        },
      },
    },
  });

  if (!result.ok) return null;

  return (
    result.data.payments?.find(
      (payment) => payment.status === "COMPLETED" && payment.reference_id === reference
    ) ?? null
  );
}

async function findPaymentFromPaymentLink(
  accessToken: string,
  paymentLinkId: string,
  reference: string
): Promise<SquarePayment | null> {
  const linkResult = await squareRequest<PaymentLinkResponse>({
    accessToken,
    path: `/v2/online-checkout/payment-links/${encodeURIComponent(paymentLinkId)}`,
  });

  if (!linkResult.ok) return null;

  const orderId = linkResult.data.payment_link?.order_id;
  if (!orderId) return null;

  const orderResult = await squareRequest<OrderResponse>({
    accessToken,
    path: `/v2/orders/${encodeURIComponent(orderId)}`,
  });

  if (!orderResult.ok) return null;

  if (orderResult.data.order?.reference_id === reference) {
    const payment = await searchSquarePaymentByReference(accessToken, reference);
    if (payment) return payment;
  }

  return searchSquarePaymentByReference(accessToken, reference);
}

export async function syncBookingPaymentFromSquare(
  reference: string,
  hints: PaymentSyncHints = {}
): Promise<{ updated: boolean; alreadyPaid: boolean; error?: string }> {
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { driver: true },
  });

  if (!booking) {
    return { updated: false, alreadyPaid: false, error: "Booking not found" };
  }

  if (booking.paymentStatus === "PAID" || booking.status === "CONFIRMED") {
    return { updated: false, alreadyPaid: true };
  }

  if (!booking.driverId) {
    return { updated: false, alreadyPaid: false, error: "No driver assigned" };
  }

  const tokenResult = await getDriverAccessToken(booking.driverId);
  if (!tokenResult.ok) {
    return { updated: false, alreadyPaid: false, error: tokenResult.error };
  }

  let payment: SquarePayment | null = null;

  if (hints.squarePaymentId) {
    payment = await retrieveSquarePayment(tokenResult.accessToken, hints.squarePaymentId);
  }

  if (!payment && hints.squareOrderId && booking.squarePaymentLinkId) {
    payment = await findPaymentFromPaymentLink(
      tokenResult.accessToken,
      booking.squarePaymentLinkId,
      reference
    );
  }

  if (!payment && booking.squarePaymentLinkId) {
    payment = await findPaymentFromPaymentLink(
      tokenResult.accessToken,
      booking.squarePaymentLinkId,
      reference
    );
  }

  if (!payment) {
    payment = await searchSquarePaymentByReference(tokenResult.accessToken, reference);
  }

  if (!payment?.id || payment.status !== "COMPLETED") {
    return { updated: false, alreadyPaid: false };
  }

  if (payment.reference_id && payment.reference_id !== reference) {
    return { updated: false, alreadyPaid: false, error: "Payment reference mismatch" };
  }

  const completed = await completeBookingPayment(reference, payment.id);
  return { updated: completed, alreadyPaid: false };
}
