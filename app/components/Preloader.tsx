"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

interface PreloaderProps {
  onComplete: () => void;
  onRevealStart?: () => void;
}

export default function Preloader({ onComplete, onRevealStart }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const caterWrapperRef = useRef<HTMLSpanElement>(null);
  const caterTextRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const words1 = ["a", "connection", "between"];
  const words2 = ["family", "and", "food"];

  useEffect(() => {
    document.documentElement.classList.add("preloader-active");
    document.body.style.overflow = "hidden";

    const targetTextWidth = caterTextRef.current ? caterTextRef.current.offsetWidth : 140;
    const spacingGap = window.innerWidth < 640 ? 30 : 48;
    const expandedWidth = targetTextWidth + spacingGap;

    gsap.set(".preloader-word", { yPercent: 0, opacity: 0 });
    gsap.set(caterWrapperRef.current, { width: 0 });
    gsap.set(caterTextRef.current, { yPercent: -105 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("preloader-active");
        document.body.style.overflow = "";
        onComplete();
      },
    });

    tl.to(".preloader-word", {
      opacity: 1,
      duration: 1.0,
      ease: "power2.out",
    });

    tl.to({}, { duration: 0.8 });

    tl.to(caterWrapperRef.current, {
      width: expandedWidth,
      duration: 1.2,
      ease: "power3.inOut",
    });

    tl.to(
      caterTextRef.current,
      {
        yPercent: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.7" // Blend width expand and text drop-down
    );

    // Hold completed layout for 1.0 second
    tl.to({}, { duration: 1.0 });

    // Step 4: Fade & translate the text container out upward
    tl.to(textContainerRef.current, {
      opacity: 0,
      y: -50,
      duration: 0.8,
      ease: "power3.inOut",
    });

    // Step 5: Morph the SVG curtain path downward (center lagging at the top)
    // Trigger onRevealStart right when the curtain begins to fall
    tl.to(
      pathRef.current,
      {
        attr: { d: "M 0 100 L 0 100 Q 50 0 100 100 V 100 Z" },
        duration: 1.2,
        ease: "power2.in",
        onStart: () => {
          if (onRevealStart) onRevealStart();
        },
      },
      "-=0.4" // Start slightly before text container finish
    );

    tl.to(pathRef.current, {
      attr: { d: "M 0 100 L 0 100 Q 50 100 100 100 V 100 Z" },
      duration: 0.6,
      ease: "power2.out",
    });
  }, [onComplete, onRevealStart]);

  return (
    <div
      ref={containerRef}
      className={`${montserrat.variable} fixed inset-0 z-999999 pointer-events-none font-(family-name:--font-montserrat) select-none`}
    >
      {/* SVG morphing curtain */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d="M 0 100 L 0 0 Q 50 0 100 0 V 100 Z"
          fill="#F4EFE6"
        />
      </svg>

      {/* Text overlay */}
      <div
        ref={textContainerRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10 px-6 w-full"
      >
        <div className="flex flex-row items-center justify-center text-center text-neutral-800 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase">
          {words1.map((word, i) => (
            <span key={`w1-${i}`} className="inline-block overflow-hidden py-1 align-middle mr-[0.35em]">
              <span className="preloader-word inline-block opacity-0">
                {word}
              </span>
            </span>
          ))}

          <span
            ref={caterWrapperRef}
            className="inline-block overflow-hidden relative h-10 mx-0"
            style={{ verticalAlign: "middle" }}
          >
            <span
              ref={caterTextRef}
              className="absolute left-1/2 -translate-x-1/2 h-full flex items-center justify-center font-light text-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.35em] sm:tracking-[0.45em] whitespace-nowrap"
            >
              cater
            </span>
          </span>

          {words2.map((word, i) => (
            <span key={`w2-${i}`} className="inline-block overflow-hidden py-1 align-middle mr-[0.35em] last:mr-0">
              <span className="preloader-word inline-block opacity-0">
                {word}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
