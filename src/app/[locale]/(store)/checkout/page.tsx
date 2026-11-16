import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getRackPieces } from "@/lib/data";
import { bagItemsFrom } from "@/lib/bagItems";
import { RequireAccount } from "@/components/account/RequireAccount";
import { CheckoutView } from "@/components/account/CheckoutView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const [products, rack] = await Promise.all([getProducts(), getRackPieces()]);
  return (
    <div className="gutter">
      <div className="mx-auto max-w-6xl py-6 pb-12">
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">{t("title")}</h1>
        <RequireAccount>
          <CheckoutView items={bagItemsFrom(products, rack)} />
        </RequireAccount>
      </div>
    </div>
  );
}
