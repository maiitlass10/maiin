"use client";

import { useEffect, useMemo, useState } from "react";
import type { BagItem } from "@/lib/bagItems";
import { useStore } from "@/components/store/StoreProvider";
import { useSettings } from "@/components/store/SettingsProvider";
import { checkPromo } from "@/app/[locale]/(store)/actions";

export type PromoState = { discount: number; error?: string; min?: number };

/** Bag lines joined with product data, plus the same totals the database will charge. */
export function useBagTotals(items: Record<string, BagItem>) {
  const { bag, promo } = useStore();
  const settings = useSettings();
  const [promoState, setPromoState] = useState<PromoState>({ discount: 0 });

  const lines = bag.map((l) => ({ ...l, item: items[l.id] as BagItem | undefined }));
  const valid = lines.filter((l) => l.item && !l.item.soldOut.includes(l.size));
  const subtotal = useMemo(() => Math.round(valid.reduce((s, l) => s + l.item!.price * l.qty, 0) * 100) / 100, [valid]);
  const count = valid.reduce((n, l) => n + l.qty, 0);

  useEffect(() => {
    if (!promo) return setPromoState({ discount: 0 });
    let live = true;
    checkPromo(promo, subtotal).then((r) => live && setPromoState(r.ok ? { discount: r.discount } : { discount: 0, error: r.error, min: r.minSubtotal }));
    return () => {
      live = false;
    };
  }, [promo, subtotal]);

  const discount = promoState.discount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = count === 0 || afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingFee;
  const total = Math.round((afterDiscount + shipping) * 100) / 100;
  const hasProblem = lines.some((l) => !l.item || l.item.soldOut.includes(l.size));

  return { lines, valid, subtotal, count, discount, afterDiscount, shipping, total, promoState, setPromoState, hasProblem, settings };
}
