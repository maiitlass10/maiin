"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Banknote, Check, MapPin, Smartphone } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { BagItem } from "@/lib/bagItems";
import { browserClient } from "@/lib/supabase/browser";
import { formatSyp, formatUsd } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import { placeOrder } from "@/app/[locale]/(store)/actions";
import type { Address } from "./AddressBook";
import { useBagTotals } from "./useBagTotals";

export function CheckoutView({ items }: { items: Record<string, BagItem> }) {
  const t = useTranslations("checkout");
  const tb = useTranslations("bag");
  const tg = useTranslations("governorates");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const { user, promo, clearBag, setPromo } = useStore();
  const supabase = useMemo(() => browserClient(), []);
  const { valid, subtotal, count, discount, shipping, total, promoState, hasProblem, settings } = useBagTotals(items);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [payment, setPayment] = useState<"cod" | "shamcash">("cod");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const shamCashReady = !!settings.shamCashAccount;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at")
      .then(({ data }) => {
        const list = (data ?? []) as Address[];
        setAddresses(list);
        setAddressId((cur) => cur ?? list[0]?.id ?? null);
      });
  }, [user, supabase]);

  const submit = () => {
    setError(null);
    if (!addressId) return setError(t("err_address_not_found"));
    start(async () => {
      const r = await placeOrder({ lines: valid.map((l) => ({ id: l.id, size: l.size, qty: l.qty })), addressId, payment, promo: promo && !promoState.error ? promo : null, notes });
      if (!r.ok) return setError(r.error === "generic" ? t("err_generic", { message: r.message ?? "" }) : t(`err_${r.error}`));
      clearBag();
      setPromo(null);
      router.replace(`/account/orders/${r.id}?placed=1`);
    });
  };

  if (!count)
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-bold">{t("emptyBag")}</p>
        <Link href="/" className="mt-5 inline-flex h-12 items-center bg-fg px-8 font-bold text-bg">
          {tb("shop")}
        </Link>
      </div>
    );

  const option = (key: "cod" | "shamcash", Icon: typeof Banknote, disabled = false) => (
    <label className={`flex cursor-pointer gap-3 border p-4 ${payment === key ? "border-fg" : "border-line"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <input type="radio" name="payment" value={key} checked={payment === key} disabled={disabled} onChange={() => setPayment(key)} className="mt-1 size-5 accent-fg" />
      <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.7} aria-hidden />
      <span>
        <span className="block font-bold">{t(key)}</span>
        <span className="text-sm text-muted">{disabled ? t("shamcashSoon") : t(`${key}Text`)}</span>
      </span>
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid content-start gap-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">{t("address")}</h2>
            <Link href="/account/addresses?return=/checkout" className="text-sm underline underline-offset-2">
              {addresses?.length ? t("manageAddresses") : t("addAddress")}
            </Link>
          </div>
          {addresses === null ? (
            <div className="h-24" aria-busy="true" />
          ) : addresses.length === 0 ? (
            <div className="border border-line p-5 text-center">
              <p className="text-muted">{t("noAddress")}</p>
              <Link href="/account/addresses?return=/checkout" className="mt-4 inline-flex h-11 items-center bg-fg px-6 font-bold text-bg">
                {t("addAddress")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-2" role="radiogroup" aria-label={t("address")}>
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer gap-3 border p-4 ${addressId === a.id ? "border-fg" : "border-line"}`}>
                  <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 size-5 accent-fg" />
                  <MapPin className="mt-0.5 size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                  <span className="min-w-0 text-sm">
                    <span className="block font-bold">{a.label || a.full_name}</span>
                    <span className="block">
                      {a.full_name} · <span dir="ltr">{a.phone}</span>
                    </span>
                    <span className="block text-muted">{[tg(a.governorate as never), a.area, a.street, a.details].filter(Boolean).join("، ")}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-black">{t("payment")}</h2>
          <div className="grid gap-2">
            {option("cod", Banknote)}
            {option("shamcash", Smartphone, !shamCashReady)}
          </div>
        </section>

        <section>
          <label htmlFor="notes" className="mb-2 block text-lg font-black">
            {t("notes")}
          </label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder={t("notesPh")} className="min-h-24 w-full border border-line p-3 outline-none focus:border-fg" />
        </section>
      </div>

      <aside className="h-max border border-line p-5 lg:sticky lg:top-40">
        <h2 className="mb-4 text-lg font-black">{t("summary")}</h2>
        <ul className="mb-4 grid max-h-72 gap-3 overflow-y-auto">
          {valid.map((l) => (
            <li key={`${l.id}|${l.size}`} className="flex items-center gap-3 text-sm">
              <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-soft">
                <Image src={l.item!.image} alt="" fill sizes="48px" className="object-cover" />
                <span className="absolute -end-0 -top-0 grid min-w-5 place-items-center bg-fg px-1 font-latin text-[11px] text-bg">{l.qty}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{l.item!.name[locale]}</span>
                <span className="text-muted">{tb("size", { size: l.size })}</span>
              </span>
              <span className="font-latin font-bold">{formatUsd(l.item!.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>{tb("subtotal")}</dt>
            <dd className="font-latin">{formatUsd(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sale">
              <dt>
                {tb("discount")} <span dir="ltr">({promo})</span>
              </dt>
              <dd className="font-latin">−{formatUsd(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>{tb("shipping")}</dt>
            <dd className="font-latin">{shipping ? formatUsd(shipping) : tb("free")}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3 text-base font-black">
            <dt>{tb("total")}</dt>
            <dd className="text-end font-latin">
              {formatUsd(total)}
              <span className="block text-xs font-normal text-muted">≈ {formatSyp(total, locale, settings.sypPerUsd)}</span>
            </dd>
          </div>
        </dl>
        {hasProblem && <p className="mt-3 text-sm text-sale">{t("err_unavailable")}</p>}
        {addresses !== null && !addressId && !error && <p className="mt-3 text-sm font-semibold text-sale">{t("needAddress")}</p>}
        {error && (
          <p className="mt-3 text-sm font-semibold text-sale" role="alert">
            {error}
          </p>
        )}
        <button type="button" onClick={submit} disabled={pending || !addressId} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-accent-fg font-bold transition-colors hover:bg-[#ff7d36] disabled:opacity-50">
          <Check className="size-5" aria-hidden />
          {pending ? t("placing") : t("place")}
        </button>
        <p className="mt-3 text-center text-xs text-muted">{t("terms")}</p>
      </aside>
    </div>
  );
}
