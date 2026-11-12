import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/categories";

export function CategoryBar() {
  const t = useTranslations("categories");
  return (
    <nav aria-label={t("new")} className="no-scrollbar overflow-x-auto border-t border-line">
      <ul className="mx-auto flex max-w-7xl gap-6 whitespace-nowrap py-2.5 text-[15px] font-semibold">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/c/${c.slug}`}
              className={`block border-b-2 border-transparent py-1 transition-colors hover:border-current ${"highlight" in c ? "text-sale" : ""}`}
            >
              {t(c.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
