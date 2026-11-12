"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const next = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      lang={next}
      aria-label={t("switchLanguageLabel")}
      disabled={pending}
      onClick={() => startTransition(() => router.replace(pathname, { locale: next }))}
      className="h-9 border border-line px-3 text-sm font-bold transition-colors hover:border-fg disabled:opacity-50"
    >
      {t("switchLanguage")}
    </button>
  );
}
