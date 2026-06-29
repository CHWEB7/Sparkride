import { prisma } from "@/lib/prisma";
import { getDriverAccessToken } from "@/lib/square/driver-tokens";
import { squareRequest } from "@/lib/square/client";
import { completeBookingPayment } from "@/lib/booking-confirmation";

type SquarePayment = {
  id?: string;
  status?: string;
  reference_id?: string;
  order_id?: string;
};

type PaymentLinkResponse = {
  payment_link?: {
    id?: string;
    order_id?: string;
  };
};

type OrderTender = {
  id?: string;
  payment_id?: string;
  type?: string;
};

type SquareOrder = {
  id?: string;
  state?: string;
  reference_id?: string;
  tenders?: OrderTender[];
};

type OrderResponse = {
  order?: SquareOrder;
};

type SearchPaymentsResponse = {
  payments?: SquarePayment[];
};

export type PaymentSyncHints = {
  squarePaymentId?: string | null;
  squareOrderId?: string | null;
};

function tenderPaymentIds(tenders: OrderTender[] | undefined): string[] {
  if (!tenders?.length) return [];

  const ids = new Set<string>();
  for (const tender of tenders) {
    if (tender.payment_id) ids.add(tender.payment_id);
    if (tender.id) ids.add(tender.id);
  }
  return [...ids];
}

async function retrieveSquarePayment(
  accessToken: string,
  paymentId: string
): Promise<SquarePayment | null> {
  const result = await squareRequest<{ payment?: SquarePayment }>({
    accessToken,
    path: `/v2/payments/${encodeURIComponent(paymentId)}`,
  });
  if (!result.ok) {
    console.warn("Square retrieve payment failed:", paymentId, result.error);
    return null;
  }
  return result.data.payment ?? null;
}

async function retrieveSquareOrder(
  accessToken: string,
  orderId: string
): Promise<SquareOrder | null> {
  const result = await squareRequest<OrderResponse>({
    accessToken,
    path: `/v2/orders/${encodeURIComponent(orderId)}`,
  });
  if (!result.ok) {
    console.warn("Square retrieve order failed:", orderId, result.error);
    return null;
  }
  return result.data.order ?? null;
}

async function findCompletedPaymentOnOrder(
  accessToken: string,
  orderId: string,
  expectedReference?: string
): Promise<SquarePayment | null> {
  const order = await retrieveSquareOrder(accessToken, orderId);
  if (!order) return null;

  if (expectedReference && order.reference_id && order.reference_id !== expectedReference) {
    return null;
  }

  for (const paymentId of tenderPaymentIds(order.tenders)) {
    const payment = await retrieveSquarePayment(accessToken, paymentId);
    if (payment?.id && payment.status === "COMPLETED") {
      return payment;
    }
  }

  return null;
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

  if (!result.ok) {
    console.warn("Square payment search failed:", reference, result.error);
    return null;
  }

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

  if (!linkResult.ok) {
    console.warn("Square payment link retrieve failed:", paymentLinkId, linkResult.error);
    return null;
  }

  const orderId = linkResult.data.payment_link?.order_id;
  if (!orderId) return null;

  const payment = await findCompletedPaymentOnOrder(accessToken, orderId, reference);
  if (payment) return payment;

  return searchSquarePaymentByReference(accessToken, reference);
}

export async function resolveBookingReferenceFromSquareOrder(
  merchantId: string,
  orderId: string
): Promise<string | null> {
  const driver = await prisma.driver.findFirst({
    where: { squareMerchantId: merchantId },
    select: { id: true },
  });
  if (!driver) return null;

  const tokenResult = await getDriverAccessToken(driver.id);
  if (!tokenResult.ok) return null;

  const order = await retrieveSquareOrder(tokenResult.accessToken, orderId);
  return order?.reference_id ?? null;
}

export async function completeBookingFromSquareWebhook(input: {
  merchantId: string;
  paymentId: string;
  paymentReferenceId?: string | null;
  orderId?: string | null;
}): Promise<boolean> {
  if (input.paymentReferenceId) {
    return completeBookingPayment(input.paymentReferenceId, input.paymentId);
  }

  if (input.orderId) {
    const reference = await resolveBookingReferenceFromSquareOrder(
      input.merchantId,
      input.orderId
    );
    if (reference) {
      return completeBookingPayment(reference, input.paymentId);
    }
  }

  const driver = await prisma.driver.findFirst({
    where: { squareMerchantId: input.merchantId },
    select: { id: true },
  });
  if (!driver) return false;

  const tokenResult = await getDriverAccessToken(driver.id);
  if (!tokenResult.ok) return false;

  const payment = await retrieveSquarePayment(tokenResult.accessToken, input.paymentId);
  if (!payment?.id || payment.status !== "COMPLETED") return false;

  if (payment.reference_id) {
    return completeBookingPayment(payment.reference_id, payment.id);
  }

  if (payment.order_id) {
    const reference = await resolveBookingReferenceFromSquareOrder(
      input.merchantId,
      payment.order_id
    );
    if (reference) {
      return completeBookingPayment(reference, payment.id);
    }
  }

  return false;
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

  const accessToken = tokenResult.accessToken;
  let payment: SquarePayment | null = null;

  if (hints.squarePaymentId) {
    payment = await retrieveSquarePayment(accessToken, hints.squarePaymentId);
  }

  if (!payment && hints.squareOrderId) {
    payment = await findCompletedPaymentOnOrder(accessToken, hints.squareOrderId, reference);
  }

  if (!payment && booking.squarePaymentLinkId) {
    payment = await findPaymentFromPaymentLink(
      accessToken,
      booking.squarePaymentLinkId,
      reference
    );
  }

  if (!payment) {
    payment = await searchSquarePaymentByReference(accessToken, reference);
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
