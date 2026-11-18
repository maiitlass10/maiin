import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Banknote, RefreshCw, Star, Truck } from "lucide-react";
import { routing } from "@/i18n/routing";
import { discountPercent } from "@/data/products";
import { careFor, descriptionFor, relatedProducts, sampleReviews, sizeChartFor } from "@/lib/catalog";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { formatSyp, formatUsd } from "@/lib/format";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SITE_URL } from "@/lib/site";
import { Gallery } from "@/components/product/Gallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, id: p.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const p = await getProduct(id);
  if (!p) return {};
  const l = locale as "ar" | "en";
  return {
    title: p.name[l],
    description: descriptionFor(p)[l],
    alternates: { canonical: `/${locale}/p/${id}`, languages: { ar: `/ar/p/${id}`, en: `/en/p/${id}` } },
    openGraph: { type: "website", title: p.name[l], description: descriptionFor(p)[l], images: [{ url: p.image }] },
  };
}

function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= Math.round(value) ? "fill-star text-star" : "text-line"}`} />
      ))}
    </span>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();
  const [all, settings] = await Promise.all([getProducts(), getSettings()]);
  setRequestLocale(locale);
  const l = locale as "ar" | "en";
  const t = await getTranslations("pdp");
  const tc = await getTranslations("categories");
  const tl = await getTranslations("listing");
  const tp = await getTranslations("product");
  const off = discountPercent(p);
  const main = p.categories[0];
  const sub = p.categories[1];
  const related = relatedProducts(all, p);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, pct: s === 5 ? 72 : s === 4 ? 18 : s === 3 ? 6 : s === 2 ? 3 : 1 }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name[l],
    image: (p.images ?? [p.image]).map((src) => new URL(src, SITE_URL).toString()),
    description: descriptionFor(p)[l],
    sku: p.id,
    brand: { "@type": "Brand", name: "MAIIN" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${locale}/p/${p.id}`,
      priceCurrency: "USD",
      price: p.price.toFixed(2),
      availability: p.sizes.every((s) => p.soldOut?.includes(s)) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="gutter">
      {/* Structured data so search engines can show price and availability. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-7xl pb-10">
        <Breadcrumbs
          items={[
            { href: "/", label: tl("home") },
            { href: `/c/${main}`, label: tc(main) },
            ...(sub ? [{ href: `/c/${sub}`, label: tc(sub) }] : []),
            { label: p.name[l] },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <Gallery
            images={p.images ?? [p.image]}
            alt={p.name[l]}
            badge={
              off > 0 ? <span className="absolute start-0 top-3 bg-sale px-2 py-1 font-latin text-sm font-bold text-white">-{off}%</span> : p.isNew ? <span className="absolute start-0 top-3 bg-fg px-2 py-1 text-sm font-bold text-bg">{tp("new")}</span> : null
            }
          />

          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-snug sm:text-3xl">{p.name[l]}</h1>
            <a href="#reviews" className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg">
              <Stars value={p.rating} />
              <span className="font-latin font-semibold text-fg">{p.rating.toFixed(1)}</span>
              <span>({t("reviewsCount", { count: p.reviews })})</span>
              <span aria-hidden>·</span>
              <span>{tp("sold", { count: p.sold >= 1000 ? `${(p.sold / 1000).toFixed(1)}k` : p.sold })}</span>
            </a>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-line py-4">
              <span className={`font-latin text-3xl font-extrabold ${off ? "text-sale" : ""}`}>{formatUsd(p.price)}</span>
              {p.oldPrice && <s className="font-latin text-lg text-muted">{formatUsd(p.oldPrice)}</s>}
              {off > 0 && <span className="bg-sale px-2 py-0.5 text-sm font-bold text-white">{t("save", { amount: formatUsd(p.oldPrice! - p.price) })}</span>}
              <span className="w-full text-sm text-muted">≈ {formatSyp(p.price, l, settings.sypPerUsd)}</span>
            </div>

            <div className="mt-6">
              <ProductPurchase product={p} chart={sizeChartFor(p)} />
            </div>

            <ul className="mt-6 grid gap-3 bg-soft p-4 text-sm">
              <li className="flex gap-3">
                <Truck className="size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                <span>
                  <b>{t("deliveryTitle")}</b> · {t("deliveryText", { amount: formatUsd(settings.freeShippingFrom), fee: formatUsd(settings.shippingFee) })}
                </span>
              </li>
              <li className="flex gap-3">
                <Banknote className="size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                <span>
                  <b>{t("paymentTitle")}</b> · {t("paymentText")}
                </span>
              </li>
              <li className="flex gap-3">
                <RefreshCw className="size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                <span>
                  <b>{t("exchangeTitle")}</b> · {t("exchangeText")}
                </span>
              </li>
            </ul>

            <div className="mt-6 divide-y divide-line border-y border-line">
              {[
                { title: t("description"), body: descriptionFor(p)[l], open: true },
                { title: t("care"), body: careFor[l] },
                { title: t("shippingReturns"), body: t("shippingReturnsText") },
              ].map((s) => (
                <details key={s.title} open={s.open} className="group py-1">
                  <summary className="flex h-12 cursor-pointer list-none items-center justify-between font-bold [&::-webkit-details-marker]:hidden">
                    {s.title}
                    <span className="text-xl font-normal transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-[15px] text-muted">{s.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <section id="reviews" className="mt-14 scroll-mt-40">
          <h2 className="mb-5 text-xl font-black sm:text-2xl">{t("reviews")}</h2>
          <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <p className="font-latin text-5xl font-extrabold">{p.rating.toFixed(1)}</p>
              <Stars value={p.rating} className="size-5" />
              <p className="mt-1 text-sm text-muted">{t("reviewsCount", { count: p.reviews })}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                {dist.map((d) => (
                  <li key={d.s} className="flex items-center gap-2">
                    <span className="w-3 font-latin">{d.s}</span>
                    <Star className="size-3.5 fill-star text-star" aria-hidden />
                    <span className="h-2 flex-1 bg-soft">
                      <span className="block h-full bg-fg" style={{ width: `${d.pct}%` }} />
                    </span>
                    <span className="w-9 text-end font-latin text-muted">{d.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs text-muted">{t("sampleNote")}</p>
              <ul className="divide-y divide-line border-y border-line">
                {sampleReviews.map((r) => (
                  <li key={r.name} className="py-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Stars value={r.stars} className="size-3.5" />
                      <b>{r.name}</b>
                      <span className="text-muted">· {r.city[l]}</span>
                      <span className="text-muted">· {t("boughtSize", { size: r.size })}</span>
                    </div>
                    <p className="mt-2 text-[15px]">{r.text[l]}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-black sm:text-2xl">{t("related")}</h2>
            <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {related.map((r) => (
                <li key={r.id} className="w-[42vw] max-w-[220px] shrink-0 snap-start sm:w-[200px]">
                  <ProductCard product={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
