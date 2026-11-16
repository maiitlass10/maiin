import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RequireAccount } from "@/components/account/RequireAccount";
import { OrdersList } from "@/components/account/OrdersList";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });
  return { title: t("title"), robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orders");
  const ta = await getTranslations("account");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-4xl pb-12">
        <Breadcrumbs items={[{ href: "/account", label: ta("title") }, { label: t("title") }]} />
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">{t("title")}</h1>
        <RequireAccount>
          <OrdersList />
        </RequireAccount>
      </div>
    </div>
  );
}
