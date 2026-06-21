import Link from "next/link";
import { Download, Smartphone, Shield, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SiteContainer } from "@/components/SiteContainer";

const APK_PATH = process.env.NEXT_PUBLIC_APK_URL || "/downloads/sparkride.apk";

export default function DownloadPage() {
  return (
    <>
      <PageHeader
        title="Download the Sparkride app"
        description="Book transfers and manage jobs on Android"
      />
      <SiteContainer className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
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

            <a
              href={APK_PATH}
              download="sparkride.apk"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-brand-gradient text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Download for Android (.apk)
            </a>

            <p className="text-sm text-muted mt-4">
              Version 1.0.0 · Requires Android 8.0 or later
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Download,
                title: "1. Download",
                text: "Tap the button above to download the APK file.",
              },
              {
                icon: Shield,
                title: "2. Allow install",
                text: "When prompted, allow installs from your browser or file manager.",
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
              <strong className="text-dark dark:text-white">Security note:</strong> this
              build is distributed directly from Sparkride, not the Google Play Store. You
              may see a warning about unknown apps — choose to install anyway if you
              trust this site.
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
