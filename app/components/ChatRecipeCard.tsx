"use client";

import { useState } from "react";
import ChefLogo from "./ChefLogo";

export interface RecipeIngredient {
  id?: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
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
  ingredients: RecipeIngredient[];
}

interface ChatRecipeCardProps {
  recipe: Recipe;
}

type TabType = "overview" | "ingredients" | "steps";

export default function ChatRecipeCard({ recipe }: ChatRecipeCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  let stepsArray: string[] = [];
  if (recipe.steps) {
    try {
      stepsArray = JSON.parse(recipe.steps);
    } catch (e) {
      console.error("Failed to parse recipe steps JSON:", e);
    }
  }

  const dietaryTagsArray = recipe.dietaryTags
    ? recipe.dietaryTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  function toggleIngredient(index: number) {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

      {/* Recipe Header Banner Image */}
      <div className="relative h-44 sm:h-52 w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
        <img
          src={recipe.imageUrl || "/images/recipes/default.jpg"}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

        {/* Floating brand indicator */}
        <div className="absolute top-4 left-4 backdrop-blur-md bg-white/10 border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <ChefLogo size={14} href={null} />
          <span className="text-[9px] text-white font-bold uppercase tracking-wider">Chef Created</span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs leading-tight">
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
        {(["overview", "ingredients", "steps"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer ${activeTab === tab
              ? "text-orange-600 border-orange-500 dark:text-orange-400 dark:border-orange-400"
              : "text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Card Body Content */}
      <div className="p-6">

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
              {recipe.description || "No description provided."}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50/55 dark:bg-neutral-950/30 p-3.5 rounded-2xl border border-neutral-100/50 dark:border-neutral-800/60 shadow-3xs">
              <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200/50 dark:border-neutral-800/50 last:border-none">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Prep</span>
                <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{recipe.prepTime}m</span>
              </div>
              <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200/50 dark:border-neutral-800/50 last:border-none">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Cook</span>
                <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{recipe.cookTime}m</span>
              </div>
              <div className="flex flex-col items-center text-center p-1.5 border-r border-neutral-200/50 dark:border-neutral-800/50 last:border-none">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Servings</span>
                <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{recipe.servings}</span>
              </div>
              <div className="flex flex-col items-center text-center p-1.5 last:border-none">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Calories</span>
                <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 mt-1">{recipe.calories ? `${recipe.calories} kcal` : "--"}</span>
              </div>
            </div>

            {/* Cuisine & Dietary Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              {recipe.cuisine && (
                <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-100/50 dark:border-orange-900/30">
                  Cuisine: {recipe.cuisine}
                </span>
              )}
              {dietaryTagsArray.map((tag) => (
                <span
                  key={tag}
                  className="bg-lime-50 dark:bg-lime-950/20 text-lime-700 dark:text-lime-400 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-lime-100/50 dark:border-lime-900/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients Tab Content */}
        {activeTab === "ingredients" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Ingredients Checklist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.length === 0 && (
                <p className="text-xs text-neutral-400 italic">No ingredients listed.</p>
              )}
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${isChecked
                      ? "bg-neutral-50/60 dark:bg-neutral-950/20 border-neutral-200/50 dark:border-neutral-900/40 text-neutral-400 dark:text-neutral-500 line-through"
                      : "bg-white dark:bg-neutral-900/40 border-neutral-200/70 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4 h-4 text-orange-600 bg-neutral-50 border-neutral-300 rounded focus:ring-orange-500 cursor-pointer transition-all"
                    />
                    <div className="text-xs font-semibold">
                      <span className={isChecked ? "text-neutral-400" : "text-orange-500 dark:text-orange-400 font-bold"}>
                        {ing.amount} {ing.unit}
                      </span>{" "}
                      <span>{ing.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Steps Tab Content */}
        {activeTab === "steps" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Instructions Steps</span>
            </div>

            {stepsArray.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No preparation steps specified.</p>
            )}

            <div className="space-y-3.5">
              {stepsArray.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100/50 dark:border-neutral-900/40 rounded-2xl"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-black shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
