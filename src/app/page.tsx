import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { SustainableTravelSection } from "@/components/SustainableTravelSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <ServicesSection />
        <SustainableTravelSection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
