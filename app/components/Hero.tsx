"use client";

import { useRef } from "react";
import { Montserrat } from "next/font/google";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-montserrat",
});

export const Hero = ({ isRevealed = true }: { isRevealed?: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const line1 = "Get Meal Plans.";
  const line2 = "Crafted Just For You.";

  const splitText = (text: string) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="inline-block char transition-colors duration-300"
        style={{ display: char === " " ? "inline" : "inline-block" }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  // Set initial state on mount
  useGSAP(
    () => {
      gsap.set(".char", {
        opacity: 0,
        y: 100,
        rotationX: -95,
        scale: 0.3,
        transformOrigin: "center bottom -50",
      });
    },
    { scope: sectionRef }
  );

  // Trigger reveal animation when isRevealed is true, and set up hover listeners
  useGSAP(
    () => {
      if (isRevealed) {
        gsap.to(".char", {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          stagger: 0.02,
          duration: 1.5,
          ease: "power4.out",
        });
      }

      const section = sectionRef.current;
      if (!section) return;

      const handleMouseMove = (e: MouseEvent) => {
        const chars = section.querySelectorAll(".char");
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        chars.forEach((char) => {
          const rect = char.getBoundingClientRect();
          const charX = rect.left + rect.width / 2;
          const charY = rect.top + rect.height / 2;

          const distX = mouseX - charX;
          const distY = mouseY - charY;
          const distance = Math.sqrt(distX * distX + distY * distY);
          const threshold = 150;

          if (distance < threshold) {
            const power = (threshold - distance) / threshold;

            const pullX = (distX / distance) * power * 35;
            const pullY = (distY / distance) * power * 35;
            const angle = (distX / distance) * power * 45;
            const scale = 1 + power * 0.35;

            gsap.to(char, {
              x: pullX,
              y: pullY,
              rotation: angle,
              scale: scale,
              color: "#A94420",
              textShadow: "0 0 15px rgba(169, 68, 32, 0.6)",
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else {
            gsap.to(char, {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              color: "rgba(255, 255, 255, 1)",
              textShadow: "none",
              duration: 0.75,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
        });
      };

      const handleMouseLeave = () => {
        const chars = section.querySelectorAll(".char");
        gsap.to(chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          color: "rgba(255, 255, 255, 1)",
          textShadow: "none",
          duration: 1.2,
          ease: "elastic.out(1.1, 0.4)",
          stagger: 0.01,
          overwrite: "auto",
        });
      };

      section.addEventListener("mousemove", handleMouseMove);
      section.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        section.removeEventListener("mousemove", handleMouseMove);
        section.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { dependencies: [isRevealed], scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className={`${montserrat.variable} relative w-full h-screen overflow-hidden bg-black`}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        src="/videos/output.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <div className="absolute inset-0 bg-black/45 z-10" />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start px-6 sm:px-12 md:px-20 lg:px-32 text-left max-w-6xl">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] text-white uppercase leading-tight font-(family-name:--font-montserrat) select-none">
          <span className="block leading-none mb-3 py-1 overflow-visible">
            {splitText(line1)}
          </span>
          <span className="block font-semibold text-white/90 leading-none py-1 overflow-visible">
            {splitText(line2)}
          </span>
        </h1>
      </div>
    </section>
  );
};
