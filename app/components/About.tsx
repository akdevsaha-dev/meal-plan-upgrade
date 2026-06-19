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

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

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
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    ).fromTo(
      imgContainerRef.current,
      { clipPath: "inset(100% 0 0 0)", opacity: 0.8 },
      { clipPath: "inset(0% 0 0 0)", opacity: 1, duration: 1.2, ease: "power4.inOut" },
      "-=0.4"
    ).fromTo(
      imgRef.current,
      { scale: 1.15 },
      { scale: 1, duration: 1.5, ease: "power3.out" },
      "-=1.2"
    ).fromTo(
      textContainerRef.current?.children || [],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      "-=0.8"
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`${montserrat.variable} w-full min-h-screen bg-[#FAF9F6] text-neutral-800 flex flex-col md:flex-row py-24 px-6 sm:px-12 md:px-20 lg:px-32 relative z-30 font-(family-name:--font-montserrat) justify-between items-start gap-8 md:gap-12`}
    >
      <div
        ref={tagRef}
        className="w-full md:w-[10%] mb-4 md:mb-0"
      >
        <span className="text-[10px] sm:text-xs tracking-[0.25em] text-neutral-500 font-light uppercase">
          ABOUT
        </span>
      </div>

      <div
        ref={imgContainerRef}
        className="w-full md:w-[38%] aspect-3/4 relative overflow-hidden bg-neutral-100 shadow-md"
        style={{ clipPath: "inset(100% 0 0 0)" }}
      >
        <img
          ref={imgRef}
          src="/images/about.jpg"
          alt="AI Chef Culinary Specialist"
          className="w-full h-full object-cover object-center scale-[1.15]"
        />
      </div>

      <div
        ref={textContainerRef}
        className="w-full md:w-[48%] flex flex-col justify-between min-h-[50vh] md:min-h-[60vh] py-2 text-left"
      >
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] uppercase leading-tight text-neutral-900">
            COOKING THAT<br />
            FEELS PERSONAL
          </h2>
        </div>

        <div className="flex flex-col items-start gap-6 mt-12 md:mt-auto max-w-md">
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light tracking-[0.02em]">
            Cater is a smart kitchen companion designed to elevate your daily culinary experience. A personalized AI chef focused on thoughtful cooking, where each generated recipe responds directly to your ingredients, dietary goals, and cravings.
          </p>

          <div className="flex items-center gap-3 cursor-pointer group">
            <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-neutral-900 transition-opacity duration-300 group-hover:opacity-75">
              ABOUT OUR AI CHEF
            </span>
            <div className="w-7 h-7 rounded-full border border-neutral-400 flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900">
              <svg
                className="w-3 h-3 fill-current"
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
      </div>
    </section>
  );
}
