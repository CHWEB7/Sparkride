import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CustomerBookingShell } from "@/components/customer/CustomerBookingShell";

export default function CustomerBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CustomerBookingShell>{children}</CustomerBookingShell>
      <Footer />
    </>
  );
}
