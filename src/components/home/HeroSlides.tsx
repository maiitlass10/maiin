"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "./EdHeading";

const IMG = "/images/editorial";
const DELAY = 6500;

/** Hero slides: each has its own model cut-out, copy and buttons. */
const SLIDES = [
  { key: "w", img: "hero-1", cta: "/c/new", cta2: "/c/women" },
  { key: "m", img: "hero-2", cta: "/c/men", cta2: "/c/outerwear" },
  { key: "c", img: "hero-3", cta: "/c/outerwear", cta2: "/c/new" },
] as const;

/**
 * The changing part of the hero: model, copy and controls. Slides change on
 * their own every few seconds; hovering or focusing the hero pauses them, and
 * there is a pause button and dots. No autoplay under reduced motion.
 */
export function HeroSlides({ btnDark, btnLight }: { btnDark: string; btnLight: string }) {
  const t = useTranslations("ed.hero");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  const next = useCallback(() => setActive((i) => (i + 1) % SLIDES.length), []);

  useEffect(() => {
    if (!playing || held) return;
    const id = window.setTimeout(next, DELAY);
    return () => window.clearTimeout(id);
  }, [active, playing, held, next]);

  const hold = {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };

  return (
    <>
      {/* Models, stacked; only the active one shows. */}
      <div
        data-depth="-0.5"
        className="relative mx-auto mt-[18vw] aspect-[9/19] w-[60%] max-w-[300px] md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:h-[94%] md:w-auto md:max-w-none"
      >
        {SLIDES.map((s, i) => (
          <Image
            key={s.key}
            src={`${IMG}/${s.img}.webp`}
            alt={i === active ? t(`${s.key}.alt`) : ""}
            aria-hidden={i !== active}
            fill
            priority={i === 0}
            sizes="(min-width:768px) 360px, 60vw"
            className={`object-contain object-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,.4)] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] ${
              i === active ? "opacity-100" : "translate-y-6 scale-[.96] opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Copy for each slide, stacked in one grid cell so the height never jumps. */}
      <div
        {...hold}
        className="gutter relative z-10 -mt-24 bg-gradient-to-t from-bg via-bg/95 to-transparent pb-6 pt-20 text-center md:absolute md:bottom-36 md:start-0 md:mt-0 md:w-[30%] md:bg-none md:p-0 md:ps-8 md:text-start lg:ps-12"
      >
        <div className="grid" aria-live={playing && !held ? "off" : "polite"}>
          {SLIDES.map((s, i) => {
            const on = i === active;
            const Title = i === 0 ? "h1" : "h2";
            return (
              <div
                key={s.key}
                aria-hidden={!on}
                inert={!on}
                className={`[grid-area:1/1] transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${on ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
              >
                <p className={`mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-accent ${i === 0 ? "hero-in [animation-delay:.1s]" : ""}`}>{t(`${s.key}.kicker`)}</p>
                <Title className={`font-display text-[30px] font-medium leading-tight lg:text-[36px] ${i === 0 ? "hero-in [animation-delay:.15s]" : ""}`}>
                  {t(`${s.key}.title1`)} <span className="text-fg/75">{t(`${s.key}.title2`)}</span>
                </Title>
                <p className={`mx-auto mt-3 max-w-xs text-sm leading-6 text-muted md:mx-0 ${i === 0 ? "hero-in [animation-delay:.2s]" : ""}`}>{t(`${s.key}.text`)}</p>
                <div className={`mt-5 flex flex-wrap justify-center gap-3 md:justify-start ${i === 0 ? "hero-in [animation-delay:.3s]" : ""}`}>
                  <Link href={s.cta} className={btnDark}>
                    {t(`${s.key}.cta`)}
                    <Arrow />
                  </Link>
                  <Link href={s.cta2} className={btnLight}>
                    {t(`${s.key}.cta2`)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls: progress dots and pause. */}
        <div role="group" aria-label={t("label")} className="hero-in [animation-delay:.4s] mt-6 flex items-center justify-center gap-1 md:justify-start">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={t("goTo", { n: i + 1 })}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className="grid h-11 w-10 place-items-center"
            >
              <span className={`relative block h-1 w-full overflow-hidden rounded-full ${i === active ? "bg-fg/25" : "bg-fg/20"}`}>
                {i === active && (
                  <span
                    key={`${active}-${playing && !held}`}
                    className={`absolute inset-y-0 start-0 block rounded-full bg-accent ${playing && !held ? "animate-[heroBar_linear_forwards]" : "w-full"}`}
                    style={playing && !held ? { animationDuration: `${DELAY}ms` } : undefined}
                  />
                )}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t("pause") : t("play")}
            className="ms-1 grid size-11 place-items-center rounded-full text-fg/80 transition-colors hover:text-accent"
          >
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </>
  );
}
