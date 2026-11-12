import { siteConfig } from "./config";

/** "$24" or "$24.50", always with Latin digits so prices read the same in both languages. */
export function formatUsd(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Price in Syrian pounds, rounded to the nearest 500, e.g. "312,000 ل.س". */
export function formatSyp(usd: number, locale: string): string {
  const syp = Math.round((usd * siteConfig.sypPerUsd) / 500) * 500;
  const n = new Intl.NumberFormat("en-US").format(syp);
  return locale === "ar" ? `${n} ل.س` : `SYP ${n}`;
}
