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
  const subHeadline1Ref = useRef<HTMLDivElement>(null);
  const headline1Ref = useRef<HTMLHeadingElement>(null);
  const desc1Ref = useRef<HTMLDivElement>(null);
  const headline1FloatRef = useRef<HTMLSpanElement>(null);
  const desc1FloatRef = useRef<HTMLDivElement>(null);
  const bgImg1Ref = useRef<HTMLImageElement>(null);

  const section2Ref = useRef<HTMLDivElement>(null);
  const imgContainer2Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const headline2Ref = useRef<HTMLHeadingElement>(null);
  const descContainer2Ref = useRef<HTMLDivElement>(null);
  const headline2FloatRef = useRef<HTMLSpanElement>(null);
  const desc2FloatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time opacity reveal trigger when section enters viewport
    const s1RevealTl = gsap.timeline({
      scrollTrigger: {
        trigger: section1Ref.current,
        start: "top 95%",
        toggleActions: "play none none reverse",
      },
    });

    s1RevealTl.fromTo(
      [subHeadline1Ref.current, headline1Ref.current, desc1Ref.current],
      { opacity: 0 },
      { opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }
    );

    // Scroll-driven Y parallax scrub (floating up relative to background)
    const s1ParallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: section1Ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    s1ParallaxTl.fromTo(
      subHeadline1Ref.current,
      { y: 80 },
      { y: -80, ease: "none" }
    );
    s1ParallaxTl.fromTo(
      headline1Ref.current,
      { y: 120 },
      { y: -120, ease: "none" },
      "<"
    );
    s1ParallaxTl.fromTo(
      desc1Ref.current,
      { y: 60 },
      { y: -60, ease: "none" },
      "<"
    );

    // Section 1 Background Parallax Scrub (starts immediately when entering viewport)
    const s1BgTl = gsap.timeline({
      scrollTrigger: {
        trigger: section1Ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    s1BgTl.fromTo(
      bgImg1Ref.current,
      { yPercent: -12 },
      { yPercent: 12, ease: "none" }
    );

    // Section 1 Idle Floating Loop
    const floatH1 = gsap.to(headline1FloatRef.current, {
      y: -8,
      x: 3,
      rotation: 0.3,
      duration: 5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const floatD1 = gsap.to(desc1FloatRef.current, {
      y: 6,
      x: -2,
      rotation: -0.2,
      duration: 4.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

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

    // Section 2 Idle Floating Loop
    const floatH2 = gsap.to(headline2FloatRef.current, {
      y: -6,
      x: 2,
      duration: 4.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const floatD2 = gsap.to(desc2FloatRef.current, {
      y: 5,
      x: -2,
      duration: 4.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      s1RevealTl.kill();
      s1ParallaxTl.kill();
      s1BgTl.kill();
      s2ImgTl.kill();
      s2TextTl.kill();
      floatH1.kill();
      floatD1.kill();
      floatH2.kill();
      floatD2.kill();
    };
  }, []);

  return (
    <div className={`${montserrat.variable} w-full font-(family-name:--font-montserrat) text-white bg-black`}>

      <section
        ref={section1Ref}
        className="relative w-full h-screen overflow-hidden bg-black"
      >
        <img
          ref={bgImg1Ref}
          src="/images/next-h.png"
          alt="Vibe Background"
          className="absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/40 z-10" />

        <div
          ref={subHeadline1Ref}
          className="absolute top-20 left-6 sm:left-12 md:left-20 lg:left-28 z-20"
        >
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-white/80 font-light uppercase">
            FOOD AND DESSERT
          </span>
        </div>

        <div className="absolute top-[32%] sm:top-[35%] left-6 sm:left-12 md:left-20 lg:left-28 z-20 max-w-5xl">
          <h2
            ref={headline1Ref}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] uppercase leading-[1.2] text-white"
          >
            <span ref={headline1FloatRef} className="block">
              CATER, WHERE<br />
              COOKING<br />
              BECOMES SIMPLE
            </span>
          </h2>
        </div>

        <div
          ref={desc1Ref}
          className="absolute bottom-16 right-6 sm:right-12 md:right-20 lg:right-28 z-20 flex flex-col items-start text-left max-w-xs sm:max-w-sm md:max-w-md"
        >
          <div ref={desc1FloatRef} className="w-full flex flex-col items-start text-left">
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
              <span ref={headline2FloatRef} className="block">
                FLAVORS THAT<br />
                HOLD THE MOMENT
              </span>
            </h2>
          </div>

          <div
            ref={descContainer2Ref}
            className="flex flex-col items-start text-left max-w-sm sm:max-w-md"
          >
            <div ref={desc2FloatRef} className="w-full flex flex-col items-start text-left">
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
        </div>
      </section>
    </div>
  );
};
