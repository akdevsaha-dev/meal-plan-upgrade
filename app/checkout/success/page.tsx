"use client";

import { useEffect, useState, Suspense } from "react";
import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";

function SuccessContent() {
  const [status, setStatus] = useState<"verifying" | "success" | "delayed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="relative z-10 text-center max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-green-100 shadow-2xl">
      <div className="flex justify-center mb-6">
        <ChefLogo size={56} priority />
      </div>

      {status === "verifying" && (
        <div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Upgrading Account...</h1>
          <p className="text-gray-600 text-sm">
            We are confirming your payment and upgrading your account. This will only take a moment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div>
          <h1 className="text-3xl font-extrabold text-green-700 mb-4 animate-bounce">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6 font-medium">
            Welcome to Pro! Your account has been upgraded successfully.
          </p>
          <a
            href="/recipes"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
          >
            Go to Recipes
          </a>
        </div>
      )}

      {status === "delayed" && (
        <div>
          <h1 className="text-2xl font-bold text-amber-600 mb-4">
            Upgrade Processing
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            Your payment went through, but your subscription is still syncing. You can explore recipes and your account will reflect the upgrade shortly.
          </p>
          <a
            href="/recipes"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md text-sm"
          >
            Go to Recipes
          </a>
        </div>
      )}

      {status === "error" && (
        <div>
          <h1 className="text-3xl font-extrabold text-red-600 mb-4">
            Verification Issue
          </h1>
          <p className="text-gray-600 mb-6 font-medium text-sm">
            {errorMessage}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/settings"
              className="bg-gray-800 hover:bg-gray-950 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
            >
              Go to Settings
            </a>
            <button
              onClick={() => window.location.reload()}
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-2.5 rounded-xl font-bold transition-all text-sm cursor-pointer"
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
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 z-0 bg-green-50" aria-hidden />
      <CookingGifBackdrop stackClass="z-[1]" />
      <Suspense fallback={
        <div className="relative z-10 text-center max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-green-100 shadow-2xl">
          <div className="flex justify-center mb-6">
            <ChefLogo size={56} priority />
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
