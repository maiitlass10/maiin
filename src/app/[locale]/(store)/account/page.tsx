import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountView } from "@/components/account/AccountView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-4xl py-6 pb-12">
        <h1 className="mb-6 text-2xl font-black sm:text-3xl">{t("title")}</h1>
        <Suspense>
          <AccountView />
        </Suspense>
      </div>
    </div>
  );
}
