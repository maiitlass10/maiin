import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchProducts } from "@/lib/catalog";
import { getProducts } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductListing } from "@/components/listing/ProductListing";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchForm } from "@/components/layout/SearchForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[] }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const q = String((await searchParams).q ?? "").slice(0, 80);
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: q ? t("titleFor", { q }) : t("title"), robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const q = String((await searchParams).q ?? "").trim().slice(0, 80);
  const t = await getTranslations("search");
  const tl = await getTranslations("listing");
  const products = await getProducts();
  const results = q ? searchProducts(products, q) : [];
  const popular = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);

  return (
    <div className="gutter">
      <div className="mx-auto max-w-7xl pb-10">
        <Breadcrumbs items={[{ href: "/", label: tl("home") }, { label: t("title") }]} />
        <h1 className="mb-5 text-2xl font-black sm:text-3xl">{q ? t("titleFor", { q }) : t("title")}</h1>
        <SearchForm locale={locale} id="search-page" className="mb-6 hidden max-w-xl md:flex" />
        {results.length > 0 ? (
          <Suspense>
            <ProductListing items={results} />
          </Suspense>
        ) : (
          <>
            <div className="mb-10 bg-soft px-5 py-8 text-center">
              <p className="text-lg font-bold">{q ? t("noResults", { q }) : t("prompt")}</p>
              <p className="mt-1 text-sm text-muted">{t("tips")}</p>
            </div>
            <h2 className="mb-4 text-xl font-black">{t("popular")}</h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {popular.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
