"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      // Glide-to-rest feel: a touch of inertia that decelerates into place.
      duration: 1.15,
      // easeOutExpo — fast pickup, long magnetic settle.
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // Responsive input that still carries momentum.
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      syncTouch: true,
    });

    // Keep GSAP scroll-driven animations perfectly aligned with Lenis.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so scrub timelines stay frame-synced.
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
