"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ light = false }: { light?: boolean }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
        light ? "hover:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/10"
      }`}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className={`w-5 h-5 ${light ? "text-white" : "text-gray-600 dark:text-gray-300"}`} />
      ) : (
        <Sun className={`w-5 h-5 ${light ? "text-white" : "text-gray-300"}`} />
      )}
    </button>
  );
}
