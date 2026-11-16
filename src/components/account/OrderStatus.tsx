"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

const STEPS = ["new", "confirmed", "preparing", "shipped", "delivered"] as const;

/** Five-step progress bar for an order; cancelled orders show a notice instead. */
export function OrderStatus({ status }: { status: string }) {
  const t = useTranslations("order");
  if (status === "cancelled") return <p className="bg-sale/10 p-3 text-sm font-semibold text-sale">{t("cancelled")}</p>;
  const at = Math.max(0, STEPS.indexOf(status as (typeof STEPS)[number]));
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label={t("status")}>
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === at ? "step" : undefined} className="grid justify-items-center gap-1.5 text-center text-[11px] sm:text-xs">
          <span className={`grid size-7 place-items-center rounded-full border-2 ${i <= at ? "border-fg bg-fg text-bg" : "border-line text-muted"}`}>
            {i < at ? <Check className="size-4" aria-hidden /> : <span className="font-latin font-bold">{i + 1}</span>}
          </span>
          <span className={i <= at ? "font-bold" : "text-muted"}>{t(`steps.${s}`)}</span>
        </li>
      ))}
    </ol>
  );
}
