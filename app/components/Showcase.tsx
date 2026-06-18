"use client";

import { useEffect, useRef } from "react";
import { Montserrat } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance reveal timeline (triggers when content reaches 20% into the viewport)
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: contentRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    // 1. Reveal the left tag
    entranceTl.fromTo(
      tagRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );

    // 2. Reveal the heading lines with a clean stagger and fade-in (slower, more majestic sweep)
    const lines = contentRef.current?.querySelectorAll(".showcase-line");
    if (lines && lines.length > 0) {
      entranceTl.fromTo(
        lines,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.22, ease: "power3.out" },
        "-=0.4"
      );
    }

    // 3. Reveal the description paragraph and Try AI button (slower tracking)
    const descElement = contentRef.current?.querySelector(".showcase-desc");
    const ctaElement = contentRef.current?.querySelector(".showcase-cta");
    const footerElements = [descElement, ctaElement].filter(Boolean);

    if (footerElements.length > 0) {
      entranceTl.fromTo(
        footerElements,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" },
        "-=0.3"
      );
    }

    // Scroll Parallax Timeline (moving columns out of sync vertically as you scroll)
    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    parallaxTl.fromTo(
      tagRef.current,
      { y: 50 },
      { y: -50, ease: "none" }
    );

    parallaxTl.fromTo(
      contentRef.current,
      { y: -25 },
      { y: 25, ease: "none" },
      "<"
    );

    return () => {
      entranceTl.kill();
      parallaxTl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className={`${montserrat.variable} w-full min-h-[85vh] bg-[#F4EFE6] text-neutral-800 flex flex-col md:flex-row items-start justify-between py-28 px-6 sm:px-12 md:px-20 lg:px-32 relative z-30 font-[family-name:var(--font-montserrat)] border-t border-neutral-200/30 overflow-hidden`}
    >
      {/* Left Column Category Tag */}
      <div
        ref={tagRef}
        className="w-full md:w-1/4 mb-10 md:mb-0"
      >
        <span className="text-[10px] sm:text-xs tracking-[0.25em] text-neutral-800 font-bold uppercase">
          AI CULINARY ENGINE
        </span>
      </div>

      {/* Right Column Core Copy */}
      <div
        ref={contentRef}
        className="w-full md:w-3/4 flex flex-col items-start text-left max-w-4xl"
      >
        {/* Manually split lines to enable clean line-by-line reveal masked animations */}
        <h2 className="text-2xl sm:text-3.5xl md:text-[2.5rem] lg:text-[2.85rem] font-light tracking-[0.08em] uppercase leading-[1.3] text-neutral-900 mb-8 sm:mb-10 flex flex-col gap-1">
          <span className="block overflow-hidden">
            <span className="showcase-line block">WHERE IMAGINATION</span>
          </span>
          <span className="block overflow-hidden">
            <span className="showcase-line block">MEETS CULINARY CRAFT.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="showcase-line block">DISCOVER RECIPES</span>
          </span>
          <span className="block overflow-hidden">
            <span className="showcase-line block">DESIGNED FOR YOU</span>
          </span>
        </h2>

        <p className="showcase-desc text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-light tracking-wide max-w-[360px] mb-12">
          Enter any craving, ingredient preference, or dietary goal. Our custom AI chef instantly transforms your ideas into tailored, step-by-step recipes built uniquely for your kitchen and palate.
        </p>

        {/* CTA Button Link */}
        <div className="showcase-cta flex items-center gap-3 cursor-pointer group">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900 transition-opacity duration-300 group-hover:opacity-75">
            TRY AI GENERATOR
          </span>
          <div className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md">
            <svg
              className="w-3.5 h-3.5 fill-current text-white"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
