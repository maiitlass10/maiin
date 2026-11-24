import { setRequestLocale } from "next-intl/server";
import { getProducts, getRackPieces } from "@/lib/data";
import { EditorialHero, Essentials, LookBento, ShopTiles, WardrobeBanner } from "@/components/home/Editorial";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Rack3D } from "@/components/rack3d/Rack3D";
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
        <Reveal className="border-y border-line">
          <Rack3D pieces={rack} />
        </Reveal>
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
