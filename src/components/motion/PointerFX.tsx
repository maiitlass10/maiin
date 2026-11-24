"use client";

import { useEffect } from "react";

/**
 * Pointer effects for the whole store, wired once with event delegation so
 * server-rendered markup only needs a class or data attribute:
 *
 * - `.btn-3d`: the button leans toward the pointer (magnetic).
 * - `[data-tilt]`: the card tilts in 3D toward the pointer, with a soft glare.
 * - `[data-depth-root]` with `[data-depth="n"]` children: layers drift by
 *   their depth as the pointer moves, so the scene reads in 3D.
 *
 * Mouse and pen only (touch keeps the press effect from CSS), and nothing at
 * all under reduced motion. Magnetic and depth use the `translate` property and
 * tilt uses `transform`, so they never fight over the same property.
 */
export function PointerFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    let root: HTMLElement | null = null;
    let frame = 0;
    let last: PointerEvent | null = null;

    const resetTilt = () => {
      if (!tilted) return;
      tilted.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
      tilted.style.transform = "";
      tilted.removeAttribute("data-tilting");
      tilted = null;
    };
    const resetMagnet = () => {
      if (!magnet) return;
      magnet.style.translate = "";
      magnet = null;
    };
    const resetDepth = () => {
      if (!root) return;
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => (el.style.translate = ""));
      root = null;
    };

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      // Tilt
      const card = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (card !== tilted) resetTilt();
      if (card) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const max = Number(card.dataset.tilt) || 7;
        tilted = card;
        card.setAttribute("data-tilting", "");
        card.style.transition = "transform .12s ease-out";
        card.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
        card.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
      }

      // Magnetic buttons
      const btn = target?.closest<HTMLElement>(".btn-3d") ?? null;
      if (btn !== magnet) resetMagnet();
      if (btn) {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        magnet = btn;
        btn.style.translate = `${(dx * 0.18).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px`;
      }

      // Depth layers
      const scene = target?.closest<HTMLElement>("[data-depth-root]") ?? null;
      if (scene !== root) resetDepth();
      if (scene) {
        const r = scene.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        root = scene;
        scene.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
          const d = Number(el.dataset.depth) || 0;
          el.style.translate = `${(x * d * 60).toFixed(1)}px ${(y * d * 36).toFixed(1)}px`;
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      resetTilt();
      resetMagnet();
      resetDepth();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);

  return null;
}
