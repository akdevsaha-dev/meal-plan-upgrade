"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState, useEffect, use } from "react";
import Link from "next/link";

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!mealPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
          <p className="text-gray-400 text-xs font-semibold">Loading planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-b from-white to-gray-50/70 font-sans text-gray-900">
      <div
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />

      <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto">

        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
          <Link href="/meal-plans" className="hover:text-orange-600 transition-colors uppercase tracking-wider">
            Meal Plans
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 uppercase tracking-wider">{mealPlan.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              {mealPlan.name}
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              {formatDate(mealPlan.startDate)} – {formatDate(mealPlan.endDate)}
            </p>
          </div>
          <button
            onClick={() => setIsAddPanelOpen(!isAddPanelOpen)}
            className="self-start md:self-center bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Recipe
          </button>
        </div>

        {isAddPanelOpen && (
          <form
            onSubmit={handleAddRecipe}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md mb-8 animate-in slide-in-from-top-4 duration-200 ease-out space-y-4 max-w-4xl"
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Add Recipe to Plan</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Select a recipe, day of the week, and type of meal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Meal Category</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Choose Recipe</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPanelOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add to Plan"}
              </button>
            </div>
          </form>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs h-fit space-y-4 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 capitalize tracking-tight">
                {day}
              </h3>

              <div className="space-y-4">
                {MEAL_TYPES.map((meal) => {
                  const items = mealPlan.recipes.filter(
                    (r) => r.day === day && r.mealType === meal
                  );
                  return (
                    <div key={meal} className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                        {meal}
                      </span>

                      {items.length === 0 ? (
                        <div className="border border-dashed border-gray-100 rounded-xl bg-gray-50/30 py-3 text-center text-[10px] text-gray-300 font-medium italic">
                          No meal
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="group/item flex items-center justify-between gap-1.5 bg-gray-50/70 border border-gray-100 rounded-xl p-1.5 hover:bg-white hover:border-gray-200 transition-all shadow-xs"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <img
                                  src={item.recipe.imageUrl || "/images/recipes/classic-pancakes.jpg"}
                                  alt=""
                                  className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                                />
                                <Link
                                  href={`/recipes/${item.recipe.id}`}
                                  className="text-xs font-bold text-gray-800 hover:text-orange-600 transition-colors truncate block"
                                >
                                  {item.recipe.title}
                                </Link>
                              </div>
                              <button
                                onClick={() => handleRemoveRecipe(item.id)}
                                className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-650 hover:bg-red-50 p-1 rounded-md transition-all cursor-pointer flex-shrink-0"
                                title="Remove meal"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
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
