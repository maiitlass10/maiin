import { setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data";
import { EditorialHero, Essentials, LookBento, ShopTiles, WardrobeBanner } from "@/components/home/Editorial";
import { NewArrivals } from "@/components/home/NewArrivals";
import { WavesStatement } from "@/components/home/WavesStatement";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await getProducts();

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
      <Reveal>
        <Essentials />
      </Reveal>
      <Reveal>
        <WardrobeBanner />
      </Reveal>
    </>
  );
}
