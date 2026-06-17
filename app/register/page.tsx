"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  console.log("[CHAOS render] RegisterPage");
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
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-gradient-to-tr from-amber-50/30 via-stone-50/50 to-orange-50/40 dark:from-neutral-950 dark:via-neutral-900/60 dark:to-neutral-950"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-200/20 dark:bg-orange-900/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-200/20 dark:bg-amber-900/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <CookingGifBackdrop stackClass="z-[1]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-neutral-900/75 border border-white/40 dark:border-neutral-800/60 shadow-2xl rounded-2xl p-8 sm:p-10 transition-all duration-300">

          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2 justify-center">
              <ChefLogo size={42} priority />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-black text-3xl tracking-tight">
                Chef
              </span>
            </div>
            <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight text-center">
              Create Account
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 text-center">
              Get started with your culinary assistant
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-6 text-sm font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-neutral-950/40 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm ${fieldErrors.name ? "border-red-400 dark:border-red-900/50" : "border-neutral-200/80 dark:border-neutral-800/80"
                  }`}
                placeholder="Chef Guest"
              />
              {fieldErrors.name?.map((msg) => (
                <p key={msg} className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {msg}
                </p>
              ))}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-neutral-950/40 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm ${fieldErrors.email ? "border-red-400 dark:border-red-900/50" : "border-neutral-200/80 dark:border-neutral-800/80"
                  }`}
                placeholder="you@example.com"
              />
              {fieldErrors.email?.map((msg) => (
                <p key={msg} className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {msg}
                </p>
              ))}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-4 pr-11 py-2.5 rounded-xl border bg-white/50 dark:bg-neutral-950/40 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm ${fieldErrors.password ? "border-red-400 dark:border-red-900/50" : "border-neutral-200/80 dark:border-neutral-800/80"
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 cursor-pointer focus:outline-hidden"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              {fieldErrors.password?.map((msg) => (
                <p key={msg} className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {msg}
                </p>
              ))}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-950/40 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 cursor-pointer focus:outline-hidden"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-orange-500/10 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer flex items-center justify-center text-sm mt-2"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "SIGN UP"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Already have an account?{" "}
              <a href="/login" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Log in
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
