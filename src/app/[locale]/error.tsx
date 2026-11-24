"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Friendly page when something on a page fails; the header and footer stay. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error("[page error]", error.digest ?? "", error.message);
  }, [error]);
  return (
    <section className="gutter py-24 text-center">
      <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-3d inline-flex h-12 items-center rounded-full bg-accent px-8 font-bold text-accent-fg">
          {t("retry")}
        </button>
        <Link href="/" className="btn-3d-ghost inline-flex h-12 items-center rounded-full border border-fg/70 px-8 font-medium">
          {t("home")}
        </Link>
      </div>
      {error.digest && <p className="mt-6 font-latin text-xs text-muted">#{error.digest}</p>}
    </section>
  );
}
