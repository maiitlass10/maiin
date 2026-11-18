"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth wheel scrolling with Lenis, driven by GSAP's ticker so ScrollTrigger
 * animations stay in step. Touch keeps native scrolling. Off for people who
 * ask for reduced motion. Pauses while a dialog or menu locks the page.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      anchors: true,
      // Let scrollable dialogs, drawers and menus scroll natively.
      prevent: (node) => !!node.closest?.("[role=dialog], dialog, [data-lenis-prevent]"),
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Menus and drawers lock the page with body overflow: hidden, and modal
    // <dialog>s are open; stop smooth scrolling while either is the case.
    const sync = () => {
      const locked = document.body.style.overflow === "hidden" || !!document.querySelector("dialog[open]");
      if (locked) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style", "open"] });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
