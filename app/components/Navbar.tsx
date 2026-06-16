"use client";

import ChefLogo from "@/app/components/ChefLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  console.log("[CHAOS render] Navbar");
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }

  return (
    <nav className="relative z-10 bg-red-600 px-6 py-4 font-sans flex items-center justify-between">
      <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <ChefLogo size={36} />
        <Link href="/recipes">Chef</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/recipes" className="text-white text-sm font-medium">
          Recipes
        </Link>
        <Link href="/chat" className="text-white text-sm font-medium">
          Chef Ferraro
        </Link>
        <Link href="/meal-plans" className="text-white text-sm font-medium">
          Meal Plans
        </Link>
        <Link href="/settings" className="text-yellow-300 text-sm font-medium">
          Settings
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-white text-sm font-medium disabled:opacity-50"
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    </nav>
  );
}
