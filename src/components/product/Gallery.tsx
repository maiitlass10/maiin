"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

/** Main photo with hover zoom (desktop) or tap-to-zoom (touch), plus thumbnails when there are several photos. */
export function Gallery({ images, alt, badge }: { images: string[]; alt: string; badge?: React.ReactNode }) {
  const t = useTranslations("pdp");
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const point = (clientX: number, clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto md:w-20 md:flex-col">
          {images.map((src, i) => (
            <li key={src} className="w-16 shrink-0 md:w-full">
              <button type="button" onClick={() => setActive(i)} aria-label={t("photo", { n: i + 1 })} aria-current={i === active} className={`relative block aspect-[3/4] w-full overflow-hidden border-2 ${i === active ? "border-fg" : "border-transparent"}`}>
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        ref={box}
        className={`relative aspect-[3/4] flex-1 overflow-hidden bg-soft ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onPointerMove={(e) => e.pointerType === "mouse" && setZoom(point(e.clientX, e.clientY))}
        onPointerLeave={(e) => e.pointerType === "mouse" && setZoom(null)}
        onClick={(e) => setZoom((z) => (z ? null : point(e.clientX, e.clientY)))}
        role="img"
        aria-label={alt}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width:1024px) 600px, 100vw"
          className="object-cover transition-transform duration-200"
          style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        {badge}
      </div>
    </div>
  );
}
