"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

/**
 * Switches between Arabic and English on the same page.
 *
 * A plain link with a full page load, not a client-side router.replace: the
 * locale is the root layout's segment (it sets <html lang/dir>), and the
 * client router fetched the other language but never showed it. A full load
 * always works, keeps the query string (filters, search) and works without JS.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("header");
  const pathname = usePathname();
  const next = locale === "ar" ? "en" : "ar";
  const href = `/${next}${pathname === "/" ? "" : pathname}`;

  return (
    <a
      href={href}
      hrefLang={next}
      lang={next}
      aria-label={t("switchLanguageLabel")}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        window.location.assign(href + window.location.search + window.location.hash);
      }}
      className="inline-flex h-9 items-center border border-line px-3 text-sm font-bold transition-colors hover:border-fg"
    >
      {t("switchLanguage")}
    </a>
  );
}
