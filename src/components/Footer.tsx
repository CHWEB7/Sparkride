import Link from "next/link";
import { SiteContainer } from "./SiteContainer";
import { Logo } from "./Logo";
import { getBookingUrl } from "@/lib/booking-url";

export function Footer() {
  const bookingUrl = getBookingUrl();

  return (
    <footer className="bg-dark text-gray-400 py-10 sm:py-16">
      <SiteContainer>
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <Logo size="md" light href="/" className="mb-4 sm:mb-5" />
            <p className="text-sm leading-relaxed">
              Professional private hire airport transfers based in Castleford,
              West Yorkshire. Serving customers across the UK.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={bookingUrl} className="hover:text-brand-end transition-colors">
                  Book a transfer
                </a>
              </li>
              <li>
                <Link href="/fares" className="hover:text-brand-end transition-colors">
                  Fares
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="hover:text-brand-end transition-colors">
                  Cancellation policy
                </Link>
              </li>
              <li>
                <Link href="/#sustainability" className="hover:text-brand-end transition-colors">
                  Sustainable travel
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-brand-end transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>01977 800 000</li>
              <li>info@sparkride.co.uk</li>
              <li>Castleford, West Yorkshire</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 text-xs sm:text-sm text-center">
          &copy; {new Date().getFullYear()} Sparkride Airport Transfers. All rights reserved.
        </div>
      </SiteContainer>
    </footer>
  );
}
