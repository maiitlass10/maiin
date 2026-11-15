"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

const tabs = ["all", "women", "men", "kids"] as const;
const PAGE = 10;

export function RecommendedGrid() {
  const t = useTranslations();
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const [shown, setShown] = useState(PAGE);
  const list = tab === "all" ? products : products.filter((p) => p.categories.includes(tab));

  return (
    <section className="gutter py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-3 text-xl font-black sm:text-2xl">{t("home.forYou")}</h2>
        <div role="tablist" aria-label={t("home.forYou")} className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {tabs.map((k) => (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={tab === k}
              onClick={() => {
                setTab(k);
                setShown(PAGE);
              }}
              className={`h-10 shrink-0 border px-4 text-sm font-semibold transition-colors ${tab === k ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}
            >
              {k === "all" ? t("home.tabAll") : t(`categories.${k}`)}
            </button>
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.slice(0, shown).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
        {shown < list.length && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setShown((s) => s + PAGE)}
              className="h-12 border-2 border-fg px-10 font-bold transition-colors hover:bg-fg hover:text-bg"
            >
              {t("home.showMore")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
