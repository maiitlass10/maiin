"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { COLORS, type ColorKey, type Product } from "@/data/products";
import { colorsIn, priceBuckets, sizesIn } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

const sorts = ["recommended", "newest", "priceAsc", "priceDesc", "bestselling", "rating"] as const;
type Sort = (typeof sorts)[number];
const BATCH = 12;

function sortList(list: Product[], sort: Sort) {
  const l = [...list];
  if (sort === "priceAsc") l.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") l.sort((a, b) => b.price - a.price);
  if (sort === "bestselling") l.sort((a, b) => b.sold - a.sold);
  if (sort === "rating") l.sort((a, b) => b.rating - a.rating);
  if (sort === "newest") l.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  return l;
}

/**
 * Filters live in the URL (?size=M&color=red&price=20-40&sale=1&sort=priceAsc)
 * so a filtered page can be shared or bookmarked.
 */
export function ProductListing({ items }: { items: Product[] }) {
  const t = useTranslations("listing");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [panel, setPanel] = useState(false);
  const [shown, setShown] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement>(null);

  const sizes = params.getAll("size");
  const colors = params.getAll("color") as ColorKey[];
  const prices = params.getAll("price");
  const saleOnly = params.get("sale") === "1";
  const sort = (sorts as readonly string[]).includes(params.get("sort") ?? "") ? (params.get("sort") as Sort) : "recommended";

  const allSizes = useMemo(() => sizesIn(items), [items]);
  const allColors = useMemo(() => colorsIn(items), [items]);

  const filtered = useMemo(() => {
    const list = items.filter(
      (p) =>
        (!sizes.length || sizes.some((s) => p.sizes.includes(s) && !p.soldOut?.includes(s))) &&
        (!colors.length || colors.some((c) => p.colors.includes(c))) &&
        (!prices.length || prices.some((k) => {
          const b = priceBuckets.find((x) => x.key === k);
          return b ? p.price >= b.min && p.price < b.max : true;
        })) &&
        (!saleOnly || !!p.oldPrice),
    );
    return sortList(list, sort);
  }, [items, sizes, colors, prices, saleOnly, sort]);

  const activeCount = sizes.length + colors.length + prices.length + (saleOnly ? 1 : 0);
  const filterKey = params.toString();
  useEffect(() => setShown(BATCH), [filterKey]);

  // Infinite scroll: reveal the next batch when the sentinel comes into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setShown((s) => s + BATCH), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, shown]);

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel]);

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (key: string, value: string) =>
    update((p) => {
      const vals = p.getAll(key);
      p.delete(key);
      (vals.includes(value) ? vals.filter((v) => v !== value) : [...vals, value]).forEach((v) => p.append(key, v));
    });
  const clearAll = () => update((p) => ["size", "color", "price", "sale"].forEach((k) => p.delete(k)));

  const filters = (
    <div className="grid gap-7">
      {allSizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-bold">{t("size")}</legend>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggle("size", s)} className={`h-10 min-w-11 border px-2.5 font-latin text-sm font-semibold transition-colors ${sizes.includes(s) ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-3 text-sm font-bold">{t("color")}</legend>
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <button key={c} type="button" aria-pressed={colors.includes(c)} onClick={() => toggle("color", c)} className={`flex h-10 items-center gap-2 border pe-3 ps-2 text-sm transition-colors ${colors.includes(c) ? "border-fg bg-soft font-semibold" : "border-line hover:border-fg"}`}>
              <span className="size-5 rounded-full border border-line" style={{ background: COLORS[c].hex }} />
              {COLORS[c][locale]}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-bold">{t("price")}</legend>
        <div className="grid gap-1">
          {priceBuckets.map((b) => (
            <label key={b.key} className="flex h-10 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={prices.includes(b.key)} onChange={() => toggle("price", b.key)} className="size-5 accent-fg" />
              {t(`price_${b.key}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex h-10 cursor-pointer items-center gap-3 text-sm font-semibold">
        <input type="checkbox" checked={saleOnly} onChange={() => update((p) => (saleOnly ? p.delete("sale") : p.set("sale", "1")))} className="size-5 accent-fg" />
        {t("saleOnly")}
      </label>
    </div>
  );

  const chips = [
    ...sizes.map((s) => ({ key: "size", value: s, label: s })),
    ...colors.map((c) => ({ key: "color", value: c, label: COLORS[c]?.[locale] ?? c })),
    ...prices.map((k) => ({ key: "price", value: k, label: t(`price_${k}`) })),
    ...(saleOnly ? [{ key: "sale", value: "1", label: t("saleOnly") }] : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-36">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">{t("filters")}</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-sm text-muted underline underline-offset-2 hover:text-fg">
                {t("clearAll")}
              </button>
            )}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-[118px] z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-line bg-bg px-4 py-2 md:top-[152px] lg:static lg:mx-0 lg:border-0 lg:px-0 lg:py-0">
          <button type="button" onClick={() => setPanel(true)} className="flex h-10 items-center gap-2 border border-line px-3 text-sm font-semibold lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("filters")}
            {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-fg font-latin text-[11px] text-bg">{activeCount}</span>}
          </button>
          <p className="text-sm text-muted" aria-live="polite">
            {t("count", { count: filtered.length })}
          </p>
          <label className="ms-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{t("sortBy")}</span>
            <select value={sort} onChange={(e) => update((p) => (e.target.value === "recommended" ? p.delete("sort") : p.set("sort", e.target.value)))} className="h-10 border border-line bg-bg px-2 font-semibold">
              {sorts.map((s) => (
                <option key={s} value={s}>
                  {t(`sort_${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={`${c.key}-${c.value}`} type="button" onClick={() => (c.key === "sale" ? update((p) => p.delete("sale")) : toggle(c.key, c.value))} className="flex h-8 items-center gap-1.5 bg-soft px-3 text-sm" aria-label={t("removeFilter", { name: c.label })}>
                {c.label}
                <X className="size-3.5" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="h-8 px-2 text-sm text-muted underline underline-offset-2">
              {t("clearAll")}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-bold">{t("emptyTitle")}</p>
            <p className="mt-1 text-muted">{t("emptyText")}</p>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="mt-6 h-12 bg-fg px-8 font-bold text-bg">
                {t("clearAll")}
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, shown).map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        )}
        {shown < filtered.length && <div ref={sentinel} className="h-10" aria-hidden />}
      </div>

      {/* Mobile filter sheet */}
      <div className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${panel ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setPanel(false)} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label={t("filters")} inert={!panel} className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col bg-bg pb-[env(safe-area-inset-bottom)] transition-transform duration-300 lg:hidden ${panel ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 className="text-lg font-black">{t("filters")}</h2>
          <button type="button" onClick={() => setPanel(false)} aria-label={t("close")} className="grid size-11 place-items-center">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{filters}</div>
        <div className="flex gap-2 border-t border-line p-3">
          <button type="button" onClick={clearAll} className="h-12 flex-1 border border-fg font-bold">
            {t("clearAll")}
          </button>
          <button type="button" onClick={() => setPanel(false)} className="h-12 flex-[2] bg-fg font-bold text-bg">
            {t("showResults", { count: filtered.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
