"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const inputClass = "h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-muted";

function QueryInput({ id, placeholder }: { id: string; placeholder: string }) {
  const q = useSearchParams().get("q") ?? "";
  return <input id={id} key={q} name="q" type="search" defaultValue={q} placeholder={placeholder} className={inputClass} />;
}

/** Plain GET form: works without JavaScript. Keeps the current query in the box on the results page. */
export function SearchForm({ locale, className = "", id = "site-search" }: { locale: string; className?: string; id?: string }) {
  const t = useTranslations("header");
  const placeholder = t("searchPlaceholder");
  return (
    <form action={`/${locale}/search`} method="get" role="search" className={`flex h-12 items-center border-2 border-fg ${className}`}>
      <label htmlFor={id} className="sr-only">
        {t("search")}
      </label>
      <Suspense fallback={<input id={id} name="q" type="search" placeholder={placeholder} className={inputClass} />}>
        <QueryInput id={id} placeholder={placeholder} />
      </Suspense>
      <button type="submit" aria-label={t("search")} className="grid h-full w-12 place-items-center bg-fg text-bg">
        <Search className="size-5" aria-hidden />
      </button>
    </form>
  );
}
