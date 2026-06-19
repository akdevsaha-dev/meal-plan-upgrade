"use client";

import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import CaterLogo from "@/app/components/CaterLogo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <main
      className={`${montserrat.variable} font-sans relative flex min-h-screen items-center justify-center bg-[#FAF9F6] text-[#111111] p-4 sm:p-6 lg:p-8 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[#FAF9F6] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 sm:p-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">

        <div className="flex flex-col items-center gap-2 mb-8 select-none">
          <CaterLogo size={24} href={null} />
          <span className="text-[10px] font-light tracking-[0.4em] uppercase text-neutral-900">
            CATER
          </span>
        </div>

        <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 mb-6 shadow-sm">
          <svg
            className="w-7 h-7 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3 text-center">
          Checkout Cancelled
        </h1>

        <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide text-center mb-8 max-w-xs">
          Your checkout request was cancelled. No transactions or charges were completed.
        </p>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-md active:scale-98 transition-all duration-200 cursor-pointer w-full flex items-center justify-center"
        >
          Return to Settings
        </button>
      </div>
    </main>
  );
}
