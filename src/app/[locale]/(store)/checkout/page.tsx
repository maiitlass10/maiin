import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RequireAccount } from "@/components/account/RequireAccount";

export const metadata = { robots: { index: false } };

/** Placeholder until Sprint 5 builds the checkout. */
export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const tb = await getTranslations("bag");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-2xl py-10 pb-16">
        <h1 className="mb-6 text-2xl font-black">{t("title")}</h1>
        <RequireAccount>
          <div className="border border-line p-8 text-center">
            <p className="text-lg font-bold">{t("soon")}</p>
            <p className="mt-2 text-muted">{t("soonText")}</p>
            <Link href="/bag" className="mt-6 inline-flex h-12 items-center border border-fg px-8 font-bold">
              {tb("title")}
            </Link>
          </div>
        </RequireAccount>
      </div>
    </div>
  );
}
