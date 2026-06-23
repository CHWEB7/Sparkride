"use client";

import { useState } from "react";
import { DriverSetPasswordForm } from "@/components/driver/DriverSetPasswordForm";

export function DriverChangePassword() {
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-green-100 text-sm">
        Password updated. Use your new password next time you sign in.
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Change password</h2>
      <p className="mt-2 text-sm text-gray-400 leading-relaxed">
        Choose a personal password for driver sign-in. You will still need your authenticator
        app each time you log in.
      </p>
      <div className="mt-5 max-w-md">
        <DriverSetPasswordForm
          submitLabel="Update password"
          onComplete={() => setSaved(true)}
        />
      </div>
    </div>
  );
}
