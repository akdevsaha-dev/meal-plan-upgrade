"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import CaterLogo from "@/app/components/CaterLogo";
import InteractiveVideoCard from "@/app/components/InteractiveVideoCard";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!email) {
      errors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = ["Must be a valid email address"];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.details) {
          setFieldErrors(data.details);
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className={`${montserrat.variable} font-sans flex flex-col lg:flex-row w-full min-h-screen lg:h-screen bg-[#FAF9F6] text-[#111111] p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden`}
    >
      <div className="w-full lg:w-[45%] flex flex-col justify-between min-h-[500px] lg:h-full py-8 px-4 sm:px-8">
        
        <Link href="/" className="flex items-center gap-2 select-none">
          <CaterLogo size={24} href={null} />
          <span className="text-xs font-light tracking-[0.4em] uppercase text-neutral-900 select-none">
            CATER
          </span>
        </Link>

        <div className="w-full max-w-sm my-auto">
          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 mb-6">
                <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-light tracking-widest uppercase text-neutral-900 select-none">
                Check Email
              </h1>
              
              <p className="text-sm text-neutral-500 leading-relaxed font-light tracking-wide">
                If that email address exists, we have sent a secure link to reset your password. Please check your inbox and spam folder.
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3 px-8 rounded-full shadow-md active:scale-98 transition-all duration-200 cursor-pointer w-full flex items-center justify-center"
              >
                Back to Sign in
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase text-neutral-900 mb-2 select-none">
                Reset Password
              </h1>
              <p className="text-xs text-neutral-400 font-medium tracking-wide mb-8">
                Enter your email address to receive a secure password reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200/60 text-red-600 p-3.5 rounded-xl mb-6 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} method="POST" noValidate className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label htmlFor="email" className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                      Email address
                    </label>
                    {fieldErrors.email?.[0] && (
                      <span className="text-[10px] font-medium text-red-500 tracking-wider">
                        {fieldErrors.email[0]}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ${
                        fieldErrors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200/80"
                      }`}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                    {fieldErrors.email && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3 px-8 rounded-full shadow-md active:scale-98 disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center justify-center min-w-32"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      "Send Link"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-neutral-400 select-none">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-neutral-900 hover:underline transition-all">
            Sign up
          </a>
        </div>
      </div>

      <div className="hidden lg:block lg:w-[55%] h-full relative">
        <InteractiveVideoCard />
      </div>
    </main>
  );
}
