import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-montserrat",
});

export default function NotFound() {
  return (
    <div className={`${montserrat.variable} font-sans relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center text-white select-none`}>
      <video
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
        src="/videos/output.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/60 z-10" aria-hidden="true" />
      <div className="relative z-20 text-center max-w-md w-[calc(100%-32px)] border border-white/10 bg-black/45 backdrop-blur-md px-8 py-12 rounded-none shadow-2xl flex flex-col items-center">
        <div className="text-[10px] font-bold tracking-[0.45em] text-[#A94420] uppercase mb-4">
          ERROR CODE 404
        </div>
        <h1 className="text-3xl font-light tracking-[0.18em] uppercase text-white mb-4 leading-tight">
          PAGE NOT <span className="font-semibold text-white/95">FOUND</span>
        </h1>
        <div className="w-12 h-px bg-white/25 my-4" />
        <p className="text-[11px] text-neutral-400 font-light leading-relaxed tracking-widest uppercase mb-10 max-w-xs">
          The page or recipe you are seeking has been moved, scaled, or deleted from our culinary indexes.
        </p>
        <Link
          href="/"
          className="bg-white hover:bg-neutral-200 text-black px-8 py-4 text-[10px] font-bold tracking-[0.25em] uppercase rounded-none transition-colors duration-300 border border-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
