"use client";

import { useEffect, useState, Suspense } from "react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import CaterLogo from "@/app/components/CaterLogo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

function SuccessContent() {
  const [status, setStatus] = useState<"verifying" | "success" | "delayed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("Not authenticated. Please log in.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;
    let timeoutId: NodeJS.Timeout;

    async function checkPlan() {
      try {
        const res = await fetch("/api/stripe/checkout-session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to check subscription status");
        }
        const data = await res.json();
        if (data.success && data.user && data.user.hasProAccess) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setStatus("success");
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus("delayed");
          } else {
            timeoutId = setTimeout(checkPlan, 1500);
          }
        }
      } catch (err: any) {
        console.error("[Checkout Success] Verification polling error:", err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred.");
      }
    }

    checkPlan();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 sm:p-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Cater Brand Header */}
      <div className="flex flex-col items-center gap-2 mb-8 select-none">
        <CaterLogo size={24} href={null} />
        <span className="text-[10px] font-light tracking-[0.4em] uppercase text-neutral-900">
          CATER
        </span>
      </div>

      {status === "verifying" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6 shadow-sm">
            <svg className="animate-spin h-6 w-6 text-black" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3">
            Upgrading Account
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide max-w-xs">
            We are confirming your payment and upgrading your credentials. This will only take a moment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-900 mb-6 shadow-sm">
            <svg
              className="w-7 h-7 text-neutral-900 animate-in zoom-in duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3">
            Payment Successful
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide max-w-xs mb-8">
            Welcome to Pro! Your account has been upgraded successfully. You now have full access to all recipes and meal planning features.
          </p>
          
          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-md active:scale-98 transition-all duration-200 cursor-pointer w-full flex items-center justify-center"
          >
            Go to Recipes
          </button>
        </div>
      )}

      {status === "delayed" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-500 mb-6 shadow-sm">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3">
            Syncing Subscription
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide max-w-xs mb-8">
            Your payment succeeded, but your user profile is taking a moment to update. You can continue, and the upgrade will reflect shortly.
          </p>
          
          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-md active:scale-98 transition-all duration-200 cursor-pointer w-full flex items-center justify-center"
          >
            Go to Recipes
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center text-center w-full">
          <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 mb-6 shadow-sm">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3">
            Verification Issue
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide max-w-xs mb-8">
            {errorMessage}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3.5 px-6 rounded-full shadow-md active:scale-98 transition-all duration-200 cursor-pointer flex-1 flex items-center justify-center"
            >
              Go to Settings
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80 font-medium text-xs tracking-widest uppercase py-3.5 px-6 rounded-full active:scale-98 transition-all duration-200 cursor-pointer flex-1 flex items-center justify-center"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main
      className={`${montserrat.variable} font-sans relative flex min-h-screen items-center justify-center bg-[#FAF9F6] text-[#111111] p-4 sm:p-6 lg:p-8 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[#FAF9F6] z-0 pointer-events-none" />
      
      <Suspense
        fallback={
          <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 sm:p-12 flex flex-col items-center">
            <div className="flex flex-col items-center gap-2 mb-8 select-none">
              <CaterLogo size={24} href={null} />
              <span className="text-[10px] font-light tracking-[0.4em] uppercase text-neutral-900">
                CATER
              </span>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6 shadow-sm">
              <svg className="animate-spin h-6 w-6 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light tracking-widest uppercase text-neutral-900 mb-3">
              Loading
            </h1>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
