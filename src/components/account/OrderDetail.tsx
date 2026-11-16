"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, ImagePlus, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { formatSyp, formatUsd } from "@/lib/format";
import { toWebp } from "@/lib/images";
import { useStore } from "@/components/store/StoreProvider";
import { useSettings } from "@/components/store/SettingsProvider";
import { OrderStatus } from "./OrderStatus";

type Item = { id: number; item_id: string; name_ar: string; name_en: string; image: string | null; size: string; qty: number; unit_price: number };
type Order = {
  id: string;
  number: number;
  status: string;
  payment_method: "cod" | "shamcash";
  payment_status: string;
  receipt_url: string | null;
  contact_name: string;
  contact_phone: string;
  address: { label?: string; governorate: string; area: string; street?: string; details?: string };
  notes: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  syp_rate: number;
  promo_code: string | null;
  created_at: string;
  order_items: Item[];
};

export function OrderDetail({ id }: { id: string }) {
  const t = useTranslations("order");
  const to = useTranslations("orders");
  const tb = useTranslations("bag");
  const tc = useTranslations("checkout");
  const tg = useTranslations("governorates");
  const locale = useLocale() as "ar" | "en";
  const placed = useSearchParams().get("placed") === "1";
  const { user } = useStore();
  const { shamCashAccount } = useSettings();
  const supabase = useMemo(() => browserClient(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
    setOrder((data as Order) ?? null);
  }, [supabase, id]);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const upload = async (file?: File) => {
    if (!file || !user || !order) return;
    setBusy(true);
    setMsg(null);
    try {
      const path = `${user.id}/${order.id}-${Date.now()}.webp`;
      const { error } = await supabase.storage.from("receipts").upload(path, await toWebp(file, 1600), { contentType: "image/webp" });
      if (error) throw error;
      const { error: e2 } = await supabase.rpc("attach_receipt", { p_order: order.id, p_path: path });
      if (e2) throw e2;
      await load();
    } catch (e) {
      setMsg(t("receiptFailed", { message: (e as Error).message }));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (order === undefined) return <div className="h-64" aria-busy="true" />;
  if (order === null) return <p className="border border-line p-8 text-center">{t("notFound")}</p>;

  const needsReceipt = order.payment_method === "shamcash" && order.status !== "cancelled" && order.payment_status === "unpaid";
  const awaiting = order.payment_method === "shamcash" && order.payment_status === "awaiting_confirmation";
  const a = order.address;

  return (
    <div className="grid gap-6">
      {placed && (
        <div className="flex gap-3 bg-ok/10 p-4 text-ok">
          <CheckCircle2 className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="text-lg font-black">{t("placedTitle")}</p>
            <p className="text-sm">{t("placedText", { n: order.number })}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-black">{to("number", { n: order.number })}</h2>
        <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString(locale === "ar" ? "ar-SY" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
      </div>
      <OrderStatus status={order.status} />

      {(needsReceipt || awaiting) && (
        <section className="border-2 border-fg p-5">
          <h3 className="text-lg font-black">{t("payTitle")}</h3>
          {needsReceipt ? (
            <>
              <p className="mt-2 text-sm">{t("payText", { amount: formatUsd(Number(order.total)), syp: formatSyp(Number(order.total), locale, Number(order.syp_rate)) })}</p>
              {shamCashAccount && (
                <div className="mt-3 flex items-center justify-between gap-3 bg-soft p-3">
                  <span>
                    <span className="block text-xs text-muted">{t("account")}</span>
                    <span className="font-latin text-lg font-extrabold tracking-wider" dir="ltr">
                      {shamCashAccount}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(shamCashAccount).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
                    className="flex h-10 items-center gap-1.5 border border-fg px-3 text-sm font-bold"
                  >
                    <Copy className="size-4" aria-hidden />
                    {copied ? t("copied") : t("copy")}
                  </button>
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-fg font-bold text-bg disabled:opacity-60">
                {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
                {busy ? t("uploading") : t("uploadReceipt")}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
              <p className="mt-2 text-xs text-muted">{t("cancelWarning")}</p>
            </>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ok">
              <CheckCircle2 className="size-5" aria-hidden />
              {t("receiptSent")}
            </p>
          )}
          {msg && (
            <p className="mt-2 text-sm font-semibold text-sale" role="alert">
              {msg}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-line p-4 text-sm">
          <h3 className="mb-2 font-black">{t("deliverTo")}</h3>
          <p className="font-semibold">
            {order.contact_name} · <span dir="ltr">{order.contact_phone}</span>
          </p>
          <p className="text-muted">{[tg(a.governorate as never), a.area, a.street, a.details].filter(Boolean).join("، ")}</p>
          {order.notes && (
            <p className="mt-2">
              <b>{t("notes")}:</b> {order.notes}
            </p>
          )}
        </section>
        <section className="border border-line p-4 text-sm">
          <h3 className="mb-2 font-black">{t("payment")}</h3>
          <p className="font-semibold">{tc(order.payment_method)}</p>
          <p className="text-muted">{to(`pay_${order.payment_status}`)}</p>
        </section>
      </div>

      <section>
        <h3 className="mb-2 font-black">{t("items")}</h3>
        <ul className="divide-y divide-line border-y border-line">
          {order.order_items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-soft">{i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{locale === "ar" ? i.name_ar : i.name_en}</span>
                <span className="text-muted">
                  {tb("size", { size: i.size })} · × {i.qty}
                </span>
              </span>
              <span className="font-latin font-bold">{formatUsd(Number(i.unit_price) * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="ms-auto mt-3 grid max-w-xs gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt>{tb("subtotal")}</dt>
            <dd className="font-latin">{formatUsd(Number(order.subtotal))}</dd>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sale">
              <dt>
                {tb("discount")} <span dir="ltr">({order.promo_code})</span>
              </dt>
              <dd className="font-latin">−{formatUsd(Number(order.discount))}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>{tb("shipping")}</dt>
            <dd className="font-latin">{Number(order.shipping) ? formatUsd(Number(order.shipping)) : tb("free")}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-black">
            <dt>{tb("total")}</dt>
            <dd className="text-end font-latin">
              {formatUsd(Number(order.total))}
              <span className="block text-xs font-normal text-muted">≈ {formatSyp(Number(order.total), locale, Number(order.syp_rate))}</span>
            </dd>
          </div>
        </dl>
      </section>
      <Link href="/account/orders" className="text-sm font-semibold underline underline-offset-2">
        {t("back")}
      </Link>
    </div>
  );
}
