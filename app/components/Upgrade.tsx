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

export default function Upgrade() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="upgrade"
      className={`${montserrat.variable} w-full bg-[#F5F3ED] py-20 px-6 sm:px-12 md:px-16 lg:px-24 relative z-30 font-[family-name:var(--font-montserrat)]`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="relative aspect-4/5 rounded-md overflow-hidden bg-neutral-900 group shadow-lg flex flex-col justify-between p-6 sm:p-8">
            <img
              src="/images/free.png"
              alt="Free Plan Background"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-350 group-hover:bg-black/55 z-0" />

            <div className="relative z-10 text-center w-full mt-2">
              <span className="text-white text-xs sm:text-sm tracking-[0.25em] font-light uppercase">
                FREE PLAN
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3 text-[10px] sm:text-xs text-white/85 tracking-[0.15em] font-light text-center px-4 w-full">
              <span>5 personal recipes / day</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>70 recipes / month</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>20 chats with Chef Ferrero</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>3 weekly plan calendars</span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-end w-full">
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-75">
                  TRY FREE PLAN
                </span>
                <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-4/5 rounded-md overflow-hidden bg-neutral-900 group shadow-lg flex flex-col justify-between p-6 sm:p-8">
            <img
              src="/images/gallery.png"
              alt="Gallery Background"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/45 transition-opacity duration-350 group-hover:bg-black/40 z-0" />

            <div className="relative z-10 text-center w-full mt-2">
              <span className="text-white text-xs sm:text-sm tracking-[0.25em] font-light uppercase">
                GALLERY
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              <p className="text-[11px] sm:text-xs text-white/90 tracking-[0.12em] uppercase font-light leading-relaxed max-w-xs text-center">
                Where atmosphere is built through time and presence
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-end w-full">
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-75">
                  EXPLORE GALLERY
                </span>
                <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-4/5 rounded-md overflow-hidden bg-neutral-900 group shadow-lg flex flex-col justify-between p-6 sm:p-8">
            <img
              src="/images/pro.png"
              alt="Pro Plan Background"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-350 group-hover:bg-black/55 z-0" />

            <div className="relative z-10 text-center w-full mt-2">
              <span className="text-white text-xs sm:text-sm tracking-[0.25em] font-light uppercase">
                PRO PLAN
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3 text-[10px] sm:text-xs text-white/85 tracking-[0.15em] font-light text-center px-4 w-full">
              <span>20 personalized recipes / day</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>500 recipes / month</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>Unlimited Chef AI Chat</span>
              <span className="w-4 h-px bg-white/20"></span>
              <span>Unlimited weekly planner</span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-end w-full">
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-75">
                  TRY PRO PLAN
                </span>
                <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
