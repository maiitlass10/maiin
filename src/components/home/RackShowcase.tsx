"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ArrowUpLeft, X } from "lucide-react";
import { rackPieces } from "@/data/products";
import { formatSyp, formatUsd } from "@/lib/format";
import { useStore } from "@/components/store/StoreProvider";

/*
 * 3D rack: the selected piece hangs at the front facing the viewer, the rest
 * hang edge-on along a rail that recedes into the stage. Positions are computed
 * from the stage width so the rail always passes through every hook.
 */

const N = rackPieces.length;
const pad = (n: number) => String(n).padStart(2, "0");

type Geometry = { w: number; h: number; gap: number; depth: number; front: number };

function geometry(stageWidth: number, mobile: boolean): Geometry {
  const w = Math.round(Math.min(330, Math.max(150, stageWidth * (mobile ? 0.48 : 0.34))));
  return { w, h: Math.round(w * 1.32), gap: w * (mobile ? 0.16 : 0.2), depth: w * 0.62, front: stageWidth * (mobile ? 0.04 : 0.07) };
}

export function RackShowcase() {
  const t = useTranslations("rack");
  const tp = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const dir = locale === "ar" ? -1 : 1;
  const { addToBag, toast } = useStore();

  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lastWheel = useRef(0);
  const dragX = useRef<number | null>(null);
  const piece = rackPieces[index];

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setGeo(geometry(el.clientWidth, window.innerWidth < 768));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const select = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(N - 1, i)));
    setSize(null);
    setSizeError(false);
  }, []);
  const step = useCallback((d: number) => select(index + d), [index, select]);

  // Scroll over the stage moves along the rail; at either end the page scrolls normally.
  useEffect(() => {
    const el = stage.current;
    if (!el || details) return;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX * dir;
      if (Math.abs(d) < 8) return;
      const next = index + (d > 0 ? 1 : -1);
      if (next < 0 || next >= N) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel.current < 420) return;
      lastWheel.current = now;
      select(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [index, details, dir, select]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && details) return setDetails(false);
    if (e.key === "ArrowRight") step(dir);
    if (e.key === "ArrowLeft") step(-dir);
  };

  const add = () => {
    if (!size) return setSizeError(true);
    addToBag(piece.id, size);
    toast(tp("added", { name: piece.name[locale] }));
  };

  // Transform for piece i relative to the selected one.
  const placement = (i: number): React.CSSProperties => {
    if (!geo) return { opacity: 0 };
    const d = i - index;
    if (d === 0) return { transform: "translate3d(0,0,0) rotateY(0deg)", opacity: 1, zIndex: 50 };
    if (d < 0)
      return {
        transform: `translate3d(${dir * -geo.w * 0.9}px, 0, ${geo.w * 0.4}px) rotateY(${dir * 35}deg)`,
        opacity: 0,
        pointerEvents: "none",
      };
    const k = d + 0.9;
    return {
      transform: `translate3d(${dir * k * geo.gap}px, 0, ${-k * geo.depth}px) rotateY(${dir * -76}deg)`,
      opacity: d > 9 ? 0 : 1,
      zIndex: 40 - d,
    };
  };

  const railAngle = geo ? (Math.atan2(geo.depth, geo.gap) * 180) / Math.PI : 0;
  const prevIcon = dir === 1 ? ArrowLeft : ArrowRight;
  const nextIcon = dir === 1 ? ArrowRight : ArrowLeft;
  const PrevIcon = prevIcon;
  const NextIcon = nextIcon;

  return (
    <section aria-labelledby="rack-title" className="gutter bg-soft py-10 sm:py-14" onKeyDown={onKey}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-latin text-xs font-semibold tracking-[0.3em] text-muted">MAIIN · COLLECTION</p>
            <h2 id="rack-title" className="mt-1 text-2xl font-black sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
          </div>
          <p className="font-latin text-sm tabular-nums text-muted" aria-live="polite">
            <span className="text-fg">{pad(index + 1)}</span> / {pad(N)}
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-10">
          {/* Stage */}
          <div
            ref={stage}
            role="group"
            aria-roledescription="carousel"
            aria-label={t("title")}
            tabIndex={0}
            className={`relative h-[clamp(380px,62vw,620px)] touch-pan-y select-none overflow-hidden outline-none transition-opacity duration-300 md:h-[clamp(440px,44vw,620px)] ${details ? "pointer-events-none opacity-0" : ""}`}
            style={{ perspective: "1500px", perspectiveOrigin: dir === 1 ? "22% 18%" : "78% 18%" }}
            onPointerDown={(e) => (dragX.current = e.clientX)}
            onPointerUp={(e) => {
              if (dragX.current === null) return;
              const dx = e.clientX - dragX.current;
              dragX.current = null;
              if (Math.abs(dx) > 40) step((dx < 0 ? 1 : -1) * dir);
            }}
          >
            {geo && (
              <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {/* Rail */}
                <div
                  aria-hidden
                  className="absolute h-[5px] rounded-full bg-gradient-to-b from-[#c9c9c9] via-[#8a8a8a] to-[#5c5c5c] shadow-[0_3px_6px_rgba(0,0,0,.18)]"
                  style={{
                    top: 30,
                    [dir === 1 ? "left" : "right"]: geo.front + geo.w / 2 - geo.w * 0.3,
                    width: geo.w * 0.3 + (N + 2) * Math.hypot(geo.gap, geo.depth),
                    // Pivot on the front hook so the rail passes through every hook after rotating.
                    transformOrigin: dir === 1 ? `${geo.w * 0.3}px 50%` : `calc(100% - ${geo.w * 0.3}px) 50%`,
                    transform: `rotateY(${dir * railAngle}deg)`,
                  }}
                />
                {rackPieces.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    tabIndex={i === index ? -1 : 0}
                    aria-label={`${p.name[locale]} · ${pad(i + 1)}`}
                    aria-hidden={i < index}
                    onClick={() => i !== index && select(i)}
                    className="absolute top-[30px] cursor-pointer transition-[transform,opacity] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform"
                    style={{ [dir === 1 ? "left" : "right"]: geo.front, width: geo.w, height: geo.h, transformOrigin: "50% 0", ...placement(i) }}
                  >
                    <span key={i === index ? `f${index}` : "b"} className={`relative block h-full w-full origin-top ${i === index ? "animate-[swing_1.6s_ease-out]" : ""}`}>
                      <svg aria-hidden viewBox="0 0 20 28" className="absolute left-1/2 top-0 h-7 w-5 -translate-x-1/2 text-[#7a7a7a]">
                        <path d="M10 28V12c0-3 5-3 5-7.5S12.5 0 10 0 5.5 2 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-x-0 bottom-0 top-5">
                        <Image
                          src={p.cutout}
                          alt=""
                          fill
                          sizes="(min-width:768px) 330px, 48vw"
                          priority={i < 3}
                          className="object-contain object-top drop-shadow-[0_18px_18px_rgba(0,0,0,.18)]"
                        />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-soft to-transparent" />
          </div>

          {/* Info panel */}
          <div className={`flex flex-col justify-center transition-opacity duration-300 ${details ? "pointer-events-none opacity-0 max-md:hidden" : ""}`} aria-live="polite">
            <p className="font-latin text-xs tabular-nums tracking-[0.2em] text-muted">
              {pad(index + 1)} / {pad(N)}
            </p>
            <h3 key={piece.id} className="mt-2 animate-[fadeUp_.5s_ease] text-3xl font-black leading-tight">
              {piece.name[locale]}
            </h3>
            <span className="my-4 block h-px w-10 bg-fg" />
            <p className="text-[15px] text-muted">{piece.description[locale]}</p>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted">{t("material")}</dt>
              <dd>{piece.material[locale]}</dd>
              <dt className="text-muted">{t("color")}</dt>
              <dd>{piece.color[locale]}</dd>
            </dl>
            <p className="mt-5 flex flex-wrap items-baseline gap-2">
              <span className="font-latin text-2xl font-extrabold">{formatUsd(piece.price)}</span>
              <span className="text-sm text-muted">≈ {formatSyp(piece.price, locale)}</span>
            </p>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-semibold">{tp("size")}</legend>
              <div className="flex flex-wrap gap-2">
                {piece.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    className={`h-11 min-w-11 border px-2.5 font-latin text-sm font-semibold transition-colors ${size === s ? "border-fg bg-fg text-bg" : "border-line bg-bg hover:border-fg"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 min-h-5 text-sm text-sale" role="alert">
                {sizeError ? tp("sizeRequired") : ""}
              </p>
            </fieldset>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={add} className="h-12 flex-1 bg-fg px-6 font-bold text-bg transition-opacity hover:opacity-85">
                {tp("addToBag")}
              </button>
              <button type="button" onClick={() => setDetails(true)} className="flex h-12 items-center gap-2 border border-fg px-5 font-bold transition-colors hover:bg-fg hover:text-bg">
                {t("viewDetails")}
                <ArrowUpLeft className="size-4 ltr:-scale-x-100" aria-hidden />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
              <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label={t("prev")} className="grid size-11 place-items-center transition-opacity disabled:opacity-25">
                <PrevIcon className="size-5" aria-hidden />
              </button>
              <span className="font-latin text-sm tabular-nums">
                {pad(index + 1)} / {pad(N)}
              </span>
              <button type="button" onClick={() => step(1)} disabled={index === N - 1} aria-label={t("next")} className="grid size-11 place-items-center transition-opacity disabled:opacity-25">
                <NextIcon className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          {/* Details view */}
          {details && (
            <div className="animate-[fadeUp_.45s_ease] bg-soft md:absolute md:inset-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-8" role="region" aria-label={piece.name[locale]}>
              <div className="relative hidden md:block">
                <Image src={piece.cutout} alt={piece.name[locale]} fill sizes="400px" className="object-contain object-top p-4 drop-shadow-[0_18px_18px_rgba(0,0,0,.18)]" />
              </div>
              <div className="flex flex-col justify-center py-4">
                <p className="font-latin text-xs tabular-nums tracking-[0.2em] text-muted">
                  {pad(index + 1)} / {pad(N)}
                </p>
                <h3 className="mt-2 text-3xl font-black leading-tight">{piece.name[locale]}</h3>
                <span className="my-4 block h-px w-10 bg-fg" />
                <p className="text-[15px] text-muted">{piece.description[locale]}</p>
                <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="text-muted">{t("material")}</dt>
                  <dd>{piece.material[locale]}</dd>
                  <dt className="text-muted">{t("color")}</dt>
                  <dd>{piece.color[locale]}</dd>
                  <dt className="text-muted">{tp("size")}</dt>
                  <dd className="font-latin">{piece.sizes.join(" / ")}</dd>
                </dl>
                <div className="mt-6 flex gap-2">
                  <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label={t("prev")} className="grid size-11 place-items-center border border-line bg-bg disabled:opacity-30">
                    <PrevIcon className="size-5" aria-hidden />
                  </button>
                  <button type="button" onClick={() => step(1)} disabled={index === N - 1} aria-label={t("next")} className="grid size-11 place-items-center border border-line bg-bg disabled:opacity-30">
                    <NextIcon className="size-5" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{t("styleIt")}</span>
                  <button type="button" onClick={() => setDetails(false)} className="flex h-11 items-center gap-1.5 text-sm font-semibold">
                    {t("back")}
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg md:aspect-auto md:flex-1">
                  <Image key={piece.look} src={piece.look} alt={t("lookAlt", { name: piece.name[locale] })} fill sizes="(min-width:768px) 400px, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-muted md:text-start">{t("hint")}</p>
      </div>
    </section>
  );
}
