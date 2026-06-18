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

  const [activeDay, setActiveDay] = useState("monday");

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

    if (mealPlan) {
      const isAlreadyScheduled = mealPlan.recipes.some(
        (r) => r.day === selectedDay && r.mealType === selectedMealType && r.recipe.id === selectedRecipeId
      );
      if (isAlreadyScheduled) {
        setIsDuplicateModalOpen(true);
        return;
      }
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

  function handleRemoveRecipe(mealPlanRecipeId: string) {
    setDeleteTargetId(mealPlanRecipeId);
  }

  async function executeRemoveRecipe(mealPlanRecipeId: string) {
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

  const getDayRecipes = (dayName: string) => {
    return mealPlan.recipes.filter((r) => r.day === dayName);
  };

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#FAF9F6] text-[#111111]`}>
      <div className="mx-auto max-w-[1600px] px-6 sm:px-12 md:px-16 lg:px-20 pt-4 lg:pt-6 pb-12 lg:pb-16">

        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 mb-6 uppercase tracking-[0.2em]">
          <Link href="/meal-plans" className="hover:text-neutral-950 transition-colors">
            MEAL PLANS
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900">{mealPlan.name}</span>
        </div>

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
            className="rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#FAF9F6] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer self-start md:self-center border border-neutral-900 flex items-center gap-2 shadow-xs hover:shadow-md"
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
            className="bg-white border border-neutral-200 p-6 md:p-8 rounded-xl mb-8 animate-in slide-in-from-top-4 duration-200 ease-out space-y-6 shadow-sm"
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
                <label className="text-[9px] font-extrabold text-neutral-450 uppercase tracking-[0.2em] mb-1">
                  DAY OF THE WEEK
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer rounded-md"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-450 uppercase tracking-[0.2em] mb-1">
                  MEAL CATEGORY
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer rounded-md"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-neutral-900 transition-colors">
                <label className="text-[9px] font-extrabold text-neutral-450 uppercase tracking-[0.2em] mb-1">
                  CHOOSE RECIPE
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none py-1.5 uppercase tracking-wider cursor-pointer rounded-md"
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
                className="px-6 py-3 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-neutral-900 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? "ADDING..." : "ADD TO PLAN"}
              </button>
            </div>
          </form>
        )}

        {/* Dashboard Split Screen Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

          <div className="lg:col-span-4 mb-8 lg:mb-0">
            <h2 className="hidden lg:block text-xs font-bold text-neutral-400 tracking-[0.25em] uppercase mb-4 pl-1">
              Weekly Overview
            </h2>

            <div className="flex overflow-x-auto lg:overflow-x-visible lg:flex-col gap-3 pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory">
              {DAYS.map((day) => {
                const dayRecipes = getDayRecipes(day);
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`flex-none w-[180px] lg:w-full snap-start text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-white border-neutral-900 shadow-md translate-x-0.5"
                      : "bg-white/50 border-neutral-200 hover:border-neutral-400 hover:bg-white/80"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-extrabold text-neutral-900 uppercase tracking-widest">
                        {day}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${dayRecipes.length > 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-neutral-100 text-neutral-400"
                        }`}>
                        {dayRecipes.length} MEALS
                      </span>
                    </div>

                    <div className="text-[10px] text-neutral-500 font-light truncate mt-1">
                      {dayRecipes.length > 0 ? (
                        dayRecipes.map((r) => r.recipe.title).join(", ")
                      ) : (
                        <span className="text-neutral-300 italic uppercase tracking-wider">Unscheduled</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-neutral-200/80 p-6 md:p-8 rounded-xl shadow-xs">

            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-950 uppercase tracking-[0.2em] font-sans">
                  {activeDay}&apos;s Agenda
                </h2>
                <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] mt-1 font-semibold">
                  Scheduled meals and recipes
                </p>
              </div>
              <span className="text-[9px] font-extrabold text-[#A94420] tracking-[0.25em] bg-[#A94420]/5 px-3 py-1.5 border border-[#A94420]/15 rounded-md uppercase">
                {getDayRecipes(activeDay).length} Scheduled
              </span>
            </div>

            <div className="space-y-6">
              {MEAL_TYPES.map((meal) => {
                const items = mealPlan.recipes.filter(
                  (r) => r.day === activeDay && r.mealType === meal
                );

                return (
                  <div key={meal} className="group/slot flex flex-col md:flex-row md:items-start gap-4 p-4 border border-neutral-100 hover:border-neutral-200 rounded-xl hover:bg-neutral-50/20 transition-all">

                    <div className="md:w-28 shrink-0 py-1.5">
                      <span className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-[0.2em] block">
                        {meal}
                      </span>
                    </div>

                    <div className="grow">
                      {items.length === 0 ? (
                        <button
                          onClick={() => handleOpenAddPanelForSlot(activeDay, meal)}
                          className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors tracking-[0.15em] uppercase py-2 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-neutral-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Schedule {meal}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="group/item flex flex-col sm:flex-row bg-white border border-neutral-200/80 rounded-lg overflow-hidden hover:border-neutral-900 transition-all duration-300 shadow-2xs hover:shadow-xs relative"
                            >

                              <div className="relative w-full sm:w-44 aspect-video sm:h-28 overflow-hidden bg-neutral-50 shrink-0 border-b sm:border-b-0 sm:border-r border-neutral-150">
                                <img
                                  src={item.recipe.imageUrl || "/images/recipes/classic-pancakes.jpg"}
                                  alt={item.recipe.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                                />
                              </div>

                              {/* Right Side: Recipe metadata & Actions */}
                              <div className="p-4 flex flex-col justify-between grow">
                                <div className="text-left">
                                  <Link
                                    href={`/recipes/${item.recipe.id}`}
                                    className="text-xs font-extrabold text-neutral-950 hover:text-[#A94420] transition-colors uppercase tracking-wider line-clamp-1"
                                  >
                                    {item.recipe.title}
                                  </Link>

                                  {/* Ingredient count or metadata details */}
                                  <div className="mt-2 flex flex-wrap gap-2 items-center text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                    <span>
                                      {item.recipe.ingredients ? item.recipe.ingredients.length : 0} Ingredients
                                    </span>
                                    <span className="text-neutral-200">•</span>
                                    <Link
                                      href={`/recipes/${item.recipe.id}`}
                                      className="text-neutral-500 hover:text-neutral-850 hover:underline"
                                    >
                                      View Recipe Details &rarr;
                                    </Link>
                                  </div>
                                </div>

                                {/* Absolute/Flex Delete control */}
                                <div className="flex justify-end mt-3 sm:mt-0">
                                  <button
                                    onClick={() => handleRemoveRecipe(item.id)}
                                    className="text-[9px] font-bold text-neutral-450 hover:text-rose-700 transition-colors uppercase tracking-widest cursor-pointer flex items-center gap-1"
                                    title="Remove meal"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Remove
                                  </button>
                                </div>

                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* Elegant confirmation modal for deleting recipes */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDeleteTargetId(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2 font-sans">
                Remove Recipe
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Are you sure you want to remove this recipe from your meal plan?
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 px-4 py-2.5 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer font-sans"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToRemove = deleteTargetId;
                  setDeleteTargetId(null);
                  executeRemoveRecipe(idToRemove);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-rose-600 cursor-pointer shadow-xs font-sans"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Warning Modal for Duplicates */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDuplicateModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="mx-auto w-12 h-12 border border-amber-300 text-amber-600 flex items-center justify-center rounded-full bg-amber-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2 font-sans">
                Recipe Already Scheduled
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                This recipe is already scheduled for this day and meal category.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-neutral-900 cursor-pointer shadow-xs font-sans"
              >
                UNDERSTOOD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
