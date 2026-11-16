import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RequireAccount } from "@/components/account/RequireAccount";
import { OrderDetail } from "@/components/account/OrderDetail";

export const metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const ta = await getTranslations("account");
  const to = await getTranslations("orders");
  return (
    <div className="gutter">
      <div className="mx-auto max-w-4xl pb-12">
        <Breadcrumbs items={[{ href: "/account", label: ta("title") }, { href: "/account/orders", label: to("title") }, { label: "#" }]} />
        <RequireAccount>
          <Suspense>
            <OrderDetail id={id} />
          </Suspense>
        </RequireAccount>
      </div>
    </div>
  );
}
