"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-in animation for a section. Children marked data-reveal rise and fade
 * in with a stagger; images marked data-parallax drift slowly while scrolling.
 * Nothing moves for people who ask for reduced motion.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
        if (items.length) {
          gsap.from(items, {
            y: 36,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
          });
        }
        gsap.utils.toArray<HTMLElement>("[data-parallax]", ref.current).forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6, scale: 1.12 },
            { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
