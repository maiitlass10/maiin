"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { discountPercent, type Product } from "@/data/products";
import { formatSyp, formatUsd } from "@/lib/format";
import { useStore } from "./StoreProvider";

export function QuickAddDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const t = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const { addToBag, toast } = useStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (product && !d.open) {
      const single = product.sizes.length === 1 ? product.sizes[0] : null;
      setSize(single);
      setError(false);
      d.showModal();
    }
    if (!product && d.open) d.close();
  }, [product]);

  if (!product) return <dialog ref={dialog} className="hidden" />;
  const off = discountPercent(product);

  const add = () => {
    if (!size) {
      setError(true);
      return;
    }
    addToBag(product.id, size);
    toast(t("added", { name: product.name[locale] }));
    onClose();
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-labelledby="qa-title"
      className="m-auto w-[min(720px,calc(100%-24px))] max-h-[calc(100dvh-24px)] bg-bg p-0 text-fg backdrop:bg-black/50 max-sm:mb-0 max-sm:w-full"
    >
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative aspect-[3/4] bg-soft max-sm:hidden">
          <Image src={product.image} alt={product.name[locale]} fill sizes="340px" className="object-cover" />
        </div>
        <div className="relative flex flex-col gap-4 p-5 sm:p-6">
          <button type="button" onClick={onClose} aria-label={t("close")} className="absolute end-2 top-2 grid size-11 place-items-center">
            <X className="size-5" aria-hidden />
          </button>
          <h2 id="qa-title" className="pe-10 text-xl font-bold leading-snug">
            {product.name[locale]}
          </h2>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={`font-latin text-2xl font-extrabold ${off ? "text-sale" : ""}`}>{formatUsd(product.price)}</span>
            {product.oldPrice && <s className="font-latin text-muted">{formatUsd(product.oldPrice)}</s>}
            {off > 0 && <span className="bg-sale px-1.5 text-xs font-bold text-white">-{off}%</span>}
            <span className="w-full text-sm text-muted">≈ {formatSyp(product.price, locale)}</span>
          </div>
          <fieldset>
            <legend className="mb-2 flex w-full justify-between text-sm font-semibold">
              {t("size")}
              <span className="font-normal text-muted">{size ?? t("chooseSize")}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    setError(false);
                  }}
                  className={`h-11 min-w-12 border px-3 font-latin text-sm font-semibold transition-colors ${
                    size === s ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-sm text-sale" role="alert">
              {error ? t("sizeRequired") : ""}
            </p>
          </fieldset>
          <button type="button" onClick={add} className="mt-auto h-12 bg-fg font-bold text-bg transition-opacity hover:opacity-85">
            {t("addToBag")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
