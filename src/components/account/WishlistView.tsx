"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { useStore } from "@/components/store/StoreProvider";

export function WishlistView({ products }: { products: Product[] }) {
  const t = useTranslations("wishlist");
  const tb = useTranslations("bag");
  const { wishlist, clearWishlist } = useStore();
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);

  if (!items.length)
    return (
      <div className="py-20 text-center">
        <Heart className="mx-auto size-12 text-muted" strokeWidth={1.3} aria-hidden />
        <p className="mt-4 text-xl font-black">{t("empty")}</p>
        <p className="mt-1 text-muted">{t("emptyText")}</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center bg-fg px-8 font-bold text-bg">
          {tb("shop")}
        </Link>
      </div>
    );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{tb("items", { count: items.length })}</p>
        <button type="button" onClick={clearWishlist} className="h-10 text-sm text-muted underline underline-offset-2 hover:text-fg">
          {t("clear")}
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
