export type CancellationPolicySection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function buildCancellationPolicySections(waitingFee: number): CancellationPolicySection[] {
  return [
    {
      id: "cancellations",
      title: "Cancellations",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cancellations made <strong>48 hours or more</strong> before the scheduled pickup time
            will receive a <strong>full refund</strong>.
          </li>
          <li>
            Cancellations made <strong>less than 48 hours</strong> before the scheduled pickup time
            are <strong>non-refundable</strong>.
          </li>
          <li>
            Any amendments to bookings are subject to availability and may incur additional charges.
          </li>
        </ul>
      ),
    },
    {
      id: "flight-delays",
      title: "Flight delays",
      content: (
        <ul className="list-disc space-y-2 pl-5">
          <li>We monitor all incoming flight arrivals where a flight number has been provided.</li>
          <li>
            If your flight is delayed, we will adjust your pickup time where possible at no extra
            charge.
          </li>
          <li>
            Significant delays that require rescheduling or additional driver waiting time may incur
            an additional fee.
          </li>
          <li>
            If your flight is cancelled, please contact us as soon as possible to discuss your
            options.
          </li>
        </ul>
      ),
    },
    {
      id: "waiting-time",
      title: "Waiting time",
      content: (
        <>
          <h3 className="text-base font-semibold dark:text-white">Airport pickups</h3>
          <p className="mt-2">
            Your driver will be in contact with you after your flight arrives. We recommend booking
            a pickup time of 45 minutes after landing. If you cannot meet your driver within 60
            minutes of your flight landing, additional waiting time will be charged at{" "}
            <strong>£{waitingFee} per 15 minutes</strong> (based on airport parking fees).
          </p>
          <h3 className="mt-6 text-base font-semibold dark:text-white">Non-airport pickups</h3>
          <p className="mt-2">
            A 15-minute grace period is included. Additional waiting time will be charged after this
            period.
          </p>
        </>
      ),
    },
    {
      id: "no-shows",
      title: "No shows",
      content: (
        <>
          <p>A booking will be classed as a no-show if:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The passenger cannot be contacted after the included waiting period of 60 minutes.</li>
            <li>The passenger fails to arrive at the agreed pickup location.</li>
            <li>Incorrect booking information is provided and contact cannot be made.</li>
          </ul>
          <p className="mt-3">No-shows are non-refundable.</p>
        </>
      ),
    },
    {
      id: "customer-delays",
      title: "Customer delays",
      content: (
        <p>
          If you know you will be late, please contact us immediately. We will do our best to
          accommodate changes, but this cannot be guaranteed and additional charges may apply.
        </p>
      ),
    },
    {
      id: "driver-delays",
      title: "Driver delays",
      content: (
        <p>
          In the event that our driver is delayed due to traffic, accidents, severe weather, or other
          unforeseen circumstances, we will keep you informed and will make every effort to minimise
          disruption.
        </p>
      ),
    },
    {
      id: "force-majeure",
      title: "Force majeure",
      content: (
        <p>
          We are not liable for delays or cancellations caused by events beyond our reasonable
          control, including but not limited to severe weather, road closures, accidents, government
          restrictions, or airline operational issues.
        </p>
      ),
    },
  ];
}
