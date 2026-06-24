import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteContainer } from "@/components/SiteContainer";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { getServiceBySlug, SERVICES } from "@/lib/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service | Sparkride" };

  return {
    title: `${service.title} | Sparkride`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="relative min-h-[42vh] flex items-end overflow-hidden bg-dark">
          <Image
            src={service.image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
          <SiteContainer className="relative z-10 pb-8 sm:pb-12 pt-24 sm:pt-28">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.14em] text-white/70">
              Sparkride services
            </p>
            <h1 className="mt-2 sm:mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl">
              {service.title}
            </h1>
          </SiteContainer>
        </section>

        <SiteContainer className="py-10 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-base sm:text-lg text-muted leading-relaxed">{service.description}</p>
            <p className="mt-4 text-muted leading-relaxed">
              More detail for this service is coming soon. You can book online now and our team will
              confirm your journey.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <AnimatedGradientButton href="/book" className="px-5 py-2.5 text-sm sm:px-5 sm:py-2.5">
                Book online
              </AnimatedGradientButton>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                View all services
              </Link>
            </div>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}
