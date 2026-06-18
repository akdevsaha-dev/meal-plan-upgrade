"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import CaterLogo from "@/app/components/CaterLogo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
});

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  hasProAccess?: boolean;
}

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("Failed to fetch current user profile:", err));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function getInitials() {
    if (!user || !user.name) return "U";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  const navLinks = [
    { name: "Recipes", href: "/recipes" },
    { name: "Chef Ferraro", href: "/chat" },
    { name: "Meal Planner", href: "/meal-plans" },
  ];

  return (
    <header
      className={`${montserrat.variable} font-sans fixed top-0 left-0 right-0 z-40 h-20 bg-[#FAF9F6]/85 backdrop-blur-md border-b border-neutral-200/40 text-[#111111] transition-all duration-300`}
    >
      <div className="h-full px-6 sm:px-12 md:px-16 lg:px-24 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <CaterLogo size={24} className="text-[#111111]" />
          <Link
            href="/"
            className="text-xs font-light tracking-[0.45em] uppercase text-neutral-900 select-none hover:opacity-85 transition-opacity"
          >
            CATER
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2.5 transition-all duration-300 hover:text-black cursor-pointer group ${isActive ? "text-black font-extrabold" : "text-neutral-500"
                  }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-neutral-900 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="relative flex items-center">
          <button
            ref={buttonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center focus:outline-none cursor-pointer group relative"
            aria-label="Toggle user menu"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 text-white font-semibold text-xs tracking-wider flex items-center justify-center shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all">
              {getInitials()}
            </div>
            <span className="absolute -inset-1 rounded-full border border-orange-500/0 group-hover:border-orange-500/20 transition-all duration-300 pointer-events-none" />
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 p-5 origin-top-right animate-in fade-in slide-in-from-top-3 duration-250 ease-out z-50 text-left"
            >
              <div className="pb-4 border-b border-neutral-100">
                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  Logged In As
                </div>
                <div className="mt-2 font-bold text-neutral-800 text-base leading-tight truncate">
                  {user?.name || "Premium User"}
                </div>
                <div className="text-xs text-neutral-500 truncate mt-0.5 font-medium">
                  {user?.email || "user@cater.com"}
                </div>

                <div className="mt-3.5 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Plan Status
                  </span>
                  <div className="flex items-center">
                    {user?.hasProAccess ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        PRO ACCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        FREE PLAN
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:hidden py-3 border-b border-neutral-100 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isActive
                        ? "bg-neutral-50 text-black font-extrabold"
                        : "text-neutral-500 hover:text-black hover:bg-neutral-50/50"
                        }`}
                    >
                      {link.name}
                      <svg
                        className="w-3.5 h-3.5 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3.5 flex flex-col gap-1.5">
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all uppercase"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.99l1.005.831a1.125 1.125 0 01.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.831a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Account Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-all uppercase text-left cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-rose-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
