import { useTranslations } from "next-intl";

/** First focusable element: lets keyboard users jump past the header. */
export function SkipLink() {
  const t = useTranslations("header");
  return (
    <a href="#main" className="sr-only z-[100] bg-fg px-4 py-3 font-bold text-bg focus:not-sr-only focus:fixed focus:start-3 focus:top-3">
      {t("skip")}
    </a>
  );
}
