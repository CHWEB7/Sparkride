"use client";

import { useState } from "react";
import { DriverSetPasswordForm } from "@/components/driver/DriverSetPasswordForm";
import { useTheme } from "@/components/ThemeProvider";

export function DriverChangePassword({ theme: themeProp }: { theme?: "dark" | "light" }) {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp ?? contextTheme;
  const isLight = theme === "light";
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div
        className={
          isLight
            ? "rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-800"
            : "mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-green-100 text-sm"
        }
      >
        Password updated. Use your new password next time you sign in.
      </div>
    );
  }

  return (
    <section
      className={
        isLight
          ? "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          : "mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
      }
    >
      <h2 className={`text-lg font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>
        Change password
      </h2>
      <p className={`mt-2 text-sm leading-relaxed ${isLight ? "text-gray-500" : "text-gray-400"}`}>
        Choose a personal password for driver sign-in. You will still need your authenticator app
        each time you log in.
      </p>
      <div className="mt-5 max-w-md">
        <DriverSetPasswordForm submitLabel="Update password" onComplete={() => setSaved(true)} />
      </div>
    </section>
  );
}
