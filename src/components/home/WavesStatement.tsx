"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./EdHeading";

// WebGL background from React Bits; loaded in the browser only.
const GradientWaves = dynamic(() => import("@/components/ui/gradient-waves"), { ssr: false });

/** Brand statement over soft animated waves in the MAIIN warm palette. */
export function WavesStatement() {
  const t = useTranslations("ed.statement");
  return (
    <section className="relative isolate overflow-hidden bg-[#f3ece4]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <GradientWaves
          lightMode
          horizonColor="#a8694a"
          waveColor="#d9a07f"
          crestColor="#f6e3d3"
          backgroundColor="#f3ece4"
          speed={0.25}
          amplitude={2.2}
          waveScale={0.5}
          swell={30}
          turbulence={14}
          lightAngle={60}
          grain={0.12}
          mouseStrength={0.4}
        />
      </div>
      <div data-reveal className="gutter mx-auto flex min-h-[460px] max-w-3xl flex-col items-center justify-center py-20 text-center sm:min-h-[540px]">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-fg/75">{t("kicker")}</p>
        <h2 className="font-display text-[34px] font-medium leading-[1.2] sm:text-[52px]">{t("title")}</h2>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-fg/80">{t("text")}</p>
        <Link href="/about" className="mt-8 inline-flex h-12 items-center gap-2 bg-fg px-7 text-sm font-medium text-bg transition-opacity hover:opacity-85">
          {t("cta")}
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
