"use client";

import Link from "next/link";
import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useEffect, useState } from "react";

const JUNK_ORB_COUNT = 52;

export default function Home() {
  console.log("[CHAOS render] Home");
  const [tick, setTick] = useState(0);
  const [tickB, setTickB] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const a = window.setInterval(() => setTick((t) => t + 1), 28);
    const b = window.setInterval(() => setTickB((t) => t + 1), 41);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);

  return (
    <div
      className="landing-root relative min-h-screen overflow-x-hidden text-gray-100 font-sans"
      style={{
        background:
          "linear-gradient(160deg, #090514 0%, #12072b 25%, #1d0b45 45%, #2a085c 70%, #0d051c 100%)",
        boxShadow: "inset 0 0 120px rgba(124, 58, 237, 0.3)",
      }}
    >
      {/* Dynamic background lighting */}
      <div
        className="landing-blur-layer pointer-events-none fixed inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[4] opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 10%, rgba(124, 58, 237, 0.15), transparent 60%), radial-gradient(ellipse 50% 50% at 90% 80%, rgba(249, 115, 22, 0.05), transparent 50%)",
        }}
        aria-hidden
      />

      <CookingGifBackdrop stackClass="z-[6]" />

      {mounted && Array.from({ length: JUNK_ORB_COUNT }, (_, i) => (
        <span
          key={i}
          className="pointer-events-none fixed z-[3] rounded-full"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            left: `${(50 + Math.sin(tick * 0.05 + i * 0.9) * 45).toFixed(2)}%`,
            top: `${(50 + Math.cos(tickB * 0.04 + i * 0.73) * 45).toFixed(2)}%`,
            background: i % 2 === 0 ? "rgba(249, 115, 22, 0.4)" : "rgba(167, 139, 250, 0.4)",
            boxShadow: `0 0 ${6 + (i % 3) * 4}px ${i % 2 === 0 ? "rgba(249, 115, 22, 0.6)" : "rgba(167, 139, 250, 0.6)"}`,
            transform: `rotate(${tick * 0.5 + i * 10}deg)`,
            willChange: "left, top, transform",
          }}
          aria-hidden
        />
      ))}

      {/* Header Nav */}
      <header
        className="relative z-10 flex items-center justify-between gap-4 px-6 py-5 md:px-12 border-b border-white/5 backdrop-blur-md bg-black/10"
      >
        <div className="flex items-center gap-3">
          <span className="landing-orbit inline-flex">
            <ChefLogo size={40} href={null} priority />
          </span>
          <span
            className="landing-title-glow font-extrabold uppercase tracking-wider text-xl md:text-2xl bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent"
          >
            ChefAI
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <a
            href="#features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </a>
          {isLoggedIn ? (
            <Link
              href="/recipes"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 font-bold"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Hero & Sections */}
      <main className="relative z-10 px-6 pb-24 pt-16 md:px-12 max-w-7xl mx-auto">
        <section className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-orange-300 mb-6 backdrop-blur-lg">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            AI-Driven Culinary Experience
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-white">
            Plan Meals. Generate Recipes.{" "}
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500 bg-clip-text text-transparent">
              Cook Smart.
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Take the hassle out of meal prep. Create automated weekly schedules, search a premium recipe catalog, and chat with your personal AI chef to cook with what you have.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/recipes"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all text-center"
              >
                Go to Recipes Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all text-center"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-base font-bold transition-all text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Dynamic Glassmorphic Visual Section */}
        <section className="mb-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-violet-500/10 blur-3xl -z-10 rounded-3xl"></div>
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-12 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 block">Interactive Planner</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                  Streamlined Weekly Schedules
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Plan your breakfast, lunch, and dinner calendar with a few clicks. Track nutritional estimates, custom prep instructions, and instantly synchronize with ingredients.
                </p>
                <ul className="space-y-4">
                  {[
                    "Customized daily schedules",
                    "Automated calorie & prep time aggregation",
                    "Add custom recipes directly to any day"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-orange-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock UI Showcase */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500/80"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Weekly Planner Preview</span>
                </div>
                <div className="space-y-3">
                  {[
                    { day: "Monday", meal: "Breakfast: Blueberry Oat Pancakes", type: "Vegetarian", time: "15 min" },
                    { day: "Tuesday", meal: "Lunch: Honey-Mustard Salmon Salad", type: "Gluten-Free", time: "20 min" },
                    { day: "Wednesday", meal: "Dinner: Creamy Mushroom Risotto", type: "Pro Recipe", time: "35 min" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-0.5">{item.day}</span>
                        <span className="text-sm font-semibold text-white">{item.meal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-md border border-white/5 font-semibold block mb-1">{item.type}</span>
                        <span className="text-[10px] text-gray-500 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase Section */}
        <section id="features" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Everything You Need To Master Meal Planning
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Equipped with smart tools and conversational AI, planning your meals has never been this intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Recipe Bot Chat",
                desc: "Describe what's in your fridge or specify your dietary constraints. Get instant custom recipes cooked up by AI.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )
              },
              {
                title: "Integrated Vault",
                desc: "Keep a searchable history of all your favorite meals. Filter by tags, preparation times, or calories.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-rose-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.597 18.722a10.025 10.025 0 003.83-4.253m-2.148-3.007A5.964 5.964 0 0012 9.75a5.964 5.964 0 00-7.279 5.712m0 0a8.997 8.997 0 007.279 3.288m0 0a8.997 8.997 0 007.279-3.288m-7.279 3.288V11.25M12 9.75V3" />
                  </svg>
                )
              },
              {
                title: "Premium Pro Benefits",
                desc: "Unlock custom schedules, advanced AI chat configurations, and dedicated database space for large recipe libraries.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-violet-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.172-.375.696-.375.868 0l1.838 3.722 4.108.597c.413.06.578.568.278.868l-2.973 2.899.702 4.092c.07.41-.358.72-.731.527L12 14.24l-3.673 1.932c-.373.193-.8-.117-.731-.527l.702-4.092-2.973-2.899c-.3-.3-.135-.808.278-.868l4.108-.597 1.838-3.722z" />
                  </svg>
                )
              }
            ].map((feat, idx) => (
              <div
                key={idx}
                className="landing-card-rave bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-8 hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing / Plan Section */}
        <section id="pricing" className="mb-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Simple, Transparent Plans
            </h2>
            <p className="text-gray-400">
              Start planning your meals today. Cancel or upgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-300 mb-2">Free Plan</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-gray-500 text-sm">/ forever</span>
                </div>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  Excellent for starting out with weekly planner structure and manual recipe cataloging.
                </p>
                <ul className="space-y-4 mb-8">
                  {["Standard Weekly Planner", "Save up to 10 Custom Recipes", "Community Support"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-orange-500/10 to-violet-500/10 border-2 border-orange-500/30 rounded-3xl p-8 flex flex-col justify-between relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-orange-400 mb-2">Pro Plan</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">$9.99</span>
                  <span className="text-gray-500 text-sm">/ month</span>
                </div>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  For home chefs who want the best AI integrations and unlimited recipe creation.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Free Plan",
                    "Unlimited Saved Recipes",
                    "AI Recipe Bot Chat Generation",
                    "Ad-free Experience",
                    "Priority Premium Support"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-orange-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-500/20"
              >
                Go Pro Now
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="relative z-10 max-w-4xl mx-auto rounded-3xl border border-white/5 bg-white/[0.01] p-8 md:p-12 text-center backdrop-blur-sm">
          <blockquote className="relative z-10 italic text-lg text-gray-300 mb-6">
            &ldquo;ChefAI completely changed how my family handles dinnertime. I just describe the ingredients we have, and it crafts healthy, tailored recipes that everyone loves.&rdquo;
          </blockquote>
          <span className="block font-bold text-sm text-orange-400 uppercase tracking-wider">— Sarah M., Verified Home Cook</span>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-12 px-6 md:px-12 text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ChefLogo size={20} href={null} />
            <span className="font-bold text-gray-400 uppercase tracking-wider">ChefAI</span>
          </div>
          <div className="flex gap-8">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/login" className="hover:text-white transition-colors">Login</a>
          </div>
          <span>© {new Date().getFullYear()} ChefAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
