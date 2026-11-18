import { setRequestLocale } from "next-intl/server";
import { getProducts, getRackPieces } from "@/lib/data";
import { EditorialHero, Essentials, LookBento, ServiceStrip, ShopTiles, WardrobeBanner } from "@/components/home/Editorial";
import { NewArrivals } from "@/components/home/NewArrivals";
import { MaiinRail } from "@/components/home/MaiinRail";
import { WavesStatement } from "@/components/home/WavesStatement";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [products, rack] = await Promise.all([getProducts(), getRackPieces()]);

  return (
    <>
      <EditorialHero />
      <Reveal>
        <ServiceStrip />
      </Reveal>
      <Reveal>
        <ShopTiles />
      </Reveal>
      <Reveal>
        <NewArrivals products={products} />
      </Reveal>
      <Reveal>
        <LookBento />
      </Reveal>
      <Reveal>
        <WavesStatement />
      </Reveal>
      {rack.length > 0 && (
        <div className="border-y border-line bg-bg [&_header_h2]:font-display [&_header_h2]:text-[28px] sm:[&_header_h2]:text-[36px]">
          <MaiinRail pieces={rack} />
        </div>
      )}
      <Reveal>
        <Essentials />
      </Reveal>
      <Reveal>
        <WardrobeBanner />
      </Reveal>
    </>
  );
}
