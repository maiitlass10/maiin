import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

/** Plain GET form: works without JavaScript. The results page arrives in Sprint 2. */
export function SearchForm({ locale, className = "" }: { locale: string; className?: string }) {
  const t = useTranslations("header");
  return (
    <form action={`/${locale}/search`} method="get" role="search" className={`flex h-11 items-center border-2 border-fg ${className}`}>
      <label htmlFor="site-search" className="sr-only">
        {t("search")}
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder={t("searchPlaceholder")}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-muted"
      />
      <button type="submit" aria-label={t("search")} className="grid h-full w-12 place-items-center bg-fg text-bg">
        <Search className="size-5" aria-hidden />
      </button>
    </form>
  );
}
