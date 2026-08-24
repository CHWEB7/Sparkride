import { Logo } from "@/components/Logo";

/**
 * Blank brand stage — logo first.
 * Services and marketing sections come next.
 */
export default function HomePage() {
  return (
    <main className="logo-stage relative flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="logo-enter flex flex-col items-center gap-8">
        <div className="logo-mark-pulse">
          <Logo className="text-[clamp(2.75rem,8vw,5.5rem)]" />
        </div>

        <p className="max-w-xs text-center text-sm font-medium tracking-[0.18em] text-brand-muted uppercase">
          Hostfinity
        </p>
      </div>

      <p className="absolute bottom-8 left-1/2 w-[min(90vw,28rem)] -translate-x-1/2 text-center text-sm leading-relaxed text-brand-muted/80">
        Websites built and hosted. Template starting point — services coming
        next.
      </p>
    </main>
  );
}
