import Link from "next/link";
import { SiteContainer } from "./SiteContainer";

export function Footer() {
  return (
    <footer className="bg-dark text-gray-400 py-16">
      <SiteContainer>
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Sparkride</h3>
            <p className="text-sm leading-relaxed">
              Professional private hire airport transfers based in Castleford,
              West Yorkshire. Serving customers across the UK.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book" className="hover:text-brand-end transition-colors">Book a transfer</Link></li>
              <li><Link href="/download" className="hover:text-brand-end transition-colors">Download Android app</Link></li>
              <li><Link href="/#airports" className="hover:text-brand-end transition-colors">Our airports</Link></li>
              <li><Link href="/driver/login" className="hover:text-brand-end transition-colors">Driver portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>01977 800 000</li>
              <li>info@sparkride.co.uk</li>
              <li>Castleford, West Yorkshire</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-center">
          &copy; {new Date().getFullYear()} Sparkride Airport Transfers. All rights reserved.
        </div>
      </SiteContainer>
    </footer>
  );
}
