"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { discountPercent, type Product } from "@/data/products";
import { formatUsd } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";
import { Link } from "@/i18n/navigation";

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k` : `${n}`;
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const { isWished, toggleWishlist, openQuickAdd, toast } = useStore();
  const off = discountPercent(product);
  const wished = isWished(product.id);
  const name = product.name[locale];

  return (
    <article className="group relative min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-soft">
        <Link href={`/p/${product.id}`} aria-label={name} className="absolute inset-0">
          <Image
            src={product.image}
            alt={name}
            fill
            priority={priority}
            sizes="(min-width:1280px) 240px, (min-width:768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute start-0 top-2 flex flex-col items-start gap-1">
          {off > 0 && <span className="bg-sale px-1.5 py-0.5 font-latin text-xs font-bold text-white">-{off}%</span>}
          {product.isNew && <span className="bg-accent text-accent-fg px-1.5 py-0.5 text-xs font-bold">{t("new")}</span>}
        </div>
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? t("removeWishlist", { name }) : t("addWishlist", { name })}
          onClick={() => toast(toggleWishlist(product.id) ? t("wishAdded") : t("wishRemoved"))}
          className="absolute end-1 top-1 grid size-11 place-items-center"
        >
          <span className="grid size-8 place-items-center rounded-full bg-bg/90">
            <Heart className={`size-[18px] ${wished ? "fill-sale text-sale" : ""}`} aria-hidden />
          </span>
        </button>
        <button
          type="button"
          aria-label={t("quickAdd", { name })}
          onClick={() => openQuickAdd(product)}
          className="absolute bottom-1.5 end-1.5 grid size-11 place-items-center rounded-full bg-bg shadow-md transition-transform hover:scale-105"
        >
          <ShoppingBag className="size-[18px]" aria-hidden />
        </button>
      </div>
      <div className="grid gap-0.5 pt-2 text-sm">
        <h3 className="truncate font-medium">
          <Link href={`/p/${product.id}`} className="hover:underline">
            {name}
          </Link>
        </h3>
        <p className="flex items-baseline gap-1.5 font-latin">
          <span className={`text-base font-extrabold ${off ? "text-sale" : ""}`}>{formatUsd(product.price)}</span>
          {product.oldPrice && <s className="text-xs text-muted">{formatUsd(product.oldPrice)}</s>}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted">
          <Star className="size-3.5 fill-star text-star" aria-hidden />
          <span className="font-latin">{product.rating.toFixed(1)}</span>
          <span aria-hidden>·</span>
          <span>{t("sold", { count: compact(product.sold) })}</span>
        </p>
      </div>
    </article>
  );
}
