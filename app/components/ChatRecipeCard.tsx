"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="w-full max-w-md bg-white border border-neutral-200/60 rounded-none flex flex-col hover:border-neutral-900 transition-all duration-300 group shadow-xs overflow-hidden animate-in fade-in">

      {/* Recipe Header Banner Image (same aspect and look as catalog card) */}
      <div className="relative aspect-16/10 overflow-hidden rounded-none border-b border-neutral-100">
        <img
          src={recipe.imageUrl || "/images/recipes/default.jpg"}
          alt={recipe.title}
          className="w-full h-full object-cover rounded-none group-hover:scale-102 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Subtle overlay logo badge */}
        <div className="absolute top-4 left-4 backdrop-blur-md bg-white/70 border border-neutral-200/40 px-2.5 py-1 rounded-none flex items-center gap-1.5 shadow-sm">
          <ChefLogo size={12} href={null} />
          <span className="text-[8px] text-neutral-800 font-bold uppercase tracking-wider">Chef Created</span>
        </div>
      </div>

      <div className="p-6 flex flex-col text-left">

        {/* Category & Tags - matching RecipeCard styles */}
        <div className="text-[9px] font-bold text-[#A94420] tracking-[0.25em] uppercase mb-2">
          {recipe.cuisine ? `${recipe.cuisine} ` : ""}
          {dietaryTagsArray.length > 0 ? `• ${dietaryTagsArray[0]}` : ""}
        </div>

        {/* Title */}
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-base font-bold text-neutral-900 hover:text-neutral-500 tracking-wider transition-colors mb-2 uppercase">
            {recipe.title}
          </h3>
        </Link>

        {/* Tab Navigation styled to match the minimalist app identity */}
        <div className="flex border-b border-neutral-200 mt-4 mb-5">
          {(["overview", "ingredients", "steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 -mb-[2px] transition-all cursor-pointer ${activeTab === tab
                  ? "text-[#A94420] border-[#A94420]"
                  : "text-neutral-400 border-transparent hover:text-neutral-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="min-h-[120px]">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-neutral-500 leading-relaxed font-light mb-6">
                {recipe.description || "No description provided."}
              </p>

              {/* Specs bar matching catalog details specs */}
              <div className="flex flex-wrap items-center gap-2 text-[8.5px] font-semibold tracking-[0.12em] text-neutral-400 uppercase border-t border-neutral-100 pt-4 mb-4">
                <span>PREP: {recipe.prepTime}M</span>
                <span className="text-neutral-200">|</span>
                <span>COOK: {recipe.cookTime}M</span>
                <span className="text-neutral-200">|</span>
                <span>{recipe.servings} SERVINGS</span>
                {recipe.calories && (
                  <>
                    <span className="text-neutral-200">|</span>
                    <span className="text-[#A94420] font-bold">{recipe.calories} KCAL</span>
                  </>
                )}
              </div>

              {/* View details button */}
              <Link
                href={`/recipes/${recipe.id}`}
                className="block text-center bg-neutral-950 hover:bg-neutral-800 text-white py-3 text-[9px] font-bold tracking-[0.2em] uppercase rounded-none transition-colors duration-200 border border-neutral-950"
              >
                VIEW FULL DETAILS
              </Link>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Ingredients Checklist
              </div>
              <div className="grid grid-cols-1 gap-2">
                {recipe.ingredients.length === 0 && (
                  <p className="text-xs text-neutral-400 italic">No ingredients listed.</p>
                )}
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleIngredient(idx)}
                      className={`flex items-center gap-3 py-2 px-3 border border-neutral-150 rounded-none cursor-pointer transition-colors ${isChecked
                          ? "bg-neutral-50 text-neutral-400 line-through border-neutral-150"
                          : "bg-white text-neutral-700 hover:bg-neutral-50/50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-3.5 h-3.5 text-neutral-900 border-neutral-300 rounded-none focus:ring-neutral-950"
                      />
                      <span className="text-xs">
                        <span className={isChecked ? "text-neutral-400" : "text-[#A94420] font-bold mr-1"}>
                          {ing.amount} {ing.unit}
                        </span>
                        <span>{ing.name}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Steps Tab */}
          {activeTab === "steps" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Preparation Steps
              </div>
              {stepsArray.length === 0 && (
                <p className="text-xs text-neutral-400 italic">No preparation steps specified.</p>
              )}
              <div className="space-y-3">
                {stepsArray.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="w-5 h-5 border border-neutral-300 flex items-center justify-center text-[10px] text-neutral-800 font-bold rounded-none shrink-0 mt-0.5 select-none">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed font-light">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
