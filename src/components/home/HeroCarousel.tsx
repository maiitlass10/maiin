"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";

const slides = [
  { key: "s1", image: "/images/banners/b1.webp", href: "/c/sale", tone: "light" },
  { key: "s2", image: "/images/banners/b2.webp", href: "/c/new", tone: "light" },
  { key: "s3", image: "/images/banners/b3.webp", href: "/c/women", tone: "dark" },
] as const;

const DELAY = 6000;

export function HeroCarousel() {
  const t = useTranslations("hero");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  const go = useCallback((d: number) => setIndex((i) => (i + d + slides.length) % slides.length), []);

  useEffect(() => {
    if (!playing || hovered) return;
    const id = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(id);
  }, [index, playing, hovered, go]);

  const rtl = () => document.documentElement.dir === "rtl";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("label")}
      className="relative overflow-hidden bg-soft"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) go((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1));
      }}
    >
      <div className="relative h-[clamp(320px,42vw,520px)]">
        {slides.map((s, i) => (
          <div
            key={s.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
            aria-hidden={i !== index}
            inert={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
            <div
              className={`absolute inset-0 ${
                s.tone === "dark"
                  ? "bg-gradient-to-t from-black/70 via-black/30 to-black/10"
                  : "ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-white/95 via-white/70 to-transparent"
              }`}
            />
            <div className="gutter absolute inset-0">
              <div className={`mx-auto flex h-full max-w-7xl flex-col justify-center ${s.tone === "dark" ? "items-center text-center text-white" : "items-start"}`}>
                <p className={`text-sm font-bold ${s.tone === "dark" ? "text-white/80" : "text-sale"}`}>{t(`${s.key}.kicker`)}</p>
                {s.key === "s1" && (
                  <p dir="ltr" className="font-latin text-[clamp(64px,10vw,128px)] font-extrabold leading-none tracking-tight text-sale">
                    -50%
                  </p>
                )}
                <h2 className="mt-1 max-w-[16ch] text-[clamp(28px,4vw,52px)] font-black leading-tight text-balance">{t(`${s.key}.title`)}</h2>
                <p className={`mt-2 max-w-md text-base sm:text-lg ${s.tone === "dark" ? "text-white/85" : "text-fg/75"}`}>{t(`${s.key}.text`)}</p>
                <Link
                  href={s.href}
                  className={`mt-5 inline-flex h-12 items-center px-8 font-bold transition-opacity hover:opacity-85 ${
                    s.tone === "dark" ? "bg-white text-fg" : "bg-fg text-bg"
                  }`}
                >
                  {t(`${s.key}.cta`)}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={t("goTo", { n: i + 1 })}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="grid h-11 min-w-8 place-items-center px-1"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-fg" : "w-1.5 bg-fg/30"}`} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t("pause") : t("play")}
          className="ms-1 grid size-11 place-items-center"
        >
          <span className="grid size-8 place-items-center rounded-full bg-bg/80">{playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}</span>
        </button>
      </div>

      <button type="button" aria-label={t("prev")} onClick={() => go(-1)} className="absolute start-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-bg/85 shadow md:grid">
        <ChevronRight className="size-5 ltr:rotate-180" aria-hidden />
      </button>
      <button type="button" aria-label={t("next")} onClick={() => go(1)} className="absolute end-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-bg/85 shadow md:grid">
        <ChevronLeft className="size-5 ltr:rotate-180" aria-hidden />
      </button>
    </section>
  );
}
