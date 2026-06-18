"use client";

import { Montserrat, Antonio } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-antonio",
});

export default function Footer() {
  return (
    <footer
      className={`${montserrat.variable} ${antonio.variable} w-full bg-[#FAF9F6] text-neutral-800 pt-20 pb-8 px-6 sm:px-12 md:px-16 lg:px-24 relative z-30 font-(family-name:--font-montserrat) border-t border-neutral-200/50`}
    >
      <div className="max-w-7xl mx-auto flex flex-col justify-between h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-28 sm:w-36 aspect-3/4 relative overflow-hidden rounded-sm bg-neutral-200 shrink-0 shadow-sm">
              <img
                src="/images/footer-left.png"
                alt="Chef plating dish"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col items-start text-left justify-between h-full py-1">
              <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed font-light tracking-[0.03em] max-w-xs">
                Driven by a passion for cuisine and personalized AI culinary craft, we create custom cooking solutions designed to inspire kitchen experiences across the globe.
              </p>
              <div className="mt-4 flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-neutral-900 transition-opacity duration-300 group-hover:opacity-75">
                  CATER CULINARY
                </span>
                <div className="w-6 h-6 rounded-full border border-neutral-450 flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 lg:pl-12 flex flex-col items-start text-left">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-neutral-400 font-light uppercase mb-6 sm:mb-8">
              NAVIGATION
            </span>
            <ul className="flex flex-col gap-3 text-xs sm:text-sm tracking-[0.2em] font-light uppercase text-neutral-800">
              <li>
                <a href="#home" className="hover:text-black transition">HOME</a>
              </li>
              <li>
                <a href="#menu" className="hover:text-black transition">MENU</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-black transition">GALLERY</a>
              </li>
              <li>
                <a href="#about" className="hover:text-black transition">ABOUT</a>
              </li>
              <li>
                <a href="#instagram" className="hover:text-black transition flex items-center gap-1">
                  INSTAGRAM <span className="text-[9px]">↗</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start text-left w-full">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-neutral-400 font-light uppercase mb-6 sm:mb-8">
              NEWSLETTER
            </span>
            <form onSubmit={(e) => e.preventDefault()} method="POST" className="flex flex-col gap-6 w-full max-w-sm">
              <input
                type="email"
                placeholder="EMAIL"
                required
                className="w-full bg-transparent border-b border-neutral-300 py-2 text-xs sm:text-sm tracking-widest font-light text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition"
              />
              <input
                type="text"
                placeholder="FIRST NAME"
                className="w-full bg-transparent border-b border-neutral-300 py-2 text-xs sm:text-sm tracking-widest font-light text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition"
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="w-full bg-transparent border-b border-neutral-300 py-2 text-xs sm:text-sm tracking-widest font-light text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition"
              />
              <button className="mt-4 flex items-center gap-2 cursor-pointer group bg-transparent border-none p-0 focus:outline-none">
                <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-neutral-900 transition-opacity duration-300 group-hover:opacity-75">
                  SUBSCRIBE
                </span>
                <div className="w-7 h-7 rounded-full border border-neutral-450 flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 sm:mt-16 text-center select-none" style={{ fontFamily: "var(--font-antonio)" }}>
          <h1 className="text-[11vw] sm:text-[12vw] font-light tracking-[0.35em] leading-none text-neutral-950 uppercase">
            CATER
          </h1>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t border-neutral-200/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] sm:text-[10px] tracking-[0.2em] font-light uppercase text-neutral-500">
          <span>CATER © 2026. ALL RIGHTS RESERVED</span>
          <a href="#privacy" className="hover:text-neutral-800 transition">
            PRIVACY NOTICE
          </a>
        </div>

      </div>
    </footer>
  );
}
