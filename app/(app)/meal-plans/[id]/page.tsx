"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

interface MealPlanRecipe {
  id: string;
  day: string;
  mealType: string;
  recipe: {
    id: string;
    title: string;
    imageUrl: string;
    ingredients: { name: string; amount: string; unit: string }[];
  };
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  recipes: MealPlanRecipe[];
}

interface RecipeOption {
  id: string;
  title: string;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

export default function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/meal-plans/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMealPlan(data.mealPlan));

    fetch("/api/recipes", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        const recipesList = data.recipes || [];
        setRecipes(recipesList);
        if (recipesList.length > 0) setSelectedRecipeId(recipesList[0].id);
      })
      .catch((err) => {
        console.error(err);
        setRecipes([]);
      });
  }, [id]);

  async function handleAddRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecipeId) {
      alert("Please select a recipe.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/meal-plans/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day: selectedDay,
          mealType: selectedMealType,
          recipeId: selectedRecipeId,
        }),
      });

      if (res.ok) {
        const updated = await fetch(`/api/meal-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await updated.json();
        setMealPlan(data.mealPlan);
        setIsAddPanelOpen(false);
      } else {
        alert("Failed to add recipe.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding recipe.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveRecipe(mealPlanRecipeId: string) {
    const confirmRemove = window.confirm("Remove this recipe from the meal plan?");
    if (!confirmRemove) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/meal-plans/${id}?mealPlanRecipeId=${mealPlanRecipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updated = await fetch(`/api/meal-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await updated.json();
        setMealPlan(data.mealPlan);
      } else {
        alert("Failed to remove recipe.");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing recipe.");
    }
  }

  const handleOpenAddPanelForSlot = (day: string, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setIsAddPanelOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!mealPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
          <p className="text-neutral-400 text-[10px] font-bold tracking-[0.2em] uppercase">Loading planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#FAF9F6] text-[#111111]`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-12 md:px-16 lg:px-24 pt-4 lg:pt-6 pb-12 lg:pb-16">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 mb-6 uppercase tracking-[0.2em]">
          <Link href="/meal-plans" className="hover:text-neutral-950 transition-colors">
            MEAL PLANS
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900">{mealPlan.name}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-900/10 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.2em] uppercase text-neutral-900">
              {mealPlan.name}
            </h1>
            <p className="text-[10px] font-bold text-[#A94420] tracking-[0.2em] uppercase mt-2">
              {formatDate(mealPlan.startDate)} – {formatDate(mealPlan.endDate)}
            </p>
          </div>
          <button
            onClick={() => setIsAddPanelOpen(!isAddPanelOpen)}
            className="rounded-none bg-neutral-900 hover:bg-neutral-800 text-[#FAF9F6] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer self-start md:self-center border border-neutral-900 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD RECIPE
          </button>
        </div>

        {/* Dropdown Add Meal Panel */}
        {isAddPanelOpen && (
          <form
            onSubmit={handleAddRecipe}
            method="POST"
            className="bg-white border border-neutral-200 p-6 md:p-8 rounded-none mb-8 animate-in slide-in-from-top-4 duration-200 ease-out space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-1">
                Add Recipe to Plan
              </h3>
              <p className="text-[10px] font-bold text-neutral-450 uppercase tracking-[0.15em]">
                Select the day, meal category, and target culinary masterpiece.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                  DAY OF THE WEEK
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                  MEAL CATEGORY
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                  CHOOSE RECIPE
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPanelOpen(false)}
                className="px-6 py-3 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-none transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-neutral-900 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "ADDING..." : "ADD TO PLAN"}
              </button>
            </div>
          </form>
        )}

        {/* Weekly Grid Planner Spread */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-white border border-neutral-200/60 p-4 rounded-none h-fit space-y-5 flex flex-col hover:border-neutral-900 transition-all duration-300 shadow-xs"
            >
              <h3 className="text-xs font-extrabold text-neutral-900 border-b border-neutral-100 pb-2 uppercase tracking-[0.2em]">
                {day}
              </h3>

              <div className="space-y-5">
                {MEAL_TYPES.map((meal) => {
                  const items = mealPlan.recipes.filter(
                    (r) => r.day === day && r.mealType === meal
                  );
                  return (
                    <div key={meal} className="space-y-2">
                      <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.25em] block mb-1">
                        {meal}
                      </span>

                      {items.length === 0 ? (
                        <div
                          onClick={() => handleOpenAddPanelForSlot(day, meal)}
                          className="border border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50 rounded-none py-4 text-center text-[9px] text-neutral-300 hover:text-neutral-500 font-bold uppercase tracking-[0.15em] cursor-pointer transition-all duration-200"
                        >
                          + ADD MEAL
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="group/item flex flex-col bg-white border border-neutral-200 rounded-none overflow-hidden hover:border-neutral-900 transition-all duration-300 shadow-2xs relative"
                            >
                              {/* Image header with hover controls */}
                              <div className="relative aspect-16/10 w-full overflow-hidden border-b border-neutral-100 bg-neutral-50">
                                <img
                                  src={item.recipe.imageUrl || "/images/recipes/classic-pancakes.jpg"}
                                  alt={item.recipe.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                                />
                                <button
                                  onClick={() => handleRemoveRecipe(item.id)}
                                  className="absolute top-1.5 right-1.5 opacity-0 group-hover/item:opacity-100 bg-neutral-950/70 hover:bg-rose-700 text-white p-1.5 transition-all duration-200 cursor-pointer shadow-xs border border-white/10"
                                  title="Remove meal"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              {/* Recipe text link */}
                              <div className="p-2.5 text-left">
                                <Link
                                  href={`/recipes/${item.recipe.id}`}
                                  className="text-[10px] font-bold text-neutral-900 hover:text-[#A94420] transition-colors line-clamp-2 uppercase tracking-wide leading-tight"
                                >
                                  {item.recipe.title}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
