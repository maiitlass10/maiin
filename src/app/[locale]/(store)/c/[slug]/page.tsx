import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isListingSlug, listingSlugs, productsFor } from "@/lib/catalog";
import { getProducts } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductListing } from "@/components/listing/ProductListing";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listingSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isListingSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "categories" });
  const tl = await getTranslations({ locale, namespace: "listing" });
  return { title: t(slug), description: tl("metaDescription", { name: t(slug) }), alternates: { canonical: `/${locale}/c/${slug}`, languages: { ar: `/ar/c/${slug}`, en: `/en/c/${slug}` } } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isListingSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("categories");
  const tl = await getTranslations("listing");
  const items = productsFor(await getProducts(), slug);

  return (
    <div className="gutter">
      <div className="mx-auto max-w-7xl pb-10">
        <Breadcrumbs items={[{ href: "/", label: tl("home") }, { label: t(slug) }]} />
        <h1 className="mb-5 text-2xl font-black sm:text-3xl">{t(slug)}</h1>
        <Suspense>
          <ProductListing items={items} />
        </Suspense>
      </div>
    </div>
  );
}
