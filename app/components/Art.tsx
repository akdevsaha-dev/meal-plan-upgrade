"use client";

import { useRef } from "react";
import { Montserrat } from "next/font/google";
import { useMediaQuery } from "react-responsive";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-montserrat",
});

const Art = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const sectionRef = useRef<HTMLDivElement>(null);
    const maskedContentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const start = isMobile ? "top 10%" : "top top";

        const maskTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start,
                end: "bottom center",
                scrub: 1.5,
                pin: true,
                anticipatePin: 1,
            },
        });

        maskTimeline
            .to(".will-fade", {
                opacity: 0,
                y: -35,
                stagger: 0.08,
                ease: "power2.inOut",
            })
            .to(".masked-img", {
                scale: 1.12,
                maskSize: "380%",
                webkitMaskSize: "380%",
                duration: 1.5,
                ease: "power2.inOut",
            }, "-=0.25")
            .to(maskedContentRef.current, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
            }, "-=0.5");
    }, { scope: sectionRef, dependencies: [isMobile] });

    return (
        <section
            ref={sectionRef}
            id="art"
            className={`${montserrat.variable} font-(family-name:--font-montserrat) relative w-full min-h-screen overflow-hidden bg-[#FAF9F6] text-neutral-800 py-24 flex flex-col items-center justify-center z-30`}
        >
            <div className="absolute inset-0 radial-gradient-light pointer-events-none z-0" />

            <div className="absolute inset-x-0 top-[15%] pointer-events-none select-none z-0 flex justify-center items-center will-fade">
                <h2 className="text-[12vw] leading-none uppercase font-extrabold text-neutral-200/50 tracking-[0.15em] text-center select-none">
                    The Art
                </h2>
            </div>

            <div className="absolute left-8 sm:left-12 md:left-20 lg:left-32 top-1/2 -translate-y-1/2 z-20 hidden md:block will-fade max-w-[240px] text-left">
                <div className="w-10 h-[1px] bg-neutral-300 mb-6" />
                <p className="text-neutral-500 text-xs sm:text-sm tracking-widest uppercase font-light leading-relaxed">
                    Every detail is sculpted with intent. Curated menus designed to elevate the standard of presentation and taste.
                </p>
            </div>

            <div className="absolute right-8 sm:right-12 md:right-20 lg:right-32 top-1/2 -translate-y-1/2 z-20 hidden md:block will-fade max-w-[280px] text-left">
                <ul className="space-y-6 text-neutral-500 text-xs sm:text-sm tracking-[0.2em] uppercase font-light">
                    <li className="flex items-center gap-4">
                        <span className="w-5 h-5 rounded-full border border-neutral-350 flex items-center justify-center text-[10px] text-neutral-700 font-semibold">✓</span>
                        Perfect Balance
                    </li>
                    <li className="flex items-center gap-4">
                        <span className="w-5 h-5 rounded-full border border-neutral-350 flex items-center justify-center text-[10px] text-neutral-700 font-semibold">✓</span>
                        Curated Garnishes
                    </li>
                    <li className="flex items-center gap-4">
                        <span className="w-5 h-5 rounded-full border border-neutral-350 flex items-center justify-center text-[10px] text-neutral-700 font-semibold">✓</span>
                        Precision Temps
                    </li>
                    <li className="flex items-center gap-4">
                        <span className="w-5 h-5 rounded-full border border-neutral-350 flex items-center justify-center text-[10px] text-neutral-700 font-semibold">✓</span>
                        Expert Assembly
                    </li>
                </ul>
            </div>

            <div className="relative w-[280px] sm:w-[380px] md:w-[440px] aspect-[4/3] z-10 mx-auto flex items-center justify-center overflow-visible">
                <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-xl shadow-black/10">
                    <img
                        src="/images/below.png"
                        alt="Craft Cocktail Presentation"
                        className="absolute inset-0 w-full h-full object-cover object-center masked-img scale-[1.05]"
                    />
                </div>
            </div>

            <div className="absolute bottom-16 inset-x-0 z-20 flex flex-col items-center justify-center text-center px-6 h-28">
                <h2 className="will-fade text-lg sm:text-2xl md:text-3xl tracking-[0.25em] font-light uppercase text-neutral-800 leading-none">
                    Sip-worthy Perfection
                </h2>

                <div
                    ref={maskedContentRef}
                    className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center opacity-0 translate-y-8 px-4 pointer-events-none"
                >
                    <div className="absolute inset-0 bg-[#FAF9F6]/85 backdrop-blur-[2px] z-0" />
                    <div className="relative z-10 max-w-xl flex flex-col items-center">
                        <h3 className="text-xl sm:text-3xl md:text-4xl font-light tracking-[0.15em] uppercase text-neutral-900 leading-tight">
                            Made with Craft,<br />
                            <span className="font-semibold text-neutral-950">Poured with Passion</span>
                        </h3>
                        <div className="w-12 h-[1px] bg-neutral-300 my-4" />
                        <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-widest uppercase max-w-md leading-relaxed">
                            A carefully crafted culinary moment customized specifically for your palate.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Art;
