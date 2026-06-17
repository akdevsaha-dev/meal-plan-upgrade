"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import Link from "next/link";
import { useState, useEffect, use } from "react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number | null;
  cuisine: string | null;
  dietaryTags: string | null;
  steps?: string | null;
  ingredients: { id: string; name: string; amount: string; unit: string }[];
  user: { name: string; email: string };
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/recipes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setRecipe(data.recipe));
  }, [id]);

  function toggleIngredient(ingredientId: string) {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ingredientId]: !prev[ingredientId],
    }));
  }

  let stepsArray: string[] = [];
  if (recipe?.steps) {
    try {
      stepsArray = JSON.parse(recipe.steps);
    } catch (e) {
      console.error("Failed to parse recipe steps JSON:", e);
    }
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm font-semibold">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans">
      <div className="absolute inset-0 z-0 bg-gray-50" aria-hidden />
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />

      <div className="relative z-10 mx-auto max-w-5xl p-6 lg:p-10">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors mb-6 group cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Recipes
        </Link>

        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden shadow-md border border-gray-50 bg-stone-100 hover:scale-[1.01] transition-transform duration-300">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.cuisine && (
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-100 shadow-3xs">
                    {recipe.cuisine}
                  </span>
                )}
                {recipe.dietaryTags && recipe.dietaryTags.split(",").map((tag) => (
                  <span
                    key={tag}
                    className="bg-lime-50 text-lime-700 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-lime-100 shadow-3xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight flex items-center gap-2 flex-wrap">
                <ChefLogo size={32} />
                {recipe.title}
              </h1>

              <p className="text-gray-500 text-sm lg:text-base leading-relaxed mb-6 font-medium">
                {recipe.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4.5 rounded-2xl border border-gray-100/70 shadow-3xs">
                <div className="flex flex-col items-center text-center p-2.5 border-r border-gray-200/50 last:border-none">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Prep Time</span>
                  <span className="text-base font-black text-gray-800 mt-1.5">{recipe.prepTime}m</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 border-r border-gray-200/50 last:border-none">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Cook Time</span>
                  <span className="text-base font-black text-gray-800 mt-1.5">{recipe.cookTime}m</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 border-r border-gray-200/50 last:border-none">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Servings</span>
                  <span className="text-base font-black text-gray-800 mt-1.5">{recipe.servings}</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 last:border-none">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Calories</span>
                  <span className="text-base font-black text-orange-600 mt-1.5">{recipe.calories ? `${recipe.calories} kcal` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Ingredients Checklist</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Tap ingredients as you gather them</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                return (
                  <label
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-center gap-3.5 p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${isChecked
                        ? "bg-gray-50/70 border-gray-200/60 text-gray-400 line-through"
                        : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 shadow-3xs"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4.5 h-4.5 text-orange-600 bg-gray-50 border-gray-300 rounded-md focus:ring-orange-500 focus:ring-2 cursor-pointer transition-all"
                    />
                    <div>
                      <span className={`font-extrabold ${isChecked ? "text-gray-400" : "text-orange-600"}`}>
                        {ing.amount} {ing.unit}
                      </span>{" "}
                      <span className="font-semibold text-sm">{ing.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Instructions / Steps */}
          {stepsArray.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.732 2.076 1.717m-1.123 18.003L18 21.75a2.25 2.25 0 0 0 2.25-2.25V6.25M3 3h2.25m0 0H3.75m1.5 0h.008v.008H5.25V3zm0 3h2.25m0 0H5.25m1.5 0h.008v.008H6.75V6zm0 3h2.25m0 0H6.75m1.5 0h.008v.008H8.25V9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">Instructions / Steps</h2>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Follow step-by-step to cook the recipe</p>
                </div>
              </div>

              <div className="space-y-4">
                {stepsArray.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4.5 bg-gray-50/50 border border-gray-100/70 rounded-2xl">
                    <div className="flex items-center justify-center w-6.5 h-6.5 rounded-full bg-orange-100 text-orange-600 text-xs font-black shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Created by {recipe.user.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
