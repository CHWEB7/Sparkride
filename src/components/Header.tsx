"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatedGradientButton } from "./AnimatedGradientButton";
import { SiteContainer } from "./SiteContainer";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { CustomerNav } from "./customer/CustomerNav";

export function Header({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          menuOpen
            ? "bg-white dark:bg-dark shadow-md"
            : overlay
              ? "bg-transparent shadow-none"
              : "bg-app-bg/90 dark:bg-dark/90 backdrop-blur-md shadow-sm dark:shadow-none"
        }`}
      >
        <SiteContainer className="h-16 flex items-center justify-between">
          <div onClick={menuOpen ? closeMenu : undefined}>
            <Logo href="/" light={overlay && !menuOpen} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-dark dark:text-gray-200 tracking-[-0.01em] hover:opacity-70 transition-opacity"
                >
                  <Globe className="w-4 h-4" />
                  EN
                </button>
                <Link
                  href="/help"
                  onClick={closeMenu}
                  className="hidden sm:inline text-sm font-medium text-dark dark:text-gray-200 tracking-[-0.01em] hover:opacity-70 transition-opacity"
                >
                  Support
                </Link>
                <Link
                  href="/book"
                  onClick={closeMenu}
                  className="hidden sm:inline-flex items-center px-5 py-2.5 bg-dark dark:bg-white text-white dark:text-dark text-sm font-medium tracking-[-0.01em] rounded-full hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
                <button
                  onClick={closeMenu}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </>
            ) : (
              <>
                <CustomerNav />
                <ThemeToggle light={overlay} />
                <AnimatedGradientButton href="/book" className="hidden sm:inline-flex text-sm">
                  Reserve a ride
                </AnimatedGradientButton>
                <button
                  onClick={() => setMenuOpen(true)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    overlay
                      ? "hover:bg-white/10 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                  aria-label="Open menu"
                >
                  <Menu className={`w-5 h-5 ${overlay ? "text-white" : "dark:text-white"}`} />
                </button>
              </>
            )}
          </div>
        </SiteContainer>

        <AnimatePresence>{menuOpen && <MegaMenu onClose={closeMenu} />}</AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-label="Close menu"
            onClick={closeMenu}
            className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-dark/15 dark:bg-black/35 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
