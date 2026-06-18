"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import CaterLogo from "@/app/components/CaterLogo";
import InteractiveVideoCard from "@/app/components/InteractiveVideoCard";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.details) {
          setFieldErrors(data.details);
        } else {
          setError(data.error || "Registration failed");
        }
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/recipes");
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
      {/* Left side: Registration form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between min-h-[620px] lg:h-full py-6 px-4 sm:px-8">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <CaterLogo size={24} />
          <span className="text-xs font-light tracking-[0.4em] uppercase text-neutral-900 select-none">
            CATER
          </span>
        </div>

        {/* Center registration form */}
        <div className="w-full max-w-sm my-auto py-4">
          <h1 className="text-3xl sm:text-4xl font-light tracking-[0.1em] uppercase text-neutral-900 mb-6 select-none">
            Create Account
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-600 p-3.5 rounded-xl mb-5 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="name" className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Full Name
                </label>
                {fieldErrors.name?.[0] && (
                  <span className="text-[10px] font-medium text-red-500 tracking-wider">
                    {fieldErrors.name[0]}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ${
                    fieldErrors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200/80"
                  }`}
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                />
                {fieldErrors.name && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
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
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ${
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

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="password" className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Password
                </label>
                {fieldErrors.password?.[0] && (
                  <span className="text-[10px] font-medium text-red-500 tracking-wider">
                    {fieldErrors.password[0]}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-4 pr-11 py-2.5 bg-white border rounded-xl text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ${
                    fieldErrors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-neutral-200/80"
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="confirmPassword" className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Confirm Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-white border border-neutral-200/80 rounded-xl text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                  placeholder="Re-enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-widest uppercase py-3 px-4 rounded-full shadow-md active:scale-98 disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Brand Footer */}
        <div className="text-xs font-semibold text-neutral-400 select-none">
          Already have an account?{" "}
          <a href="/login" className="text-neutral-900 hover:underline transition-all">
            Log in
          </a>
        </div>

      </div>

      {/* Right side: Interactive video container */}
      <div className="hidden lg:block lg:w-[55%] h-full relative">
        <InteractiveVideoCard />
      </div>
    </main>
  );
}
