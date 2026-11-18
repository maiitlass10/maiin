import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="no-scrollbar overflow-x-auto py-1 text-sm text-muted">
      <ol className="flex items-center gap-1 whitespace-nowrap">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="size-3.5 ltr:rotate-180" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="inline-flex min-h-11 items-center hover:text-fg hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
