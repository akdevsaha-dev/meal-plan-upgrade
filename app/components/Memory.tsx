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

export default function Memory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      videoRef.current,
      { scale: 1.1, opacity: 0.6 },
      {
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom center",
          scrub: true,
        },
      }
    );
    if (textContainerRef.current) {
      gsap.fromTo(
        textContainerRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="memory"
      className={`${montserrat.variable} w-full h-screen overflow-hidden bg-black text-white relative z-30 font-[family-name:var(--font-montserrat)] flex items-center justify-center`}
    >
      <video
        ref={videoRef}
        src="/videos/connectout.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />

      <div className="absolute inset-0 bg-black/60 z-10" />

      <div
        ref={textContainerRef}
        className="relative z-20 flex flex-col justify-center items-center text-center px-6 max-w-5xl"
      >
        <span className="text-[10px] sm:text-xs tracking-[0.3em] text-white/70 font-light uppercase mb-6 sm:mb-8">
          CULINARY GATHERINGS
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] text-white uppercase leading-[1.2] max-w-4xl">
          Join us and make a<br />
          <span className="font-semibold text-neutral-100">Memory of a Lifetime</span>
        </h2>

        <div className="w-12 h-[1px] bg-white/30 my-8" />

        <p className="text-xs sm:text-sm md:text-base text-white/80 font-light tracking-widest uppercase max-w-xl leading-relaxed mb-10">
          Cater brings families and friends together around the table. Save your personalized recipes, plan custom calendars, and share moments that matter.
        </p>

        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-75">
            START YOUR JOURNEY
          </span>
          <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black">
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
