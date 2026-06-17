"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState, useEffect } from "react";
import Link from "next/link";

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
  console.log("[CHAOS render] MealPlansPage");
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/meal-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMealPlans(data.mealPlans || []);
    } catch (err) {
      console.error("Failed to fetch meal plans:", err);
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
      setStartDate("");
      setEndDate("");
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
    <div className="relative min-h-screen bg-linear-to-b from-white to-gray-50/70 font-sans text-gray-900">
      <div
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />

      <div className="relative z-10 p-6 lg:p-12 max-w-5xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 mb-10 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
              <ChefLogo size={36} />
              Meal Plans
            </h1>
            <p className="text-sm font-semibold text-gray-600 mt-2 leading-relaxed">
              Create and track your weekly meal schedules.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-center bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Create New Plan
          </button>
        </div>

        {mealPlans.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xs max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No meal plans found</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">Get started by setting up a fresh meal schedule for the week.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs cursor-pointer"
            >
              Create Your First Plan
            </button>
          </div>
        )}

        {mealPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/meal-plans/${plan.id}`}
                className="group bg-white border border-gray-100 hover:border-gray-200/80 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-150">
                    {plan.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                    <span>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span>
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-50 pt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    {plan.recipes ? plan.recipes.length : 0} Meals Planned
                  </span>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-150 flex items-center gap-0.5">
                    View details
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-950/20 backdrop-blur-xs transition-opacity"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />

            <form
              onSubmit={handleCreateMealPlan}
              className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 ease-out z-10"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Meal Plan</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Set up a new plan template for details additions.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Weekly Plan Name"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
