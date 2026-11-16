import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serverClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/format";
import { Badge } from "@/components/admin/ui";

const FILTERS = ["all", "awaiting", "new", "confirmed", "preparing", "shipped", "delivered", "cancelled"] as const;

export default async function OrdersAdmin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ f?: string; q?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { f = "all", q = "" } = await searchParams;
  const t = await getTranslations("admin.orders");
  const to = await getTranslations("orders");
  const tc = await getTranslations("checkout");
  const lang = await getLocale();
  const supabase = await serverClient();
  const { data: cancelled } = await supabase.rpc("cancel_stale_orders");

  let query = supabase.from("orders").select("id, number, status, payment_method, payment_status, total, contact_name, contact_phone, created_at").order("created_at", { ascending: false }).limit(200);
  if (f === "awaiting") query = query.eq("payment_status", "awaiting_confirmation");
  else if (f !== "all") query = query.eq("status", f);
  const term = q.trim().replace(/[%,()]/g, "");
  if (term) query = /^\d+$/.test(term) ? query.or(`number.eq.${term},contact_phone.ilike.%${term}%`) : query.ilike("contact_name", `%${term}%`);
  const { data: orders } = await query;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-black">{t("title")}</h1>
      {Number(cancelled) > 0 && <p className="mb-4 bg-soft p-3 text-sm">{t("autoCancelled", { count: Number(cancelled) })}</p>}
      <form className="mb-3 flex gap-2">
        <input type="hidden" name="f" value={f} />
        <input name="q" defaultValue={q} placeholder={t("search")} aria-label={t("search")} className="h-11 flex-1 border border-line bg-bg px-3 outline-none focus:border-fg" />
      </form>
      <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto" aria-label={t("title")}>
        {FILTERS.map((k) => (
          <Link key={k} href={{ pathname: "/admin/orders", query: k === "all" ? {} : { f: k } }} aria-current={f === k ? "page" : undefined} className={`flex h-10 shrink-0 items-center border px-3 text-sm font-semibold ${f === k ? "border-fg bg-fg text-bg" : "border-line bg-bg"}`}>
            {k === "all" ? t("all") : k === "awaiting" ? t("awaiting") : to(`status_${k}`)}
          </Link>
        ))}
      </nav>
      {!orders?.length ? (
        <p className="border border-line bg-bg p-8 text-center text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-bg">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-3 p-3 hover:bg-soft">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    #{o.number} · {o.contact_name}
                  </span>
                  <span className="text-sm text-muted">
                    <span dir="ltr">{o.contact_phone}</span> · {new Date(o.created_at).toLocaleString(lang === "ar" ? "ar-SY" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={o.status === "cancelled" ? "sale" : o.status === "delivered" ? "ok" : "muted"}>{to(`status_${o.status}`)}</Badge>
                  <Badge tone={o.payment_status === "paid" ? "ok" : o.payment_status === "awaiting_confirmation" ? "sale" : "muted"}>
                    {tc(o.payment_method)} · {to(`pay_${o.payment_status}`)}
                  </Badge>
                </span>
                <span className="w-20 text-end font-latin font-extrabold">{formatUsd(Number(o.total))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
