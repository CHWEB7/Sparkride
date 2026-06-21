import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AirportsSection } from "@/components/AirportsSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <AirportsSection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
