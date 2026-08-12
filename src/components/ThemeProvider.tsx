"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getThemeZone, type ThemeZone } from "@/lib/theme-routes";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  canToggle: boolean;
  zone: ThemeZone;
}>({
  theme: "dark",
  toggle: () => {},
  canToggle: false,
  zone: "marketing",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const zone = getThemeZone(pathname);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.add("dark");
  }, [hydrated]);

  return (
    <ThemeContext.Provider
      value={{ theme: "dark", toggle: () => {}, canToggle: false, zone }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
