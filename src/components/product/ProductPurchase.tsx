"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Minus, Plus, Ruler, X } from "lucide-react";
import { COLORS, type Product } from "@/data/products";
import type { Localized } from "@/data/products";
import { useStore } from "@/components/store/StoreProvider";

type Chart = { headers: Localized[]; rows: string[][] } | null;

export function ProductPurchase({ product, chart }: { product: Product; chart: Chart }) {
  const t = useTranslations("pdp");
  const tp = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const { addToBag, toast, isWished, toggleWishlist } = useStore();
  const single = product.sizes.length === 1 ? product.sizes[0] : null;
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(single);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const chartRef = useRef<HTMLDialogElement>(null);
  const wished = isWished(product.id);
  const name = product.name[locale];

  const add = () => {
    if (!size) {
      setError(true);
      document.getElementById("pdp-sizes")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addToBag(product.id, size, qty);
    toast(tp("added", { name }));
  };

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">
          {t("color")}: <span className="font-normal text-muted">{COLORS[color][locale]}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button key={c} type="button" aria-pressed={c === color} aria-label={COLORS[c][locale]} onClick={() => setColor(c)} className={`grid size-11 place-items-center rounded-full border-2 ${c === color ? "border-fg" : "border-transparent"}`}>
              <span className="size-8 rounded-full border border-line" style={{ background: COLORS[c].hex }} />
            </button>
          ))}
        </div>
      </fieldset>

      {!single && (
        <fieldset id="pdp-sizes">
          <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold">
            <span>
              {tp("size")}: <span className="font-normal text-muted">{size ?? tp("chooseSize")}</span>
            </span>
            {chart && (
              <button type="button" onClick={() => chartRef.current?.showModal()} className="flex h-11 items-center gap-1.5 text-sm font-normal underline underline-offset-2">
                <Ruler className="size-4" aria-hidden />
                {t("sizeGuide")}
              </button>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = product.soldOut?.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  aria-pressed={size === s}
                  aria-label={out ? t("soldOutSize", { size: s }) : s}
                  onClick={() => {
                    setSize(s);
                    setError(false);
                  }}
                  className={`relative h-11 min-w-14 border px-3 font-latin text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:text-muted disabled:line-through disabled:opacity-60 ${size === s ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="mt-2 min-h-5 text-sm text-sale" role="alert">
            {error ? tp("sizeRequired") : ""}
          </p>
        </fieldset>
      )}

      <div className="flex gap-2">
        <div className="flex h-12 items-center border border-line" role="group" aria-label={t("quantity")}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t("less")} className="grid h-full w-11 place-items-center disabled:opacity-30" disabled={qty <= 1}>
            <Minus className="size-4" aria-hidden />
          </button>
          <output className="w-8 text-center font-latin font-bold" aria-live="polite">
            {qty}
          </output>
          <button type="button" onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label={t("more")} className="grid h-full w-11 place-items-center disabled:opacity-30" disabled={qty >= 9}>
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button type="button" onClick={add} className="h-12 flex-1 rounded-full bg-accent text-accent-fg font-bold transition-colors hover:bg-[#ff7d36]">
          {tp("addToBag")}
        </button>
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? tp("removeWishlist", { name }) : tp("addWishlist", { name })}
          onClick={() => toast(toggleWishlist(product.id) ? tp("wishAdded") : tp("wishRemoved"))}
          className="grid size-12 place-items-center border border-line hover:border-fg"
        >
          <Heart className={`size-5 ${wished ? "fill-sale text-sale" : ""}`} aria-hidden />
        </button>
      </div>

      {chart && (
        <dialog ref={chartRef} onClick={(e) => e.target === chartRef.current && chartRef.current?.close()} aria-labelledby="chart-title" className="m-auto w-[min(560px,calc(100%-24px))] bg-bg p-0 text-fg backdrop:bg-black/50">
          <div className="flex items-center justify-between border-b border-line px-5 py-2">
            <h2 id="chart-title" className="text-lg font-black">
              {t("sizeGuide")}
            </h2>
            <button type="button" onClick={() => chartRef.current?.close()} aria-label={tp("close")} className="grid size-11 place-items-center">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="p-5">
            <p className="mb-3 text-sm text-muted">{t("chartNote")}</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr className="bg-soft">
                    {chart.headers.map((h) => (
                      <th key={h.en} className="border border-line px-3 py-2 font-bold">
                        {h[locale]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-latin tabular-nums">
                  {chart.rows.map((r) => (
                    <tr key={r[0]} className={size === r[0] ? "bg-fg text-bg" : ""}>
                      {r.map((c, i) => (
                        <td key={i} className={`border border-line px-3 py-2 ${i === 0 ? "font-bold" : ""}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
