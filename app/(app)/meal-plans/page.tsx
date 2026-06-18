"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { MealPlansSkeleton } from "@/app/components/Skeletons";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFutureDateString(baseDateStr: string, days: number) {
  if (!baseDateStr) return "";
  const d = new Date(baseDateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface MealPlanRecipe {
  id: string;
  day: string;
  mealType: string;
  recipe: { id: string; title: string; imageUrl: string };
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  recipes: MealPlanRecipe[];
}

export default function MealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(() => getTodayString());
  const [endDate, setEndDate] = useState(() => getFutureDateString(getTodayString(), 7));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const res = await fetch("/api/meal-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMealPlans(data.mealPlans || []);
    } catch (err) {
      console.error("Failed to fetch meal plans:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateMealPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create meal plan");
      }

      setName("");
      setStartDate(getTodayString());
      setEndDate(getFutureDateString(getTodayString(), 7));
      setIsModalOpen(false);
      await fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to create meal plan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#FAF9F6] text-[#111111]`}>
      <div className="mx-auto max-w-[1600px] px-6 sm:px-12 md:px-16 lg:px-20 pt-4 lg:pt-6 pb-12 lg:pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-900/10 pb-4 mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.25em] uppercase text-neutral-900">
              MEAL PLANS
            </h1>
            <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase mt-2">
              Curated Weekly Schedules & Culinary Agendas
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#FAF9F6] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer self-start sm:self-center border border-neutral-900 shadow-xs hover:shadow-md"
          >
            + CREATE NEW PLAN
          </button>
        </div>

        {isLoading ? (
          <MealPlansSkeleton />
        ) : mealPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-neutral-200 rounded-xl text-center max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full border border-neutral-300 text-neutral-800 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.2em] mb-2">No Meal Plans Found</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-8 font-medium">
              Start organizing your culinary calendar. Establish a custom meal plan schedule to begin.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-neutral-900 cursor-pointer shadow-xs hover:shadow-md"
            >
              CREATE YOUR FIRST PLAN
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-neutral-200/60 rounded-xl flex flex-col h-full hover:border-neutral-900 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="p-8 flex flex-col grow text-left justify-between">
                  <div>
                    {/* Card Top / Header */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div>
                        <Link href={`/meal-plans/${plan.id}`}>
                          <h3 className="text-base font-bold text-neutral-900 hover:text-neutral-500 tracking-wider transition-colors uppercase line-clamp-1">
                            {plan.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
                          </svg>
                          <span>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[9px] font-extrabold text-[#A94420] tracking-[0.2em] bg-[#A94420]/5 px-3 py-1.5 border border-[#A94420]/15 rounded-md uppercase">
                        {plan.recipes ? plan.recipes.length : 0} MEALS
                      </span>
                    </div>

                    {/* Previews / Thumbnails Stack */}
                    {plan.recipes && plan.recipes.length > 0 ? (
                      <div className="mt-4 mb-6">
                        <div className="text-[9px] font-bold text-neutral-400 tracking-[0.2em] uppercase mb-3">
                          Scheduled Previews:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {plan.recipes.slice(0, 5).map((r) => (
                            <div
                              key={r.id}
                              className="relative group/thumb w-12 h-12 border border-neutral-200 rounded-md overflow-hidden bg-neutral-50"
                              title={`${r.day.toUpperCase()} • ${r.mealType.toUpperCase()} — ${r.recipe.title}`}
                            >
                              <img
                                src={r.recipe.imageUrl || "/images/recipes/classic-pancakes.jpg"}
                                alt={r.recipe.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                              />
                            </div>
                          ))}
                          {plan.recipes.length > 5 && (
                            <div className="w-12 h-12 border border-dashed border-neutral-300 rounded-md flex items-center justify-center text-[10px] font-bold text-neutral-400 bg-neutral-50/50">
                              +{plan.recipes.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="my-8 border border-dashed border-neutral-200 rounded-lg p-4 text-center text-[10px] text-neutral-400 font-bold tracking-[0.15em] bg-neutral-50/50 uppercase">
                        No meals scheduled yet
                      </div>
                    )}
                  </div>

                  {/* Footer / Actions */}
                  <div className="border-t border-neutral-100 pt-6 mt-4 flex items-center justify-between">
                    <Link
                      href={`/meal-plans/${plan.id}`}
                      className="text-[10px] font-bold tracking-[0.25em] text-neutral-900 hover:text-neutral-500 uppercase flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-300"
                    >
                      VIEW DETAILS &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Elegant Modal for Create Meal Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <form
            onSubmit={handleCreateMealPlan}
            method="POST"
            className="relative z-10 w-full max-w-md bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2">
                Create a New Meal Plan
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Set up a new scheduling timeline to add recipes and custom daily menus.
              </p>
            </div>

            <div className="space-y-6 text-left py-2">
              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                  PLAN NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. WEEKLY HARVEST"
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 placeholder-neutral-300 uppercase tracking-widest focus:outline-none py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                  <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                    START DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={getTodayString()}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartDate(newStart);
                      setEndDate(getFutureDateString(newStart, 7));
                    }}
                    className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5"
                  />
                </div>

                <div className="flex flex-col border-b border-neutral-300 py-1 opacity-70">
                  <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                    END DATE
                  </label>
                  <input
                    type="date"
                    required
                    disabled
                    value={endDate}
                    className="w-full bg-transparent text-xs font-semibold text-neutral-400 focus:outline-none py-1.5 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="order-2 sm:order-1 px-6 py-3.5 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="order-1 sm:order-2 bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-neutral-900 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting ? "CREATING..." : "CREATE PLAN"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
