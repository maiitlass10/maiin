import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data";
import { WishlistView } from "@/components/account/WishlistView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("title"), robots: { index: false } };
}

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-7xl py-6 pb-12">
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">{t("title")}</h1>
        <WishlistView products={await getProducts()} />
      </div>
    </div>
  );
}
