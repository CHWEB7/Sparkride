import { stat } from "fs/promises";
import path from "path";
import Link from "next/link";
import { Download, Smartphone, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SiteContainer } from "@/components/SiteContainer";

const APK_FILENAME = "sparkride.apk";

async function getApkStatus() {
  const externalUrl = process.env.NEXT_PUBLIC_APK_URL?.trim();
  if (externalUrl) {
    return { available: true, downloadHref: externalUrl, external: true };
  }

  const apkPath = path.join(process.cwd(), "public", "downloads", APK_FILENAME);
  try {
    const fileStat = await stat(apkPath);
    if (fileStat.isFile() && fileStat.size > 1000) {
      return {
        available: true,
        downloadHref: "/api/download/apk",
        external: false,
        sizeMb: (fileStat.size / (1024 * 1024)).toFixed(1),
      };
    }
  } catch {
    // file missing
  }

  return { available: false, downloadHref: null, external: false };
}

export default async function DownloadPage() {
  const status = await getApkStatus();

  return (
    <>
      <PageHeader
        title="Download the Sparkride app"
        description="Book transfers and manage jobs on Android"
      />
      <SiteContainer className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {!status.available && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">Android app not available yet</p>
                <p className="mt-1 opacity-90">
                  The install file has not been uploaded to the server. The download button
                  will work once the APK is built and deployed.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-booking-bg dark:bg-white/5 p-8 sm:p-10 shadow-md mb-10">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shrink-0">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.02em] dark:text-white">
                  Android app
                </h2>
                <p className="text-muted mt-2 leading-relaxed">
                  Install the Sparkride app to book airport transfers or view driver
                  bookings on your phone. iPhone users can book via this website.
                </p>
              </div>
            </div>

            {status.available && status.downloadHref ? (
              <a
                href={status.downloadHref}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-brand-gradient text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                Download for Android (.apk)
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed">
                <Download className="w-5 h-5" />
                Download unavailable
              </span>
            )}

            <p className="text-sm text-muted mt-4">
              Version 1.0.0 · Requires Android 8.0 or later
              {"sizeMb" in status && status.sizeMb ? ` · ${status.sizeMb} MB` : ""}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Download,
                title: "1. Download",
                text: "Tap the button above. If Chrome shows a warning, choose Download anyway.",
              },
              {
                icon: Shield,
                title: "2. Allow install",
                text: "Open the downloaded file. Allow Chrome or Files to install unknown apps if asked.",
              },
              {
                icon: RefreshCw,
                title: "3. Open app",
                text: "Launch Sparkride, then use Book or Driver tabs.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl bg-booking-bg dark:bg-white/5 p-5 shadow-md"
              >
                <Icon className="w-5 h-5 text-brand-start mb-3" />
                <h3 className="font-medium dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-black/5 dark:border-white/10 p-6 text-sm text-muted leading-relaxed">
            <p className="mb-3">
              <strong className="text-dark dark:text-white">Pixel / Chrome tip:</strong> if
              download fails, try long-press the button and choose &quot;Download link&quot;,
              or use the menu → Downloads to open the file after it completes.
            </p>
            <p className="mb-3">
              <strong className="text-dark dark:text-white">Security note:</strong> this
              build is distributed directly from Sparkride, not the Google Play Store.
            </p>
            <p>
              Prefer to book in the browser?{" "}
              <Link href="/book" className="text-brand-start hover:underline">
                Book a transfer online
              </Link>
              .
            </p>
          </div>
        </div>
      </SiteContainer>
    </>
  );
}
