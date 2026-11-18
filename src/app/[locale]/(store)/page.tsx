import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getRackPieces } from "@/lib/data";
import { Banknote, RefreshCw, Truck } from "lucide-react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { FlashSale } from "@/components/home/FlashSale";
import { RackShowcase } from "@/components/home/RackShowcase";
import { RecommendedGrid } from "@/components/home/RecommendedGrid";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tt = await getTranslations("trust");
  const [products, rack] = await Promise.all([getProducts(), getRackPieces()]);

  const trust = [
    { icon: Truck, title: tt("delivery"), text: tt("deliveryText") },
    { icon: Banknote, title: tt("payment"), text: tt("paymentText") },
    { icon: RefreshCw, title: tt("exchange"), text: tt("exchangeText") },
  ];

  const tm = await getTranslations("meta");

  return (
    <>
      <h1 className="sr-only">{tm("title")}</h1>
      <HeroCarousel />
      <section className="gutter border-b border-line">
        <ul tabIndex={0} aria-label={tt("label")} className="no-scrollbar mx-auto flex max-w-7xl overflow-x-auto sm:grid sm:grid-cols-3">
          {trust.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex min-w-[78%] items-center gap-3 border-line py-4 sm:min-w-0 sm:px-5 sm:[&:not(:first-child)]:border-s">
              <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <CategoryCircles />
      <FlashSale products={products} />
      <RackShowcase pieces={rack} />
      <RecommendedGrid products={products} />
    </>
  );
}
