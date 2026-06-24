"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getThemeZone,
  THEME_STORAGE_KEYS,
  type ThemeZone,
} from "@/lib/theme-routes";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  canToggle: boolean;
  zone: ThemeZone;
}>({
  theme: "light",
  toggle: () => {},
  canToggle: false,
  zone: "marketing",
});

function readStoredTheme(key: string): Theme | null {
  const stored = localStorage.getItem(key) as Theme | null;
  return stored === "light" || stored === "dark" ? stored : null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const zone = getThemeZone(pathname);
  const [customerTheme, setCustomerTheme] = useState<Theme>("light");
  const [driverTheme, setDriverTheme] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const fallback: Theme = prefersDark ? "dark" : "light";
    setCustomerTheme(readStoredTheme(THEME_STORAGE_KEYS.customer) ?? fallback);
    setDriverTheme(readStoredTheme(THEME_STORAGE_KEYS.driver) ?? fallback);
    setHydrated(true);
  }, []);

  const effectiveTheme: Theme =
    zone === "marketing" ? "dark" : zone === "customer" ? customerTheme : driverTheme;
  const canToggle = zone !== "marketing";

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
  }, [effectiveTheme, hydrated]);

  function toggle() {
    if (zone === "marketing") return;

    if (zone === "customer") {
      setCustomerTheme((prev) => {
        const next = prev === "light" ? "dark" : "light";
        localStorage.setItem(THEME_STORAGE_KEYS.customer, next);
        return next;
      });
      return;
    }

    setDriverTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_STORAGE_KEYS.driver, next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggle, canToggle, zone }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
