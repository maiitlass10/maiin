import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetPassword } from "@/components/account/ResetPassword";

export const metadata = { robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-4xl py-6 pb-12">
        <h1 className="mb-6 text-2xl font-black">{t("setPassword")}</h1>
        <Suspense>
          <ResetPassword />
        </Suspense>
      </div>
    </div>
  );
}
