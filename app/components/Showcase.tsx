"use client";

import { useEffect, useRef } from "react";
import { Montserrat } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
});

export default function Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    tl.fromTo(
      tagRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    ).fromTo(
      contentRef.current?.children || [],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className={`${montserrat.variable} w-full min-h-[80vh] bg-[#F5F3ED] text-neutral-800 flex flex-col md:flex-row items-start justify-between py-24 px-6 sm:px-12 md:px-20 lg:px-32 relative z-30 font-[family-name:var(--font-montserrat)] border-t border-neutral-200/50`}
    >
      <div 
        ref={tagRef}
        className="w-full md:w-1/4 mb-8 md:mb-0"
      >
        <span className="text-[10px] sm:text-xs tracking-[0.25em] text-neutral-500 font-light uppercase">
          AI CULINARY ENGINE
        </span>
      </div>

      <div 
        ref={contentRef}
        className="w-full md:w-3/4 flex flex-col items-start text-left max-w-4xl"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] uppercase leading-[1.2] text-neutral-900 mb-8 sm:mb-12">
          WHERE IMAGINATION<br className="hidden lg:inline" />
          MEETS CULINARY CRAFT.<br />
          DISCOVER RECIPES<br className="hidden lg:inline" />
          DESIGNED FOR YOU
        </h2>

        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light tracking-[0.02em] max-w-xl mb-10">
          Enter any craving, ingredient preference, or dietary goal. Our custom AI chef instantly transforms your ideas into tailored, step-by-step recipes built uniquely for your kitchen and palate.
        </p>

        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-neutral-900 transition-opacity duration-300 group-hover:opacity-75">
            TRY AI GENERATOR
          </span>
          <div className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900">
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
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
