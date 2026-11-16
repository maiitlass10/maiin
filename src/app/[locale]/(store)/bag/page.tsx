import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getRackPieces } from "@/lib/data";
import { bagItemsFrom } from "@/lib/bagItems";
import { BagView } from "@/components/account/BagView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bag" });
  return { title: t("title"), robots: { index: false } };
}

export default async function BagPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bag");
  const [products, rack] = await Promise.all([getProducts(), getRackPieces()]);
  return (
    <div className="gutter">
      <div className="mx-auto max-w-7xl py-6 pb-12">
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">{t("title")}</h1>
        <BagView items={bagItemsFrom(products, rack)} />
      </div>
    </div>
  );
}
