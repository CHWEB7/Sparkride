import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { SustainableTravelSection } from "@/components/SustainableTravelSection";
import { LocationSection } from "@/components/LocationSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { AnswerBlock } from "@/components/seo/StructuredData";
import { SiteContainer } from "@/components/SiteContainer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Airport Transfers Castleford & West Yorkshire",
  description:
    "Fixed-price electric airport transfers from Castleford and West Yorkshire. Leeds Bradford from £45. Professional drivers, 24/7 online booking.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <SiteContainer className="py-8 sm:py-10">
          <AnswerBlock />
        </SiteContainer>
        <ServicesSection />
        <SustainableTravelSection />
        <LocationSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
