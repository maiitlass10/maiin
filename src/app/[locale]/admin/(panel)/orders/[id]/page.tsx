import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serverClient } from "@/lib/supabase/server";
import { formatSyp, formatUsd } from "@/lib/format";
import { OrderStatus } from "@/components/account/OrderStatus";
import { OrderActions } from "@/components/admin/OrderActions";
import { Section } from "@/components/admin/ui";

type Item = { id: number; name_ar: string; name_en: string; image: string | null; size: string; qty: number; unit_price: number; item_id: string };

export default async function OrderAdmin({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const l = locale as "ar" | "en";
  const t = await getTranslations("admin.orders");
  const to = await getTranslations("orders");
  const tor = await getTranslations("order");
  const tb = await getTranslations("bag");
  const tc = await getTranslations("checkout");
  const tg = await getTranslations("governorates");
  const supabase = await serverClient();
  const { data: o } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const receipt = o.receipt_url ? (await supabase.storage.from("receipts").createSignedUrl(o.receipt_url, 600)).data?.signedUrl : null;
  const phone = String(o.contact_phone).replace(/[\s-]/g, "");
  const intl = phone.replace(/^(\+|00)?963/, "").replace(/^0/, "");
  const a = o.address as { governorate: string; area: string; street?: string; details?: string };

  return (
    <div className="mx-auto grid max-w-5xl gap-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" aria-label={t("title")} className="grid size-11 place-items-center border border-line bg-bg">
          <ArrowRight className="size-5 ltr:rotate-180" aria-hidden />
        </Link>
        <h1 className="text-2xl font-black">{to("number", { n: o.number })}</h1>
        <span className="text-sm text-muted">{new Date(o.created_at).toLocaleString(l === "ar" ? "ar-SY" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
      </div>
      <div className="border border-line bg-bg p-4">
        <OrderStatus status={o.status} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <Section title={tor("items")}>
            <ul className="-my-2 divide-y divide-line">
              {(o.order_items as Item[]).map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-soft">{i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{l === "ar" ? i.name_ar : i.name_en}</span>
                    <span className="text-muted">
                      {tb("size", { size: i.size })} · × {i.qty} · <span dir="ltr">{i.item_id}</span>
                    </span>
                  </span>
                  <span className="font-latin font-bold">{formatUsd(Number(i.unit_price) * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="grid gap-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt>{tb("subtotal")}</dt>
                <dd className="font-latin">{formatUsd(Number(o.subtotal))}</dd>
              </div>
              {Number(o.discount) > 0 && (
                <div className="flex justify-between text-sale">
                  <dt>
                    {tb("discount")} <span dir="ltr">({o.promo_code})</span>
                  </dt>
                  <dd className="font-latin">−{formatUsd(Number(o.discount))}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{tb("shipping")}</dt>
                <dd className="font-latin">{Number(o.shipping) ? formatUsd(Number(o.shipping)) : tb("free")}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-black">
                <dt>{tb("total")}</dt>
                <dd className="text-end font-latin">
                  {formatUsd(Number(o.total))}
                  <span className="block text-xs font-normal text-muted">≈ {formatSyp(Number(o.total), l, Number(o.syp_rate))}</span>
                </dd>
              </div>
            </dl>
          </Section>
          <Section title={t("customer")}>
            <div className="text-sm">
              <p className="font-bold">{o.contact_name}</p>
              <p dir="ltr" className="text-start">
                {o.contact_phone}
              </p>
              {o.contact_email && (
                <p dir="ltr" className="text-start text-muted">
                  {o.contact_email}
                </p>
              )}
              <p className="mt-2">{[tg(a.governorate as never), a.area, a.street, a.details].filter(Boolean).join("، ")}</p>
              {o.notes && (
                <p className="mt-2 bg-soft p-2">
                  <b>{tor("notes")}:</b> {o.notes}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <a href={`tel:${phone}`} className="flex h-11 flex-1 items-center justify-center gap-2 border border-line font-semibold">
                <Phone className="size-4" aria-hidden />
                {t("callCustomer")}
              </a>
              <a href={`https://wa.me/963${intl}`} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 border border-line font-semibold">
                <MessageCircle className="size-4" aria-hidden />
                {t("whatsapp")}
              </a>
            </div>
          </Section>
        </div>
        <div className="grid content-start gap-4">
          <Section title={tor("payment")}>
            <p className="text-sm">
              <b>{tc(o.payment_method)}</b> · {to(`pay_${o.payment_status}`)}
            </p>
            {o.payment_method === "shamcash" && (
              <div>
                <p className="mb-2 text-sm font-bold">{t("receipt")}</p>
                {receipt ? (
                  <a href={receipt} target="_blank" rel="noreferrer" className="block" title={t("openReceipt")}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not worth optimising */}
                    <img src={receipt} alt={t("receipt")} className="max-h-96 w-full border border-line object-contain" />
                  </a>
                ) : (
                  <p className="text-sm text-muted">{t("noReceipt")}</p>
                )}
              </div>
            )}
            <OrderActions id={o.id} status={o.status} paymentStatus={o.payment_status} paymentMethod={o.payment_method} />
          </Section>
        </div>
      </div>
    </div>
  );
}
