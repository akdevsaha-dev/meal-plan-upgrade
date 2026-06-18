"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Set initial state for page entrance reveal
  useGSAP(() => {
    gsap.set(mainRef.current, { y: -100, scale: 0.96, opacity: 0 });
  }, []);

  // Animate the page into view once the preloader curtain starts sliding down
  useGSAP(() => {
    if (isRevealed && mainRef.current) {
      gsap.to(mainRef.current, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: "power4.out",
      });
    }
  }, [isRevealed]);

  return (
    <>
      {/* Render the preloader covering the screen */}
      {isLoading && (
        <Preloader 
          onRevealStart={() => setIsRevealed(true)}
          onComplete={() => setIsLoading(false)} 
        />
      )}
      
      {/* 
        Main content renders in the DOM behind the preloader and is revealed
        naturally as the preloader curtain slides down.
      */}
      <main 
        ref={mainRef}
        className="relative w-full min-h-screen bg-black text-white"
        style={{ transformOrigin: "center top" }}
      >
        <Navbar isRevealed={isRevealed} />
        <Hero isRevealed={isRevealed} />
        <Vibe />
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
