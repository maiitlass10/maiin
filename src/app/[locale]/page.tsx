import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Banknote, RefreshCw, Truck } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");
  const tt = useTranslations("trust");

  const trust = [
    { icon: Truck, title: tt("delivery"), text: tt("deliveryText") },
    { icon: Banknote, title: tt("payment"), text: tt("paymentText") },
    { icon: RefreshCw, title: tt("exchange"), text: tt("exchangeText") },
  ];

  return (
    <>
      <section className="gutter bg-soft">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 py-20 sm:py-28">
          <span className="bg-sale px-3 py-1 text-sm font-bold text-white">{t("kicker")}</span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-balance sm:text-6xl">{t("title")}</h1>
          <p className="max-w-xl text-lg text-muted">{t("text")}</p>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center bg-fg px-8 font-bold text-bg transition-opacity hover:opacity-85"
          >
            {t("cta")}
          </a>
          <p className="mt-6 border-s-4 border-fg ps-3 text-sm text-muted">{t("sprintNote")}</p>
        </div>
      </section>

      <section className="gutter">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 border-b border-line sm:grid-cols-3">
          {trust.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4 border-line py-6 sm:px-6 sm:[&:not(:first-child)]:border-s">
              <Icon aria-hidden className="size-7 shrink-0" strokeWidth={1.6} />
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
