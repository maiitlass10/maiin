import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listingSlugs } from "@/lib/catalog";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const INFO = ["about", "contact", "privacy", "terms", "shipping", "returns", "size-guide"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const paths = [
    { path: "", priority: 1, freq: "daily" as const },
    ...listingSlugs.map((s) => ({ path: `/c/${s}`, priority: 0.8, freq: "daily" as const })),
    ...products.map((p) => ({ path: `/p/${p.id}`, priority: 0.7, freq: "weekly" as const })),
    ...INFO.map((s) => ({ path: `/${s}`, priority: 0.3, freq: "monthly" as const })),
  ];
  return paths.flatMap(({ path, priority, freq }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: freq,
      priority,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    })),
  );
}
