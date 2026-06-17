"use client";

import ChefLogo from "@/app/components/ChefLogo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  console.log("[CHAOS render] Navbar");
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; plan: string; hasProAccess?: boolean } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    const token = localStorage.getItem("token");
    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error("Fetch failed");
        return r.json();
      })
      .then((data) => {
        if (data.user) {
          const profile = {
            name: data.user.name,
            email: data.user.email,
            plan: data.user.plan,
            hasProAccess: data.user.hasProAccess,
          };
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      })
      .catch((err) => {
        console.error("Failed to refresh user info:", err);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const userInitials = user?.name
    ? user.name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "U";

  const navItems = [
    { name: "Recipes", href: "/recipes" },
    { name: "Chef Ferraro", href: "/chat" },
    { name: "Meal Plans", href: "/meal-plans" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-xs px-8 py-3.5 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <ChefLogo size={34} />
        <Link
          href="/recipes"
          className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-black text-2xl tracking-tight hover:opacity-90 transition-opacity"
        >
          Chef
        </Link>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-all relative py-1.5 duration-200 hover:text-orange-600 ${isActive ? "text-orange-600" : "text-gray-500"
                  }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </Link>
            );
          })}

          <Link
            href="/settings"
            className={`text-sm font-semibold transition-all relative py-1.5 duration-200 hover:text-orange-600 ${pathname === "/settings" ? "text-orange-600" : "text-amber-600"
              }`}
          >
            Settings
            {pathname === "/settings" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
            )}
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
            aria-label="User menu"
          >
            {userInitials}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3.5 w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 py-3 text-left animate-in fade-in slide-in-from-top-2 duration-150 ease-out">
              <div className="px-4.5 py-2.5 border-b border-gray-50 pb-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Account</p>
                <p className="font-bold text-gray-800 text-sm mt-1.5 truncate">{user?.name || "Premium Chef"}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || "loading account..."}</p>
              </div>

              <div className="px-4.5 py-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${user?.hasProAccess
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user?.hasProAccess
                    ? "bg-amber-500 animate-pulse"
                    : "bg-gray-400"
                    }`} />
                  {user?.hasProAccess ? "Pro" : "Free"} Plan
                </span>
              </div>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-4.5 py-2.5 text-sm text-red-600 hover:bg-red-50/50 font-bold transition-colors disabled:opacity-50 text-left cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

