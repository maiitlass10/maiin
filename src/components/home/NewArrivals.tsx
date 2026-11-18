"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { EdHeading } from "./EdHeading";

const tabs = ["all", "women", "men", "kids"] as const;

/** New arrivals with category tabs. New items first, then the best sellers. */
export function NewArrivals({ products }: { products: Product[] }) {
  const t = useTranslations();
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const sorted = [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.sold - a.sold);
  const list = (tab === "all" ? sorted : sorted.filter((p) => p.categories.includes(tab))).slice(0, 8);

  return (
    <section className="gutter py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <EdHeading kicker={t("ed.arrivals.kicker")} title={t("ed.arrivals.title")} href="/c/new" linkLabel={t("ed.arrivals.all")} />
        <div role="tablist" aria-label={t("ed.arrivals.title")} className="no-scrollbar -mt-2 mb-7 flex gap-6 overflow-x-auto border-b border-line">
          {tabs.map((k) => (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`-mb-px h-11 shrink-0 border-b-2 text-sm transition-colors ${tab === k ? "border-fg font-semibold" : "border-transparent text-muted hover:text-fg"}`}
            >
              {k === "all" ? t("home.tabAll") : t(`categories.${k}`)}
            </button>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {list.map((p, i) => (
            <li key={p.id} data-reveal>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
