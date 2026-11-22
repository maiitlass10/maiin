"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./EdHeading";

// WebGL background from React Bits; loaded in the browser only.
const GradientWaves = dynamic(() => import("@/components/ui/gradient-waves"), { ssr: false });

/** Brand statement over soft animated waves: navy sea with an orange horizon. */
export function WavesStatement() {
  const t = useTranslations("ed.statement");
  return (
    <section className="band relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <GradientWaves
          horizonColor="#ff6b1a"
          waveColor="#3a4580"
          crestColor="#ffb07f"
          backgroundColor="#1e2447"
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
        <Link href="/about" className="mt-8 inline-flex h-12 items-center gap-2 bg-accent text-accent-fg px-7 text-sm font-semibold transition-colors hover:bg-[#ff7d36]">
          {t("cta")}
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
