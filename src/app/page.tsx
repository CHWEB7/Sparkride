import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { SustainableTravelSection } from "@/components/SustainableTravelSection";
import { LocationSection } from "@/components/LocationSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <ServicesSection />
        <SustainableTravelSection />
        <LocationSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
