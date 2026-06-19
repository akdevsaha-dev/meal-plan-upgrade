"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Vibe } from "./components/Vibe";
import Art from "./components/Art";
import Showcase from "./components/Showcase";
import Memory from "./components/Memory";
import Footer from "./components/Footer";
import Upgrade from "./components/Upgrade";
import About from "./components/About";
import Preloader from "./components/Preloader";
import { Display } from "./components/Display";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventTopBounce = (e: WheelEvent) => {
      if (window.scrollY <= 0 && e.deltaY < 0) {
        e.preventDefault();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const preventTopBounceTouch = (e: TouchEvent) => {
      if (window.scrollY <= 0 && e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const isScrollingUp = currentY > touchStartY;
        if (isScrollingUp) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("wheel", preventTopBounce, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", preventTopBounceTouch, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventTopBounce);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", preventTopBounceTouch);
    };
  }, []);

  useGSAP(() => {
    gsap.set(mainRef.current, { y: -100, scale: 0.96, opacity: 0 });
  }, []);

  useGSAP(() => {
    if (isRevealed && mainRef.current) {
      gsap.to(mainRef.current, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: "power4.out",
        onComplete: () => {
          gsap.set(mainRef.current, { clearProps: "transform" });
          ScrollTrigger.refresh();
        },
      });
    }
  }, [isRevealed]);

  return (
    <>
      {isLoading && (
        <Preloader
          onRevealStart={() => setIsRevealed(true)}
          onComplete={() => setIsLoading(false)}
        />
      )}
      <main
        ref={mainRef}
        className="relative w-full min-h-screen bg-black text-white"
        style={{ transformOrigin: "center top" }}
      >
        <Navbar isRevealed={isRevealed} />
        <Hero isRevealed={isRevealed} />
        <Vibe />
        <Display />
        <Art />
        <Showcase />
        <Upgrade />
        <About />
        <Memory />
        <Footer />
      </main>
    </>
  );
}
