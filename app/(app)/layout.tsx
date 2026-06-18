"use client";

import AppNavbar from "@/app/components/AppNavbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import ChefLogo from "@/app/components/ChefLogo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowLoader(true);
    }, 300);

    const token = localStorage.getItem("token");
    if (!token) {
      clearTimeout(loaderTimer);
      router.push("/login");
    } else {
      clearTimeout(loaderTimer);
      setAuthorized(true);
    }

    return () => clearTimeout(loaderTimer);
  }, [router]);


  if (!authorized) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] ${montserrat.variable} font-sans`}>
        {showLoader && (
          <div className="flex flex-col items-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-16 h-16 rounded-full border border-neutral-300/60 animate-ping opacity-25" />
              <div className="relative p-4 bg-white border border-neutral-200/60 rounded-full shadow-md flex items-center justify-center">
                <ChefLogo size={40} priority href={null} className="animate-pulse" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-neutral-400 tracking-[0.3em] uppercase select-none animate-pulse">
              Verifying Session
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
      <AppNavbar />
      <main className="min-h-0 flex-1 pt-20">{children}</main>
    </div>
  );
}
