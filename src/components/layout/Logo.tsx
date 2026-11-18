import { Link } from "@/i18n/navigation";

/** Wordmark: MAIIN in wide-spaced serif capitals, the Arabic name underneath. */
export function Logo({ className = "", inverted = false, center = false }: { className?: string; inverted?: boolean; center?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="MAIIN ماين"
      className={`inline-flex min-h-11 flex-col justify-center leading-none ${center ? "items-center" : "items-start"} ${className}`}
    >
      <span dir="ltr" className={`font-display text-[26px] font-semibold tracking-[0.32em] [margin-inline-end:-0.32em] ${inverted ? "text-bg" : "text-fg"}`}>
        MAIIN
      </span>
      <span className={`mt-1 font-display text-[12px] font-medium tracking-[0.2em] ${inverted ? "text-bg/70" : "text-muted"}`}>ماين</span>
    </Link>
  );
}
