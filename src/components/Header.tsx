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
import { BackToTop } from "./BackToTop";
import { useTheme } from "./ThemeProvider";

const FADE_START = 48;
const FADE_END = 180;

export function Header({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { theme } = useTheme();
  const overlayLightText = overlay && theme === "dark" && !menuOpen && scrollY < FADE_START;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  const headerOpacity = menuOpen
    ? 1
    : Math.max(0, Math.min(1, 1 - (scrollY - FADE_START) / (FADE_END - FADE_START)));

  const headerHidden = !menuOpen && headerOpacity <= 0.02;
  const showBackToTop = !menuOpen && scrollY > FADE_END;

  return (
    <>
      <motion.header
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          headerHidden ? "pointer-events-none" : ""
        } ${
          menuOpen
            ? "bg-white dark:bg-dark shadow-md"
            : overlay && scrollY < FADE_START
              ? "bg-transparent shadow-none"
              : "bg-app-bg/90 dark:bg-dark/90 backdrop-blur-md shadow-sm dark:shadow-none"
        }`}
      >
        <SiteContainer className="h-16 sm:h-[4.25rem] flex items-center justify-between">
          <div className="flex items-center min-h-[42px]" onClick={menuOpen ? closeMenu : undefined}>
            <Logo href="/" size="header" light={overlayLightText} />
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
                <ThemeToggle light={overlayLightText} />
                <AnimatedGradientButton href="/book" className="hidden sm:inline-flex text-sm">
                  Reserve a ride
                </AnimatedGradientButton>
                <button
                  onClick={() => setMenuOpen(true)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    overlayLightText
                      ? "hover:bg-white/10 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                  aria-label="Open menu"
                >
                  <Menu
                    className={`w-5 h-5 ${
                      overlayLightText ? "text-white" : "text-dark dark:text-white"
                    }`}
                  />
                </button>
              </>
            )}
          </div>
        </SiteContainer>

        <AnimatePresence>{menuOpen && <MegaMenu onClose={closeMenu} />}</AnimatePresence>
      </motion.header>

      <BackToTop visible={showBackToTop} />

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
            className="fixed top-16 sm:top-[4.25rem] left-0 right-0 bottom-0 z-40 bg-dark/15 dark:bg-black/35 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
