"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { formatUsd } from "@/lib/format";

type Order = { id: string; number: number; status: string; payment_status: string; total: number; created_at: string; order_items: { qty: number }[] };

export function OrdersList() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const supabase = useMemo(() => browserClient(), []);
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    supabase
      .from("orders")
      .select("id, number, status, payment_status, total, created_at, order_items(qty)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
  }, [supabase]);

  if (orders === null) return <div className="h-32" aria-busy="true" />;
  if (!orders.length)
    return (
      <div className="border border-line py-16 text-center">
        <Package className="mx-auto size-10 text-muted" strokeWidth={1.3} aria-hidden />
        <p className="mt-3 font-bold">{t("empty")}</p>
        <Link href="/" className="mt-5 inline-flex h-12 items-center bg-fg px-8 font-bold text-bg">
          {t("emptyCta")}
        </Link>
      </div>
    );
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-bold">{t("number", { n: o.number })}</p>
            <p className="text-sm text-muted">
              {new Date(o.created_at).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-GB", { dateStyle: "medium" })} · {t("items", { count: o.order_items.reduce((n, i) => n + i.qty, 0) })}
            </p>
          </div>
          <div className="text-end">
            <p className="font-latin font-extrabold">{formatUsd(Number(o.total))}</p>
            <p className="text-sm">
              <span className="bg-soft px-2 py-0.5 font-semibold">{t(`status_${o.status}`)}</span> <span className="text-muted">{t(`pay_${o.payment_status}`)}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
