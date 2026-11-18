import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Arrow({ className = "size-4" }: { className?: string }) {
  return <ArrowLeft className={`${className} ltr:rotate-180`} strokeWidth={1.6} aria-hidden />;
}

/** Section title in the editorial serif, with an optional small kicker and a link at the end. */
export function EdHeading({ kicker, title, href, linkLabel, center = false }: { kicker?: string; title: string; href?: string; linkLabel?: string; center?: boolean }) {
  return (
    <div data-reveal className={`mb-6 flex flex-wrap items-end gap-3 sm:mb-8 ${center ? "flex-col items-center text-center" : "justify-between"}`}>
      <div>
        {kicker && <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted">{kicker}</p>}
        <h2 className="font-display text-[26px] font-medium leading-tight sm:text-[34px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium">
          <span className="border-b border-fg/40 pb-0.5 transition-colors group-hover:border-fg">{linkLabel}</span>
          <Arrow />
        </Link>
      )}
    </div>
  );
}
