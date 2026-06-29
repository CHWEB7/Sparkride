import Link from "next/link";

export function BackToPortalHub({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/book"
      className={`inline-block text-sm font-medium text-brand hover:underline ${className}`}
    >
      ← Back to portal hub
    </Link>
  );
}
