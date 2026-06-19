"use client";

import React, { useRef } from "react";
import { Montserrat } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Scene from "./three/Scene";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const Display = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. ScrollTrigger entrance timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom", // Trigger as soon as the top of the section enters the bottom of the viewport
        once: true,
      },
    });

    // Scale up the background and fade in
    tl.fromTo(
      containerRef.current,
      { opacity: 0.9 },
      { opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    // Canvas container scales up and fades in
    tl.fromTo(
      canvasContainerRef.current,
      { scale: 0.7, opacity: 0, y: 100 },
      { scale: 1, opacity: 1, y: 0, duration: 1.6, ease: "power4.out" },
      "-=1.2"
    );

    // Staggered slide up reveal for text items
    const leftTexts = leftTextRef.current?.querySelectorAll(".reveal-item") || [];
    const rightTexts = rightTextRef.current?.querySelectorAll(".reveal-item") || [];

    tl.fromTo(
      [leftTexts, rightTexts],
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, stagger: 0.15, ease: "power3.out" },
      "-=1.0"
    );

    // Refresh ScrollTrigger to ensure correct placement
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 800);

    return () => clearTimeout(timer);
  }, { scope: containerRef });

  // 2. Interactive mouse parallax tilt/float effect
  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    const normalizedX = x / (width / 2);
    const normalizedY = y / (height / 2);

    // Move text layers in opposition to mouse for deep parallax
    gsap.to(leftTextRef.current, {
      x: -normalizedX * 25,
      y: -normalizedY * 15,
      rotationY: -normalizedX * 5,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.to(rightTextRef.current, {
      x: normalizedX * 25,
      y: -normalizedY * 15,
      rotationY: normalizedX * 5,
      duration: 0.8,
      ease: "power2.out",
    });

    // Note: the 3D plate container is intentionally NOT tilted by the mouse.
    // The plate stays fixed and only rotates when the user drags it directly.
  };

  const onMouseLeave = () => {
    gsap.to([leftTextRef.current, rightTextRef.current], {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 1.0,
      ease: "power3.out",
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`${montserrat.variable} relative w-full h-screen overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:px-20 lg:px-32 py-12 z-35 font-(family-name:--font-montserrat)`}
      style={{
        backgroundImage: "url('/images/table.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        perspective: "1200px",
      }}
    >
      {/* Dark overlay vignette to ensure legibility of texts and model pop */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/50 z-0 pointer-events-none" />

      {/* Left Column: Bold Taglines */}
      <div
        ref={leftTextRef}
        className="relative z-10 w-full md:w-[35%] flex flex-col items-start text-left gap-4"
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="reveal-item text-[10px] sm:text-xs tracking-[0.3em] text-neutral-300 font-light uppercase mb-2">
          THE CULINARY CONNECTION
        </span>
        <div className="overflow-hidden">
          <h2 className="reveal-item text-4xl sm:text-5xl lg:text-6xl font-light tracking-[0.04em] text-white uppercase leading-[1.1]">
            FOOD THAT
          </h2>
        </div>
        <div className="overflow-hidden">
          <h2 className="reveal-item text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[0.04em] text-white uppercase leading-[1.1]">
            GETS YOU
          </h2>
        </div>
        <div className="overflow-hidden">
          <h2 className="reveal-item text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[0.04em] uppercase leading-[1.1] bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            CLOSE,
          </h2>
        </div>
        <div className="overflow-hidden mt-2">
          <p className="reveal-item text-neutral-300 font-light tracking-[0.05em] text-sm sm:text-base border-l-2 border-white/40 pl-4 py-1">
            &quot;Food that serves.&quot;
          </p>
        </div>
      </div>

      {/* Center Column: Huge 3D Food Plate Viewport sitting on the table */}
      <div
        ref={canvasContainerRef}
        className="relative z-10 w-full md:w-[45%] h-[55%] md:h-[75%] overflow-visible flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >

        {/* The 3D Canvas Scene */}
        <div className="absolute inset-0 z-10 w-full h-full">
          <Scene
            modelScale={3.2}
            cameraPosition={[0, 1.45, 2.3]}
            fov={40}
            modelPosition={[0, -0.5, 0]}
            shadowPosition={[0, -0.58, 0]}
            target={[0, -0.25, 0]}
          />
        </div>
      </div>

      {/* Right Column: Dynamic Subheadings */}
      <div
        ref={rightTextRef}
        className="relative z-10 w-full md:w-[30%] flex flex-col items-start md:items-end text-left md:text-right gap-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex flex-col gap-2 items-start md:items-end w-full">
          <span className="reveal-item text-[10px] sm:text-xs tracking-[0.3em] text-neutral-300 font-light uppercase">
            INTELLIGENT FLAVOR
          </span>
          <p className="reveal-item text-xl sm:text-2xl font-light text-white uppercase tracking-[0.05em]">
            Crafted by Intelligence.
          </p>
          <p className="reveal-item text-xl sm:text-2xl font-medium text-white uppercase tracking-[0.05em] -mt-2">
            Perfected by Taste.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xs items-start md:items-end w-full mt-4">
          <p className="reveal-item text-xs sm:text-sm text-neutral-300 leading-relaxed font-light tracking-[0.02em]">
            A culinary journey customized to your cravings. No matter the ingredients in your fridge, we bridge the gap between imagination and a perfect plate.
          </p>

          <div className="reveal-item flex items-center gap-3 cursor-pointer group mt-2">
            <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-75">
              DISCOVER MORE
            </span>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
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
      </div>
    </section>
  );
};