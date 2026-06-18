"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

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
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
          <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">RETRIEVING CULINARY DETAILS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#FAF9F6] text-[#111111]`}>
      <div className="mx-auto max-w-5xl px-6 sm:px-12 py-12 lg:py-16">

        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          BACK TO RECIPES
        </Link>

        <div className="bg-white border border-neutral-200/60 p-6 lg:p-10 rounded-none shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            <div className="lg:col-span-5">
              <div className="relative aspect-square lg:aspect-auto lg:h-[400px] border border-neutral-100 bg-[#FAF9F6] rounded-none overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover rounded-none"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center text-left">

              <div className="text-[9px] font-bold text-[#A94420] tracking-[0.25em] uppercase mb-3">
                {recipe.cuisine ? `${recipe.cuisine} ` : ""}
                {recipe.cuisine && recipe.dietaryTags ? "• " : ""}
                {recipe.dietaryTags ? recipe.dietaryTags.split(",").join(" • ") : ""}
              </div>

              <h1 className="text-2xl lg:text-3.5xl font-extrabold text-neutral-900 leading-tight mb-4 tracking-wider uppercase">
                {recipe.title}
              </h1>

              <p className="text-xs text-neutral-500 leading-relaxed mb-8 font-light">
                {recipe.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF9F6] border border-neutral-200/80 p-5 rounded-none">
                <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200 last:border-none">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">PREP TIME</span>
                  <span className="text-sm font-bold text-neutral-800 mt-1.5">{recipe.prepTime}M</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200 last:border-none">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">COOK TIME</span>
                  <span className="text-sm font-bold text-neutral-800 mt-1.5">{recipe.cookTime}M</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200 last:border-none">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">SERVINGS</span>
                  <span className="text-sm font-bold text-neutral-800 mt-1.5">{recipe.servings}</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 last:border-none">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">CALORIES</span>
                  <span className="text-sm font-bold text-[#A94420] mt-1.5">{recipe.calories ? `${recipe.calories} KCAL` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200/60 text-left">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2 border border-neutral-300 text-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">INGREDIENTS CHECKLIST</h2>
                <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">TAP TO ACCUMULATE INGREDIENTS</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                return (
                  <label
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-center gap-4 p-4 border transition-all duration-200 cursor-pointer select-none rounded-none ${isChecked
                      ? "bg-[#FAF9F6]/50 border-neutral-200/50 text-neutral-400 line-through"
                      : "bg-white border-neutral-200/80 text-neutral-800 hover:border-neutral-400"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4 h-4 text-neutral-900 bg-gray-50 border-neutral-300 rounded-none focus:ring-0 focus:ring-offset-0 cursor-pointer accent-neutral-900"
                    />
                    <div className="text-xs">
                      <span className={`font-bold uppercase tracking-wider ${isChecked ? "text-neutral-400" : "text-[#A94420]"}`}>
                        {ing.amount} {ing.unit}
                      </span>{" "}
                      <span className="font-semibold tracking-wide">{ing.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {stepsArray.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200/60 text-left">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="p-2 border border-neutral-300 text-neutral-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.732 2.076 1.717m-1.123 18.003L18 21.75a2.25 2.25 0 0 0 2.25-2.25V6.25M3 3h2.25m0 0H3.75m1.5 0h.008v.008H5.25V3zm0 3h2.25m0 0H5.25m1.5 0h.008v.008H6.75V6zm0 3h2.25m0 0H6.75m1.5 0h.008v.008H8.25V9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">INSTRUCTIONS / STEPS</h2>
                  <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">FOLLOW STEPS TO EXECUTE PREPARATION</p>
                </div>
              </div>

              <div className="space-y-4">
                {stepsArray.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-[#FAF9F6]/55 border border-neutral-200/80 rounded-none">
                    <div className="flex items-center justify-center w-7 h-7 bg-neutral-900 text-[#FAF9F6] text-[10px] font-bold shrink-0 rounded-none">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed font-semibold tracking-wide">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em] text-left">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-neutral-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              CURATED BY {recipe.user.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
