import { DriverCustomersList } from "@/components/driver/DriverCustomersList";

export default function DriverCustomersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Customers
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customers who have booked with you. Read-only — contact details for your records.
        </p>
      </div>
      <DriverCustomersList />
    </div>
  );
}
