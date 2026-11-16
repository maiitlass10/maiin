import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus, Settings, Shirt } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serverClient, currentStaff } from "@/lib/supabase/server";

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");
  const supabase = await serverClient();
  const staff = await currentStaff();
  const [{ data: products }, { count: rackCount }, { data: settings }, { count: newOrders }, { count: awaiting }] = await Promise.all([
    supabase.from("products").select("is_active, old_price, is_flash, sold_out"),
    supabase.from("rack_pieces").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("settings").select("syp_per_usd").eq("id", 1).maybeSingle(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "awaiting_confirmation"),
  ]);
  const to = await getTranslations("admin.orders");
  const rows = products ?? [];
  const stats = [
    { label: t("products"), value: rows.filter((p) => p.is_active).length },
    { label: t("hidden"), value: rows.filter((p) => !p.is_active).length },
    { label: t("onSale"), value: rows.filter((p) => p.old_price).length },
    { label: t("flash"), value: rows.filter((p) => p.is_flash).length },
    { label: t("soldOutSizes"), value: rows.reduce((n, p) => n + (p.sold_out?.length ?? 0), 0) },
    { label: t("rack"), value: rackCount ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-black">
        {t("hello")} <span className="font-normal text-muted" dir="ltr">{staff?.user.email?.split("@")[0]}</span>
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/admin/orders?f=new" className="border-2 border-fg bg-bg p-4">
          <p className="font-latin text-3xl font-extrabold tabular-nums">{newOrders ?? 0}</p>
          <p className="text-sm font-semibold">{to("newOrders")}</p>
        </Link>
        <Link href="/admin/orders?f=awaiting" className={`border-2 bg-bg p-4 ${awaiting ? "border-sale text-sale" : "border-line"}`}>
          <p className="font-latin text-3xl font-extrabold tabular-nums">{awaiting ?? 0}</p>
          <p className="text-sm font-semibold">{to("awaiting")}</p>
        </Link>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className="border border-line bg-bg p-4">
            <p className="font-latin text-3xl font-extrabold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </li>
        ))}
        <li className="col-span-2 border border-line bg-bg p-4 sm:col-span-3">
          <p className="text-sm text-muted">{t("rate")}</p>
          <p className="font-latin text-2xl font-extrabold tabular-nums" dir="ltr">
            1 USD = {Number(settings?.syp_per_usd ?? 0).toLocaleString("en-US")} SYP
          </p>
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/products/new" className="flex h-12 items-center gap-2 bg-fg px-5 font-bold text-bg">
          <Plus className="size-5" aria-hidden />
          {t("addProduct")}
        </Link>
        <Link href="/admin/rack" className="flex h-12 items-center gap-2 border border-line bg-bg px-5 font-bold">
          <Shirt className="size-5" aria-hidden />
          {t("manageRack")}
        </Link>
        <Link href="/admin/settings" className="flex h-12 items-center gap-2 border border-line bg-bg px-5 font-bold">
          <Settings className="size-5" aria-hidden />
          {t("editSettings")}
        </Link>
      </div>
    </div>
  );
}
