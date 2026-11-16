import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSettings, type Settings } from "@/lib/data";
import { formatUsd } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/contact";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const PAGES = ["about", "contact", "privacy", "terms", "shipping", "returns", "size-guide", "track"] as const;
type Page = (typeof PAGES)[number];
const ns = (p: Page) => (p === "size-guide" ? "sizeGuide" : p);

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => PAGES.map((page) => ({ locale, page })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; page: string }> }): Promise<Metadata> {
  const { locale, page } = await params;
  if (!(PAGES as readonly string[]).includes(page)) return {};
  const t = await getTranslations({ locale, namespace: `pages.${ns(page as Page)}` });
  return { title: t("title"), description: t("intro"), alternates: { canonical: `/${locale}/${page}`, languages: { ar: `/ar/${page}`, en: `/en/${page}` } } };
}

function fill(text: string, s: Settings) {
  return text
    .replaceAll("{exchangeDays}", String(s.exchangeDays))
    .replaceAll("{deliveryDays}", s.deliveryDays)
    .replaceAll("{freeFrom}", formatUsd(s.freeShippingFrom))
    .replaceAll("{fee}", formatUsd(s.shippingFee));
}

const CHARTS = {
  clothes: { head: ["Size", "Chest", "Waist", "Hip"], rows: [["XS", "82-86", "64-68", "88-92"], ["S", "86-90", "68-72", "92-96"], ["M", "90-96", "72-78", "96-102"], ["L", "96-102", "78-84", "102-108"], ["XL", "102-108", "84-90", "108-114"]] },
  trousers: { head: ["Size", "Waist", "Hip", "Inseam"], rows: [["28", "71", "88", "78"], ["30", "76", "93", "79"], ["32", "81", "98", "80"], ["34", "86", "103", "81"], ["36", "91", "108", "82"]] },
  shoes: { head: ["EU", "Foot length"], rows: [["40", "25.5"], ["41", "26.0"], ["42", "26.5"], ["43", "27.5"], ["44", "28.0"]] },
  kids: { head: ["Age", "Height"], rows: [["2Y", "86-92"], ["4Y", "98-104"], ["6Y", "110-116"], ["8Y", "122-128"]] },
} as const;

export default async function InfoPage({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  if (!(PAGES as readonly string[]).includes(page)) notFound();
  setRequestLocale(locale);
  const p = page as Page;
  const t = await getTranslations(`pages.${ns(p)}`);
  const tp = await getTranslations("pages");
  const tl = await getTranslations("listing");
  const s = await getSettings();
  const l = locale as "ar" | "en";
  const sections = t.has("sections") ? (t.raw("sections") as { h: string; p: string }[]) : [];

  return (
    <div className="gutter">
      <article className="mx-auto max-w-3xl pb-14">
        <Breadcrumbs items={[{ href: "/", label: tl("home") }, { label: t("title") }]} />
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted">{fill(t("intro"), s)}</p>

        {sections.length > 0 && (
          <div className="mt-8 grid gap-7">
            {sections.map((sec) => (
              <section key={sec.h}>
                <h2 className="mb-2 text-xl font-black">{sec.h}</h2>
                <p className="leading-8">{fill(sec.p, s)}</p>
              </section>
            ))}
          </div>
        )}

        {p === "contact" && (
          <div className="mt-8 grid gap-3">
            {s.whatsapp && (
              <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 bg-[#128C7E] text-lg font-bold text-white">
                <MessageCircle className="size-6" aria-hidden />
                {t("whatsappCta")}
              </a>
            )}
            <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {[
                { icon: MessageCircle, label: t("whatsapp"), value: s.whatsapp, href: s.whatsapp ? whatsappLink(s.whatsapp) : null, ltr: true },
                { icon: Phone, label: t("phone"), value: s.phone, href: s.phone ? telLink(s.phone) : null, ltr: true },
                { icon: Mail, label: t("email"), value: s.email, href: s.email ? `mailto:${s.email}` : null, ltr: true },
                { icon: Clock, label: t("hours"), value: s.hours?.[l] ?? null, href: null, ltr: false },
                { icon: MapPin, label: t("address"), value: s.address?.[l] ?? null, href: null, ltr: false },
              ].map(({ icon: Icon, label, value, href, ltr }) => (
                <div key={label} className="flex gap-3 bg-bg p-4">
                  <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="font-semibold break-words" dir={ltr && value ? "ltr" : undefined}>
                      {value ? href ? <a href={href} className="hover:underline">{value}</a> : value : <span className="font-normal text-muted">{tp("notSet")}</span>}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            {(s.instagram || s.facebook || s.tiktok) && (
              <p className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted">{t("social")}:</span>
                {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" className="font-semibold underline">Instagram</a>}
                {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="font-semibold underline">Facebook</a>}
                {s.tiktok && <a href={s.tiktok} target="_blank" rel="noreferrer" className="font-semibold underline">TikTok</a>}
              </p>
            )}
          </div>
        )}

        {p === "size-guide" && (
          <div className="mt-8 grid gap-8">
            {(Object.keys(CHARTS) as (keyof typeof CHARTS)[]).map((k) => (
              <section key={k}>
                <h2 className="mb-3 text-xl font-black">{t(k)}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-center text-sm">
                    <thead>
                      <tr className="bg-soft">
                        {CHARTS[k].head.map((h) => (
                          <th key={h} className="border border-line px-3 py-2 font-bold" dir="ltr">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-latin tabular-nums">
                      {CHARTS[k].rows.map((r) => (
                        <tr key={r[0]}>
                          {r.map((c, i) => (
                            <td key={i} className={`border border-line px-3 py-2 ${i === 0 ? "font-bold" : ""}`}>
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
            <section className="bg-soft p-5">
              <h2 className="mb-2 font-black">{t("how")}</h2>
              <p className="text-sm leading-7">{t("howText")}</p>
            </section>
          </div>
        )}

        {p === "track" && (
          <div className="mt-8 grid gap-4">
            <Link href="/account/orders" className="flex h-12 items-center justify-center bg-fg font-bold text-bg">
              {t("cta")}
            </Link>
            <p className="text-sm text-muted">{t("help")}</p>
            <Link href="/contact" className="flex h-12 items-center justify-center border border-fg font-bold">
              {t("contactCta")}
            </Link>
          </div>
        )}

        {["privacy", "terms", "shipping", "returns"].includes(p) && <p className="mt-10 text-sm text-muted">{tp("updated")}</p>}
      </article>
    </div>
  );
}
