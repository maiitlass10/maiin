"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RackPiece } from "@/data/products";
import { formatSyp, formatUsd } from "@/lib/format";
import { useSettings } from "@/components/store/SettingsProvider";
import { useStore } from "@/components/store/StoreProvider";
import { Link } from "@/i18n/navigation";
import { MaiinRail } from "@/components/home/MaiinRail";

const RackScene = dynamic(() => import("./RackScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The signature 3D rack: a real clothing rack in perspective, garments hanging
 * sideways on hooks. The chosen piece slides out, turns to face the viewer and
 * swings on its hook; its details sit beside the scene. Falls back to the flat
 * rail when the browser has no WebGL.
 */
export function Rack3D({ pieces }: { pieces: RackPiece[] }) {
  const t = useTranslations("rack3d");
  const tr = useTranslations("rack");
  const tp = useTranslations("product");
  const locale = useLocale() as "ar" | "en";
  const rtl = locale === "ar";
  const { sypPerUsd } = useSettings();
  const { addToBag, toast } = useStore();

  const [gl, setGl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(Math.min(2, pieces.length - 1));
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  useEffect(() => {
    setGl(hasWebGL());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Only render frames while the rack is on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [gl]);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(pieces.length - 1, i));
      setIndex(next);
      setSize(pieces[next].sizes.length === 1 ? pieces[next].sizes[0] : null);
      setSizeError(false);
    },
    [pieces],
  );

  if (gl === false) return <MaiinRail pieces={pieces} />;
  if (!pieces.length) return null;

  const piece = pieces[index];
  const name = piece.name[locale];
  const forward = rtl ? -1 : 1;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + forward);
    else if (e.key === "ArrowLeft") go(index - forward);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(pieces.length - 1);
    else return;
    e.preventDefault();
  };

  // Horizontal swipe or drag on the scene moves along the rack.
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 60) {
      go(index + (dx < 0 ? 1 : -1) * forward);
      drag.current = { x: e.clientX, moved: true };
    }
  };
  const onUp = () => {
    drag.current = null;
  };

  const add = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addToBag(piece.id, size);
    toast(tp("added", { name }));
  };

  const scenePieces = pieces.map((p) => ({ id: p.id, image: p.cutout, tag: formatUsd(p.price) }));
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-labelledby="rack3d-title" className="gutter relative overflow-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-6 text-center sm:mb-8">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted">{t("eyebrow")}</p>
          <h2 id="rack3d-title" className="font-display text-[28px] font-medium leading-tight sm:text-[36px]">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{t("caption")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div
            ref={stage}
            role="group"
            tabIndex={0}
            aria-roledescription={t("roledesc")}
            aria-label={t("label", { name, n: index + 1, total: pieces.length })}
            onKeyDown={onKey}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onUp}
            className="relative h-[440px] touch-pan-y select-none bg-gradient-to-b from-soft/0 via-soft/60 to-sand/70 outline-none focus-visible:ring-2 focus-visible:ring-fg sm:h-[540px] lg:h-[600px]"
          >
            {gl && <RackScene pieces={scenePieces} selected={index} onSelect={go} rtl={rtl} reduced={reduced} active={active} />}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
              <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={tr("prev")} className="pointer-events-auto grid size-11 place-items-center border border-line bg-bg/90 transition-opacity disabled:opacity-30">
                <ChevronRight className="size-5 ltr:rotate-180" aria-hidden />
              </button>
              <span dir="ltr" className="min-w-16 text-center font-latin text-sm tabular-nums text-muted">
                {pad(index + 1)} / {pad(pieces.length)}
              </span>
              <button type="button" onClick={() => go(index + 1)} disabled={index === pieces.length - 1} aria-label={tr("next")} className="pointer-events-auto grid size-11 place-items-center border border-line bg-bg/90 transition-opacity disabled:opacity-30">
                <ChevronLeft className="size-5 ltr:rotate-180" aria-hidden />
              </button>
            </div>
          </div>

          <div data-reveal aria-live="polite" className="lg:py-6">
            <div key={piece.id} className="hero-in">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{piece.color[locale]}</p>
              <h3 className="mt-1 font-display text-[28px] font-medium leading-tight">{name}</h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-latin text-xl font-semibold">{formatUsd(piece.price)}</span>
                <span className="text-sm text-muted">≈ {formatSyp(piece.price, locale, sypPerUsd)}</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-fg/80">{piece.description[locale]}</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-y border-line py-3 text-sm">
                <dt className="text-muted">{tr("material")}</dt>
                <dd>{piece.material[locale]}</dd>
                <dt className="text-muted">{tr("color")}</dt>
                <dd>{piece.color[locale]}</dd>
              </dl>
            </div>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">{tp("size")}</legend>
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
                    className={`h-11 min-w-11 border px-2.5 font-latin text-sm font-medium transition-colors ${size === s ? "border-fg bg-fg text-bg" : "border-line bg-bg hover:border-fg"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 min-h-5 text-sm text-sale" role="alert">
                {sizeError ? tp("sizeRequired") : ""}
              </p>
            </fieldset>
            <div className="mt-1 flex flex-wrap gap-2">
              <button type="button" onClick={add} className="h-12 flex-1 rounded-full bg-accent text-accent-fg px-6 text-sm font-semibold transition-colors hover:bg-[#ff7d36]">
                {tp("addToBag")}
              </button>
              {piece.productId && (
                <Link href={`/p/${piece.productId}`} className="inline-flex h-12 items-center border border-fg/70 px-5 text-sm font-medium transition-colors hover:bg-fg hover:text-bg">
                  {tr("viewDetails")}
                </Link>
              )}
            </div>
            {piece.look && (
              <div className="mt-5 flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden bg-soft">
                  <Image src={piece.look} alt={tr("lookAlt", { name })} fill sizes="64px" className="object-cover" />
                </div>
                <p className="text-xs leading-5 text-muted">{tr("styleIt")}</p>
              </div>
            )}
          </div>
        </div>

        <ul aria-label={t("pieces")} className="no-scrollbar mt-6 flex justify-start gap-2 overflow-x-auto sm:justify-center">
          {pieces.map((p, i) => (
            <li key={p.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={i === index}
                aria-label={p.name[locale]}
                onClick={() => go(i)}
                className={`relative grid size-14 place-items-center border bg-bg transition-colors ${i === index ? "border-fg" : "border-line hover:border-fg/50"}`}
              >
                <Image src={p.cutout} alt="" width={44} height={44} className="size-11 object-contain" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-xs text-muted">{t("hint")}</p>
      </div>
    </section>
  );
}
