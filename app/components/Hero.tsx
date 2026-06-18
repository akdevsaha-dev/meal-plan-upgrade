import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-montserrat",
});

export const Hero = () => {
  return (
    <section
      className={`${montserrat.variable} relative w-full h-screen overflow-hidden bg-black`}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        src="/videos/output.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <div className="absolute inset-0 bg-black/45 z-10" />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start px-6 sm:px-12 md:px-20 lg:px-32 text-left max-w-6xl">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] text-white uppercase leading-tight font-(family-name:--font-montserrat)">
          Get Meal Plans.
          <br />
          <span className="font-semibold text-white/90">
            Crafted Just For You.
          </span>
        </h1>
      </div>
    </section>
  );
};
