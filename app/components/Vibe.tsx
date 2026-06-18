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

export const Vibe = () => {
  const section1Ref = useRef<HTMLDivElement>(null);
  const headline1Ref = useRef<HTMLHeadingElement>(null);
  const desc1Ref = useRef<HTMLDivElement>(null);

  const section2Ref = useRef<HTMLDivElement>(null);
  const imgContainer2Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const headline2Ref = useRef<HTMLHeadingElement>(null);
  const descContainer2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s1Tl = gsap.timeline({
      scrollTrigger: {
        trigger: section1Ref.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    s1Tl.fromTo(
      headline1Ref.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      desc1Ref.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    const s2ImgTl = gsap.timeline({
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top 95%",
        end: "top 20%",
        scrub: 1,
      },
    });

    s2ImgTl.fromTo(
      imgContainer2Ref.current,
      { clipPath: "inset(0 100% 0 0)", opacity: 0.8 },
      { clipPath: "inset(0 0% 0 0)", opacity: 1, ease: "none" }
    ).fromTo(
      img2Ref.current,
      { scale: 1.2 },
      { scale: 1, ease: "none" },
      "<"
    );

    const s2TextTl = gsap.timeline({
      scrollTrigger: {
        trigger: section2Ref.current,
        start: "top 60%",
        toggleActions: "play none none reverse",
      },
    });

    s2TextTl.fromTo(
      headline2Ref.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      descContainer2Ref.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.5"
    );
  }, []);

  return (
    <div className={`${montserrat.variable} w-full font-(family-name:--font-montserrat) text-white bg-black`}>

      <section
        ref={section1Ref}
        className="relative w-full h-screen overflow-hidden bg-black"
      >
        <img
          src="/images/next-h.png"
          alt="Vibe Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="absolute top-20 left-6 sm:left-12 md:left-20 lg:left-28 z-20">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-white/80 font-light uppercase">
            FOOD AND DESSERT
          </span>
        </div>

        <div className="absolute top-[32%] sm:top-[35%] left-6 sm:left-12 md:left-20 lg:left-28 z-20 max-w-5xl">
          <h2
            ref={headline1Ref}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] uppercase leading-[1.2] text-white"
          >
            CATER, WHERE<br />
            COOKING<br />
            BECOMES SIMPLE
          </h2>
        </div>

        <div
          ref={desc1Ref}
          className="absolute bottom-16 right-6 sm:right-12 md:right-20 lg:right-28 z-20 flex flex-col items-start text-left max-w-xs sm:max-w-sm md:max-w-md"
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light tracking-wider">
            Guided by flavor, memory, and craft. An AI Chef rooted in simplicity, led by precision, and made to be shared.
          </p>

          <div className="mt-6 flex items-center gap-3 cursor-pointer group">
            <span className="text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-80">
              EXPLORE MORE
            </span>
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
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

      <section
        ref={section2Ref}
        className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-black"
      >
        <div
          ref={imgContainer2Ref}
          className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden bg-zinc-900"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <img
            ref={img2Ref}
            src="/images/vibe.png"
            alt="Chef Specialty Dish"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="w-full md:w-1/2 h-[50vh] md:h-screen bg-[#c87a64] flex flex-col justify-between p-8 sm:p-16 md:p-20 lg:p-24 relative overflow-hidden">

          <div className="mt-4 sm:mt-8">
            <h2
              ref={headline2Ref}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-widest sm:tracking-[0.15em] uppercase leading-[1.25] text-white"
            >
              FLAVORS THAT<br />
              HOLD THE MOMENT
            </h2>
          </div>

          <div
            ref={descContainer2Ref}
            className="flex flex-col items-start text-left max-w-sm sm:max-w-md"
          >
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light tracking-wider">
              Cooking is not instruction, it is transformation. It is raw ingredients becoming meaning through time, heat, and judgment. It is a quiet intelligence where every step reshapes what is possible on the plate.
            </p>

            <div className="mt-6 sm:mt-8 flex items-center gap-3 cursor-pointer group">
              <span className="text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-white transition-opacity duration-300 group-hover:opacity-80">
                VIEW FULL MENU
              </span>
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
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
    </div>
  );
};
