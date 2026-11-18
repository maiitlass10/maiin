"use client";

import { useLocale, useTranslations } from "next-intl";
import ClothingRailHero, { type RailGarment } from "@/components/ui/product-rail-gallery";
import type { RackPiece } from "@/data/products";
import { formatUsd } from "@/lib/format";

/** The 21st.dev clothing rail fed with MAIIN's rack pieces and Arabic/English labels. */
export function MaiinRail({ pieces }: { pieces: RackPiece[] }) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("rail2");
  const items: RailGarment[] = pieces.map((p) => ({
    id: p.id,
    name: p.name[locale],
    description: p.description[locale],
    image: p.cutout,
    tag: formatUsd(p.price),
    details: [p.material[locale], p.color[locale], p.sizes.join(" / ")].filter(Boolean),
  }));
  return (
    <ClothingRailHero
      items={items}
      hanger="none"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      caption={t("caption")}
      autoplay
      labels={{ front: t("front"), back: t("back"), close: t("close"), show: t("show") }}
    />
  );
}
