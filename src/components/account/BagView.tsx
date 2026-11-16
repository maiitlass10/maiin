"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { BagItem } from "@/lib/bagItems";
import { formatSyp, formatUsd } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import { checkPromo } from "@/app/[locale]/(store)/actions";
import { useBagTotals } from "./useBagTotals";

export function BagView({ items }: { items: Record<string, BagItem> }) {
  const t = useTranslations("bag");
  const locale = useLocale() as "ar" | "en";
  const { bag, setQty, removeFromBag, promo, setPromo, user } = useStore();
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const { lines, subtotal, count, discount, afterDiscount, shipping, total, promoState, setPromoState, settings } = useBagTotals(items);
  const left = Math.max(0, settings.freeShippingFrom - afterDiscount);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    start(async () => {
      const r = await checkPromo(c, subtotal);
      if (r.ok || r.error === "min_subtotal") setPromo(r.code);
      setPromoState(r.ok ? { discount: r.discount } : { discount: 0, error: r.error, min: r.minSubtotal });
      if (r.ok) setCode("");
    });
  };

  const promoError = promoState.error ? t(`promo_${promoState.error}`, { amount: formatUsd(promoState.min ?? 0) }) : null;

  if (!bag.length)
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted" strokeWidth={1.3} aria-hidden />
        <p className="mt-4 text-xl font-black">{t("empty")}</p>
        <p className="mt-1 text-muted">{t("emptyText")}</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center bg-fg px-8 font-bold text-bg">
          {t("shop")}
        </Link>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map(({ id, size, qty, item }) => {
          const out = item?.soldOut.includes(size);
          const name = item?.name[locale] ?? id;
          return (
            <li key={`${id}|${size}`} className={`flex gap-4 py-4 ${!item || out ? "opacity-60" : ""}`}>
              <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-soft sm:w-28">
                {item && (item.href ? (
                  <Link href={item.href} aria-label={name}>
                    <Image src={item.image} alt="" fill sizes="112px" className="object-cover" />
                  </Link>
                ) : (
                  <Image src={item.image} alt="" fill sizes="112px" className="object-contain p-2" />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{item ? (item.href ? <Link href={item.href} className="hover:underline">{name}</Link> : name) : t("unavailable")}</p>
                    <p className="mt-0.5 text-sm text-muted">{t("size", { size })}</p>
                    {out && <p className="mt-0.5 text-sm font-semibold text-sale">{t("soldOut")}</p>}
                  </div>
                  <button type="button" onClick={() => removeFromBag(id, size)} aria-label={`${t("remove")}: ${name}`} className="grid size-11 shrink-0 place-items-center text-muted hover:text-sale">
                    <Trash2 className="size-[18px]" aria-hidden />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  {item && !out ? (
                    <div className="flex h-10 items-center border border-line" role="group" aria-label={t("qty")}>
                      <button type="button" onClick={() => setQty(id, size, qty - 1)} disabled={qty <= 1} aria-label="−" className="grid h-full w-10 place-items-center disabled:opacity-30">
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <output className="w-8 text-center font-latin font-bold">{qty}</output>
                      <button type="button" onClick={() => setQty(id, size, qty + 1)} disabled={qty >= 9} aria-label="+" className="grid h-full w-10 place-items-center disabled:opacity-30">
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}
                  {item && (
                    <p className="text-end font-latin">
                      <span className={`block font-extrabold ${item.oldPrice ? "text-sale" : ""}`}>{formatUsd(item.price * qty)}</span>
                      {qty > 1 && <span className="text-xs text-muted">{formatUsd(item.price)} × {qty}</span>}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-max border border-line p-5 lg:sticky lg:top-40">
        <h2 className="mb-4 text-lg font-black">{t("summary")}</h2>
        <p className="mb-4 text-sm">
          {left > 0 ? t("freeLeft", { amount: formatUsd(left) }) : t("freeDone")}
          <span className="mt-2 block h-1.5 bg-soft">
            <span className="block h-full bg-ok transition-all" style={{ width: `${Math.min(100, (afterDiscount / settings.freeShippingFrom) * 100)}%` }} />
          </span>
        </p>

        {promo && !promoState.error ? (
          <div className="mb-4 flex items-center justify-between bg-soft px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Tag className="size-4" aria-hidden />
              {t("promoApplied", { code: promo })}
            </span>
            <button type="button" onClick={() => setPromo(null)} aria-label={t("removePromo")} className="grid size-9 place-items-center">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <form onSubmit={apply} className="mb-1">
            <label htmlFor="promo" className="mb-1.5 block text-sm font-semibold">
              {t("promo")}
            </label>
            <div className="flex">
              <input id="promo" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" className="h-11 min-w-0 flex-1 border border-line px-3 uppercase outline-none focus:border-fg" placeholder="WELCOME10" />
              <button type="submit" disabled={pending} className="h-11 bg-fg px-4 font-bold text-bg disabled:opacity-60">
                {t("apply")}
              </button>
            </div>
          </form>
        )}
        <p className="mb-3 min-h-5 text-sm text-sale" role="alert">
          {promoError}
          {promoState.error && promo && (
            <button type="button" onClick={() => setPromo(null)} className="ms-2 underline">
              {t("removePromo")}
            </button>
          )}
        </p>

        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt>
              {t("subtotal")} <span className="text-muted">({t("items", { count })})</span>
            </dt>
            <dd className="font-latin">{formatUsd(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sale">
              <dt>{t("discount")}</dt>
              <dd className="font-latin">−{formatUsd(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>{t("shipping")}</dt>
            <dd className="font-latin">{shipping ? formatUsd(shipping) : t("free")}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3 text-base font-black">
            <dt>{t("total")}</dt>
            <dd className="text-end font-latin">
              {formatUsd(total)}
              <span className="block text-xs font-normal text-muted">≈ {formatSyp(total, locale, settings.sypPerUsd)}</span>
            </dd>
          </div>
        </dl>
        <Link href={user ? "/checkout" : "/account?next=/checkout"} className="mt-5 flex h-12 items-center justify-center bg-fg font-bold text-bg transition-opacity hover:opacity-85">
          {user ? t("checkout") : t("signInToCheckout")}
        </Link>
        <Link href="/" className="mt-2 flex h-11 items-center justify-center text-sm font-semibold underline underline-offset-2">
          {t("continue")}
        </Link>
      </aside>
    </div>
  );
}
