"use client";

import { useState, useRef, useEffect } from "react";
import { Montserrat } from "next/font/google";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
});

export const Navbar = ({ isRevealed = true }: { isRevealed?: boolean }) => {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Set initial state for navbar entrance
  useGSAP(() => {
    gsap.set(navRef.current, { y: -80, opacity: 0 });
  }, []);

  // Reveal navbar when isRevealed is true
  useGSAP(() => {
    if (isRevealed && navRef.current) {
      gsap.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
      });
    }
  }, [isRevealed]);

  const handleToggle = () => {
    if (isMounted) {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scaleY: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          transformOrigin: "top center",
          onComplete: () => {
            setIsMounted(false);
          },
        });
      } else {
        setIsMounted(false);
      }
    } else {
      setIsMounted(true);
    }
  };

  useEffect(() => {
    if (isMounted && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        {
          scaleY: 0,
          opacity: 0,
          transformOrigin: "top center",
        },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        },
      );

      if (linksRef.current) {
        gsap.fromTo(
          linksRef.current.children,
          {
            y: -15,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.1,
          },
        );
      }
    }
  }, [isMounted]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMounted &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        gsap.to(containerRef.current, {
          scaleY: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          transformOrigin: "top center",
          onComplete: () => {
            setIsMounted(false);
          },
        });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMounted && containerRef.current) {
        gsap.to(containerRef.current, {
          scaleY: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          transformOrigin: "top center",
          onComplete: () => {
            setIsMounted(false);
          },
        });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted]);

  return (
    <>
      <nav
        ref={navRef}
        className={`${montserrat.variable} fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-12 md:px-16 lg:px-24 h-24 bg-linear-to-b from-black/60 to-transparent text-white`}
      >
        <div className="flex-1 flex justify-start">
          <button className="border border-white/30 hover:bg-white/10 hover:border-white px-5 py-2 text-[10px] sm:text-xs tracking-[0.2em] font-light uppercase transition duration-300 bg-transparent cursor-pointer">
            TRY NOW
          </button>
        </div>

        <div className="flex-none text-center">
          <span className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.35em] sm:tracking-[0.5em] uppercase font-(family-name:--font-montserrat)">
            CATER
          </span>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            ref={toggleButtonRef}
            onClick={handleToggle}
            className="relative flex flex-col justify-center items-end group cursor-pointer w-8 h-8 bg-transparent border-none focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            <span
              className={`h-px bg-white transition-all duration-300 ${isMounted ? "w-8 rotate-45 translate-y-0.5" : "w-5 group-hover:w-8"}`}
            ></span>
            <span
              className={`h-px bg-white transition-all duration-300 mt-1.5 ${isMounted ? "w-8 -rotate-45 -translate-y-1.25" : "w-8"}`}
            ></span>
          </button>
        </div>
      </nav>

      {isMounted && (
        <div
          ref={containerRef}
          className={`${montserrat.variable} fixed top-24 left-1/2 -translate-x-1/2 w-[calc(100%-20px)] lg:w-162.5 bg-white text-black shadow-2xl rounded-sm z-50 overflow-hidden font-sans border border-neutral-200`}
        >
          <div ref={linksRef} className="flex flex-col items-center">
            <div className="flex flex-col items-center pt-8 pb-4 gap-4 text-xs sm:text-sm tracking-[0.25em] font-light uppercase text-neutral-800 w-full">
              <a
                href="#home"
                onClick={handleToggle}
                className="hover:text-black transition py-1 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                HOME
              </a>
              <a
                href="#menu"
                onClick={handleToggle}
                className="hover:text-black transition py-1 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                MENU
              </a>
              <a
                href="#gallery"
                onClick={handleToggle}
                className="hover:text-black transition py-1 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                GALLERY
              </a>
              <a
                href="#about"
                onClick={handleToggle}
                className="hover:text-black transition py-1 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                ABOUT
              </a>
              <a
                href="#instagram"
                onClick={handleToggle}
                className="hover:text-black transition py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                INSTAGRAM <span className="text-[10px]">↗</span>
              </a>
            </div>

            <div className="px-4 pb-4 w-full">
              <div className="relative w-full aspect-2/1 overflow-hidden rounded-sm">
                <img
                  src="/images/navbar-drop.jpg"
                  alt="Chef dish banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-between px-6 text-white text-[8px] sm:text-[10px] tracking-[0.25em] font-light uppercase">
                  <span>A REFLECTION BETWEEN</span>
                  <span className="font-normal mx-2 text-xs sm:text-sm">𓎩</span>
                  <span>FOOD AND HEALTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
