import { setRequestLocale } from "next-intl/server";
import { getRackPieces } from "@/lib/data";
import { MaiinRail } from "@/components/home/MaiinRail";
import ClothingRailHeroDemo from "@/components/demos/product-rail-gallery-demo";

export const metadata = { title: "Rail preview", robots: { index: false, follow: false } };

/** Side-by-side preview of the 21st.dev clothing rail: MAIIN's pieces, then the original demo. */
export default async function RailPreview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const pieces = await getRackPieces();
  return (
    <div className="grid gap-10 py-6">
      <section className="border-y border-line">
        <p className="gutter bg-soft py-2 text-center text-sm font-semibold">1 · MAIIN</p>
        <MaiinRail pieces={pieces} />
      </section>
      <section className="border-y border-line" dir="ltr">
        <p className="gutter bg-soft py-2 text-center text-sm font-semibold">2 · 21st.dev demo</p>
        <ClothingRailHeroDemo autoplay={false} />
      </section>
    </div>
  );
}
