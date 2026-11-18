import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function SectionHeading({ title, href, linkLabel, children }: { title: string; href?: string; linkLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-black sm:text-2xl">{title}</h2>
      <div className="flex items-center gap-3">
        {children}
        {href && (
          <Link href={href} className="flex min-h-11 items-center gap-0.5 text-sm font-semibold text-muted hover:text-fg">
            {linkLabel}
            <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
