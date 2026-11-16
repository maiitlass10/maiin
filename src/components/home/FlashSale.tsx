import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Countdown } from "./Countdown";
import { SectionHeading } from "./SectionHeading";

export function FlashSale({ products }: { products: Product[] }) {
  const t = useTranslations("home");
  const flashProducts = products.filter((p) => p.flash);
  if (!flashProducts.length) return null;
  return (
    <section className="gutter py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center gap-3 bg-sale px-4 py-3 text-white">
          <Zap className="size-5 fill-white" aria-hidden />
          <h2 className="text-lg font-black sm:text-xl">{t("flashTitle")}</h2>
          <span className="text-sm text-white/85">{t("flashEnds")}</span>
          <span className="[&_span.bg-fg]:bg-white [&_span.bg-fg]:text-sale">
            <Countdown label={t("flashEnds")} />
          </span>
        </div>
        <SectionHeading title={t("flashSub")} href="/c/sale" linkLabel={t("viewAll")} />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {flashProducts.map((p) => (
            <li key={p.id} className="w-[42vw] max-w-[220px] shrink-0 snap-start sm:w-[200px]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
