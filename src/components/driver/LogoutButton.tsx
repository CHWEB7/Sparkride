"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/driver/logout", { method: "POST" });
    router.push("/driver/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        variant === "light"
          ? "text-gray-500 hover:text-gray-900"
          : "text-gray-400 hover:text-white"
      }`}
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
