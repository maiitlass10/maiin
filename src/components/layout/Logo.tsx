import { Link } from "@/i18n/navigation";

/** Wordmark: MAIIN in heavy Latin capitals, the Arabic name underneath. */
export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" aria-label="MAIIN ماين" className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className={`font-latin text-[26px] font-extrabold tracking-[0.18em] ${inverted ? "text-bg" : "text-fg"}`}>
        MAIIN
      </span>
      <span className={`mt-0.5 text-[11px] font-bold ${inverted ? "text-bg/70" : "text-muted"}`}>ماين</span>
    </Link>
  );
}
